import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = parseInt(searchParams.get("categoryId"));

    if (!categoryId || isNaN(categoryId)) {
      return NextResponse.json(
        { error: "Invalid category ID" },
        { status: 400 }
      );
    }

    // Get a random product from the category
    const products = await prisma.product.findMany({
      where: {
        categoryId: categoryId,
        mainImage: {
          not: null,
        },
      },
      select: {
        mainImage: true,
      },
      take: 1,
      orderBy: {
        id: "desc",
      },
    });

    if (products.length === 0) {
      return NextResponse.json(
        { error: "No products found in this category" },
        { status: 404 }
      );
    }

    return NextResponse.json({ image: products[0].mainImage });
  } catch (error) {
    console.error("Error fetching random product:", error);
    return NextResponse.json(
      { error: "Failed to fetch random product" },
      { status: 500 }
    );
  }
}
