import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyJwtEdge } from "@/utils/jwtEdge";

export async function POST(request) {
  try {
    const token = request.cookies.get("token");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyJwtEdge(token.value);
    if (!decoded || decoded.role.toLowerCase() !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fromCategoryId, toCategoryId } = await request.json();

    if (!fromCategoryId || !toCategoryId) {
      return NextResponse.json(
        { error: "Both category IDs are required" },
        { status: 400 }
      );
    }

    // Verify that both categories exist
    const [fromCategory, toCategory] = await Promise.all([
      prisma.category.findUnique({ where: { id: fromCategoryId } }),
      prisma.category.findUnique({ where: { id: toCategoryId } }),
    ]);

    if (!fromCategory || !toCategory) {
      return NextResponse.json(
        { error: "One or both categories not found" },
        { status: 404 }
      );
    }

    // Move all products from one category to another
    await prisma.product.updateMany({
      where: { categoryId: fromCategoryId },
      data: { categoryId: toCategoryId },
    });

    return NextResponse.json({
      message: "Products moved successfully",
    });
  } catch (error) {
    console.error("Error moving products:", error);
    return NextResponse.json(
      { error: "Failed to move products" },
      { status: 500 }
    );
  }
}
