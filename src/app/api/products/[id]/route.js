import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    console.log("[Product API] Fetching product with ID:", id);

    if (!id || isNaN(parseInt(id))) {
      console.error("[Product API] Invalid product ID:", id);
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        image: true,
        color: true,
        size: true,
        brand: true,
        stockQuantity: true,
        averageRating: true,
        reviewCount: true,
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
            comment: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!product) {
      console.error("[Product API] Product not found:", id);
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    console.log("[Product API] Product found:", product.id);
    return NextResponse.json(product);
  } catch (error) {
    console.error("[Product API Error]:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch product",
        details: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
