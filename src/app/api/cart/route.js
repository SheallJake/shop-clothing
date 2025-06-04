import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyJwt } from "@/utils/jwt";
import { cookies } from "next/headers";

// GET /api/cart - Get user's cart
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

    const cart = await prisma.cart.findMany({
      where: { userId: decoded.userId },
      include: {
        product: true,
      },
    });

    return NextResponse.json(cart);
  } catch (error) {
    console.error("[Cart API Error]:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

// POST /api/cart - Add item to cart
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

    const { productId, quantity } = await request.json();

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

    // Check if item already in cart
    const existingItem = await prisma.cart.findFirst({
      where: {
        userId: decoded.userId,
        productId: parseInt(productId),
      },
    });

    if (existingItem) {
      // Update quantity if item exists
      const updatedItem = await prisma.cart.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + (parseInt(quantity) || 1),
        },
        include: {
          product: true,
        },
      });
      return NextResponse.json(updatedItem);
    }

    // Create new cart item
    const cartItem = await prisma.cart.create({
      data: {
        userId: decoded.userId,
        productId: parseInt(productId),
        quantity: parseInt(quantity) || 1,
      },
      include: {
        product: true,
      },
    });

    return NextResponse.json(cartItem);
  } catch (error) {
    console.error("[Cart API Error]:", error);
    return NextResponse.json(
      { error: "Failed to add to cart" },
      { status: 500 }
    );
  }
}

// DELETE /api/cart - Remove item from cart
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

    // Check if item exists in cart
    const existingItem = await prisma.cart.findFirst({
      where: {
        userId: decoded.userId,
        productId: parseInt(productId),
      },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: "Item not found in cart" },
        { status: 404 }
      );
    }

    await prisma.cart.deleteMany({
      where: {
        userId: decoded.userId,
        productId: parseInt(productId),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Cart API Error]:", error);
    return NextResponse.json(
      { error: "Failed to remove from cart" },
      { status: 500 }
    );
  }
}
