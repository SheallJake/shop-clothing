import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyJwt } from "@/utils/jwt";
import { cookies } from "next/headers";

// GET /api/wishlist - Get user's wishlist
export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyJwt(token.value);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const wishlist = await prisma.wishlist.findMany({
      where: { userId: decoded.userId },
      include: {
        product: true,
      },
    });

    return NextResponse.json(wishlist);
  } catch (error) {
    console.error("[Wishlist API Error]:", error);
    return NextResponse.json(
      { error: "Failed to fetch wishlist" },
      { status: 500 }
    );
  }
}

// POST /api/wishlist - Add item to wishlist
export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyJwt(token.value);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if already in wishlist
    const existingItem = await prisma.wishlist.findFirst({
      where: {
        userId: decoded.userId,
        productId: parseInt(productId),
      },
    });

    if (existingItem) {
      return NextResponse.json(
        { error: "Product already in wishlist" },
        { status: 400 }
      );
    }

    const wishlistItem = await prisma.wishlist.create({
      data: {
        userId: decoded.userId,
        productId: parseInt(productId),
      },
      include: {
        product: true,
      },
    });

    return NextResponse.json(wishlistItem);
  } catch (error) {
    console.error("[Wishlist API Error]:", error);
    return NextResponse.json(
      { error: "Failed to add to wishlist" },
      { status: 500 }
    );
  }
}

// DELETE /api/wishlist - Remove item from wishlist
export async function DELETE(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyJwt(token.value);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Get productId from URL search params
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Check if item exists in wishlist
    const existingItem = await prisma.wishlist.findFirst({
      where: {
        userId: decoded.userId,
        productId: parseInt(productId),
      },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: "Item not found in wishlist" },
        { status: 404 }
      );
    }

    await prisma.wishlist.deleteMany({
      where: {
        userId: decoded.userId,
        productId: parseInt(productId),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Wishlist API Error]:", error);
    return NextResponse.json(
      { error: "Failed to remove from wishlist" },
      { status: 500 }
    );
  }
}
