import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const discountedProducts = await prisma.product.findMany({
      where: {
        isDiscountActive: true,
        discountPrice: {
          not: null,
        },
      },
      take: 4, // Limit to 4 products
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

    return NextResponse.json(discountedProducts);
  } catch (error) {
    console.error("[Discounted Products API Error]:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch discounted products",
        details: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
