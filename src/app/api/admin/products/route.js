import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyJwtEdge } from "@/utils/jwtEdge";

// GET /api/admin/products
export async function GET(req) {
  try {
    // Отримуємо токен з кукі
    const token = req.cookies.get("token");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Перевіряємо токен
    const decoded = await verifyJwtEdge(token.value);
    if (!decoded || decoded.role.toLowerCase() !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("query") || "";
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        include: {
          category: true,
        },
        skip,
        take: limit,
      }),
      prisma.product.count({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
      }),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("Products GET error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/products
export async function POST(req) {
  try {
    const token = req.cookies.get("token");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyJwtEdge(token.value);
    if (!decoded || decoded.role.toLowerCase() !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    // Validate required fields
    if (!data.name || !data.price || !data.categoryId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        stockQuantity: parseInt(data.stockQuantity) || 0,
        categoryId: data.categoryId,
        color: data.color || [],
        size: data.size,
        brand: data.brand,
        mainImage: data.mainImage,
        galleryImages: data.galleryImages || [],
        discountPrice: data.discountPrice
          ? parseFloat(data.discountPrice)
          : null,
        isDiscountActive: data.isDiscountActive || false,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Products POST error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/products
export async function PATCH(req) {
  try {
    const token = req.cookies.get("token");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyJwtEdge(token.value);
    if (!decoded || decoded.role.toLowerCase() !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    if (!data.id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const product = await prisma.product.update({
      where: { id: data.id },
      data: {
        name: data.name,
        description: data.description,
        price: data.price ? parseFloat(data.price) : undefined,
        stockQuantity: data.stockQuantity
          ? parseInt(data.stockQuantity)
          : undefined,
        categoryId: data.categoryId,
        color: data.color,
        size: data.size,
        brand: data.brand,
        mainImage: data.mainImage,
        galleryImages: data.galleryImages,
        discountPrice: data.discountPrice
          ? parseFloat(data.discountPrice)
          : null,
        isDiscountActive: data.isDiscountActive,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Products PATCH error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/products
export async function DELETE(req) {
  try {
    const token = req.cookies.get("token");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyJwtEdge(token.value);
    if (!decoded || decoded.role.toLowerCase() !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Products DELETE error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
