import prisma from "@/lib/prisma";

/**
 * Поиск товаров по запросу для ассистента
 */
export async function searchProducts(query, limit = 10) {
  try {
    if (!query || !query.trim()) {
      return [];
    }

    const searchQuery = query
      .trim()
      .split(/\s+/)
      .map((term) => `${term}:*`)
      .join(" & ");

    const sqlQuery = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.brand,
        p.price,
        p."mainImage",
        p."stockQuantity",
        p.color,
        p.size,
        p."isDiscountActive",
        p."discountPrice",
        p."averageRating",
        p."reviewCount",
        c.name as "categoryName"
      FROM "Product" p
      LEFT JOIN "Category" c ON p."categoryId" = c.id
      WHERE p."searchVector" @@ to_tsquery('russian', $1)
      ORDER BY ts_rank_cd(p."searchVector", to_tsquery('russian', $1)) DESC
      LIMIT ${limit}
    `;

    const products = await prisma.$queryRawUnsafe(sqlQuery, searchQuery);

    return products.map((product) => {
      // Создаем фиктивные reviews для ProductCard на основе averageRating
      const reviews = [];
      if (product.averageRating > 0 && product.reviewCount > 0) {
        const rating = Math.round(product.averageRating);
        for (let i = 0; i < Math.min(product.reviewCount, 5); i++) {
          reviews.push({ rating });
        }
      }
      
      return {
        id: product.id,
        name: product.name,
        description: product.description || "",
        brand: product.brand || "",
        price: product.price,
        discountPrice: product.discountPrice,
        isDiscountActive: product.isDiscountActive || false,
        stockQuantity: product.stockQuantity,
        color: product.color || [],
        size: product.size || "",
        category: product.categoryName || "",
        averageRating: product.averageRating || 0,
        reviewCount: product.reviewCount || 0,
        mainImage: product.mainImage || "", // ProductCard ожидает mainImage
        reviews, // Фиктивные reviews для расчета рейтинга
      };
    });
  } catch (error) {
    console.error("Ошибка поиска товаров:", error);
    return [];
  }
}

/**
 * Получить товары по категории
 */
export async function getProductsByCategory(categoryName, limit = 10) {
  try {
    const products = await prisma.product.findMany({
      where: {
        category: {
          name: {
            contains: categoryName,
            mode: "insensitive",
          },
        },
      },
      take: limit,
      select: {
        id: true,
        name: true,
        description: true,
        brand: true,
        price: true,
        discountPrice: true,
        isDiscountActive: true,
        stockQuantity: true,
        color: true,
        size: true,
        mainImage: true,
        averageRating: true,
        reviewCount: true,
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    return products.map((product) => {
      // Создаем фиктивные reviews для ProductCard на основе averageRating
      const reviews = [];
      if (product.averageRating > 0 && product.reviewCount > 0) {
        const rating = Math.round(product.averageRating);
        for (let i = 0; i < Math.min(product.reviewCount, 5); i++) {
          reviews.push({ rating });
        }
      }
      
      return {
        id: product.id,
        name: product.name,
        description: product.description || "",
        brand: product.brand || "",
        price: product.price,
        discountPrice: product.discountPrice,
        isDiscountActive: product.isDiscountActive || false,
        stockQuantity: product.stockQuantity,
        color: product.color || [],
        size: product.size || "",
        category: product.category?.name || "",
        averageRating: product.averageRating || 0,
        reviewCount: product.reviewCount || 0,
        mainImage: product.mainImage || "", // ProductCard ожидает mainImage
        reviews, // Фиктивные reviews для расчета рейтинга
      };
    });
  } catch (error) {
    console.error("Ошибка получения товаров по категории:", error);
    return [];
  }
}

/**
 * Получить все категории
 */
export async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        description: true,
      },
    });
    return categories;
  } catch (error) {
    console.error("Ошибка получения категорий:", error);
    return [];
  }
}

/**
 * Получить товар по ID
 */
export async function getProductById(id) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        name: true,
        description: true,
        brand: true,
        price: true,
        discountPrice: true,
        isDiscountActive: true,
        stockQuantity: true,
        color: true,
        size: true,
        mainImage: true,
        galleryImages: true,
        averageRating: true,
        reviewCount: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        reviews: {
          take: 5,
          orderBy: {
            createdAt: "desc",
          },
          select: {
            rating: true,
            comment: true,
            createdAt: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!product) return null;

    return {
      id: product.id,
      name: product.name,
      description: product.description || "",
      brand: product.brand || "",
      price: product.price,
      discountPrice: product.discountPrice,
      isDiscountActive: product.isDiscountActive || false,
      stockQuantity: product.stockQuantity,
      color: product.color || [],
      size: product.size || "",
      category: product.category?.name || "",
      averageRating: product.averageRating || 0,
      reviewCount: product.reviewCount || 0,
      mainImage: product.mainImage || "", // ProductCard ожидает mainImage
      galleryImages: product.galleryImages || [],
      reviews: product.reviews || [],
    };
  } catch (error) {
    console.error("Ошибка получения товара:", error);
    return null;
  }
}

/**
 * Получить популярные товары (по рейтингу)
 */
export async function getPopularProducts(limit = 10) {
  try {
    const products = await prisma.product.findMany({
      where: {
        averageRating: {
          gte: 4.0,
        },
        reviewCount: {
          gt: 0,
        },
      },
      take: limit,
      orderBy: [
        { averageRating: "desc" },
        { reviewCount: "desc" },
      ],
      select: {
        id: true,
        name: true,
        description: true,
        brand: true,
        price: true,
        discountPrice: true,
        isDiscountActive: true,
        stockQuantity: true,
        mainImage: true,
        averageRating: true,
        reviewCount: true,
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    return products.map((product) => {
      // Создаем фиктивные reviews для ProductCard на основе averageRating
      const reviews = [];
      if (product.averageRating > 0 && product.reviewCount > 0) {
        const rating = Math.round(product.averageRating);
        for (let i = 0; i < Math.min(product.reviewCount, 5); i++) {
          reviews.push({ rating });
        }
      }
      
      return {
        id: product.id,
        name: product.name,
        description: product.description || "",
        brand: product.brand || "",
        price: product.price,
        discountPrice: product.discountPrice,
        isDiscountActive: product.isDiscountActive || false,
        stockQuantity: product.stockQuantity,
        color: product.color || [],
        size: product.size || "",
        category: product.category?.name || "",
        averageRating: product.averageRating || 0,
        reviewCount: product.reviewCount || 0,
        mainImage: product.mainImage || "", // ProductCard ожидает mainImage
        reviews, // Фиктивные reviews для расчета рейтинга
      };
    });
  } catch (error) {
    console.error("Ошибка получения популярных товаров:", error);
    return [];
  }
}

