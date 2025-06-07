import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    console.log(
      "[Related Products API] Fetching related products for product ID:",
      id
    );

    if (!id || isNaN(parseInt(id))) {
      console.error("[Related Products API] Invalid product ID:", id);
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    // Test database connection
    try {
      await prisma.$connect();
      console.log("[Related Products API] Database connection successful");
    } catch (dbError) {
      console.error(
        "[Related Products API] Database connection error:",
        dbError
      );
      return NextResponse.json(
        {
          error: "Database connection failed",
          details: dbError.message,
        },
        { status: 500 }
      );
    }

    // Get current product to determine category
    let currentProduct;
    try {
      currentProduct = await prisma.product.findUnique({
        where: { id: parseInt(id) },
        select: {
          categoryId: true,
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      console.log(
        "[Related Products API] Current product query result:",
        currentProduct
      );
    } catch (queryError) {
      console.error(
        "[Related Products API] Error fetching current product:",
        queryError
      );
      return NextResponse.json(
        {
          error: "Failed to fetch current product",
          details: queryError.message,
        },
        { status: 500 }
      );
    }

    if (!currentProduct) {
      console.error("[Related Products API] Product not found:", id);
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Get related products from the same category
    let relatedProducts;
    try {
      relatedProducts = await prisma.product.findMany({
        where: {
          categoryId: currentProduct.categoryId,
          id: { not: parseInt(id) }, // Exclude current product
        },
        take: 4, // Limit to 4 related products
        orderBy: {
          id: "desc", // Sort by ID as fallback since createdAt might not be available
        },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          mainImage: true,
          galleryImages: true,
          color: true,
          size: true,
          brand: true,
          stockQuantity: true,
          isDiscountActive: true,
          discountPrice: true,
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      console.log(
        "[Related Products API] Related products query result:",
        relatedProducts
      );
    } catch (queryError) {
      console.error(
        "[Related Products API] Error fetching related products:",
        queryError
      );
      return NextResponse.json(
        {
          error: "Failed to fetch related products",
          details: queryError.message,
        },
        { status: 500 }
      );
    }

    // If we have fewer than 4 related products, add more from other categories
    if (relatedProducts.length < 4) {
      let additionalProducts;
      try {
        additionalProducts = await prisma.product.findMany({
          where: {
            id: { not: parseInt(id) },
            categoryId: { not: currentProduct.categoryId },
          },
          take: 4 - relatedProducts.length,
          orderBy: {
            id: "desc", // Sort by ID as fallback
          },
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            mainImage: true,
            galleryImages: true,
            color: true,
            size: true,
            brand: true,
            stockQuantity: true,
            isDiscountActive: true,
            discountPrice: true,
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });
        console.log(
          "[Related Products API] Additional products query result:",
          additionalProducts
        );
      } catch (queryError) {
        console.error(
          "[Related Products API] Error fetching additional products:",
          queryError
        );
        return NextResponse.json(
          {
            error: "Failed to fetch additional products",
            details: queryError.message,
          },
          { status: 500 }
        );
      }

      const allProducts = [...relatedProducts, ...additionalProducts];
      console.log(
        "[Related Products API] Total products to return:",
        allProducts.length
      );
      return NextResponse.json(allProducts);
    }

    return NextResponse.json(relatedProducts);
  } catch (error) {
    console.error("[Related Products API Error]:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch related products",
        details: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  } finally {
    try {
      await prisma.$disconnect();
      console.log("[Related Products API] Database connection closed");
    } catch (disconnectError) {
      console.error(
        "[Related Products API] Error disconnecting from database:",
        disconnectError
      );
    }
  }
}
