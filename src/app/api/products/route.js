import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        reviews: {
          select: {
            id: true,
            rating: true,
          },
        },
      },
    });

    // Transform the data to ensure consistent format
    const formattedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description || "",
      color: product.color || [],
      size: product.size || "",
      brand: product.brand || "",
      price: product.price,
      stockQuantity: product.stockQuantity,
      mainImage: product.mainImage || "",
      galleryImages: product.galleryImages || [],
      category: product.category
        ? {
            id: product.category.id,
            name: product.category.name,
          }
        : null,
      reviews: product.reviews,
      averageRating: product.averageRating,
      reviewCount: product.reviewCount,
      isDiscountActive: product.isDiscountActive || false,
      discountPrice: product.discountPrice || null,
    }));

    return Response.json(formattedProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    return Response.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
