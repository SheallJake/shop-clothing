import { verifyJwt } from "@/util/jwt";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// GET /api/cart - Get user's cart
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyJwt(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const cart = await db.cart.findMany({
      where: { userId: payload.userId },
      include: {
        product: true,
      },
    });

    return NextResponse.json(cart);
  } catch (error) {
    console.error("[Cart Error]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/cart - Add item to cart
export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyJwt(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await req.json();
    const { productId, quantity } = body;

    if (!productId || !quantity) {
      return NextResponse.json(
        { error: "Product ID and quantity are required" },
        { status: 400 }
      );
    }

    // Check if product exists
    const product = await db.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if item already exists in cart
    const existingCartItem = await db.cart.findFirst({
      where: {
        userId: payload.userId,
        productId: productId,
      },
    });

    let cartItem;
    if (existingCartItem) {
      // Update quantity if item exists
      cartItem = await db.cart.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + quantity },
        include: { product: true },
      });
    } else {
      // Create new cart item
      cartItem = await db.cart.create({
        data: {
          userId: payload.userId,
          productId,
          quantity,
        },
        include: { product: true },
      });
    }

    return NextResponse.json(cartItem);
  } catch (error) {
    console.error("[Cart Error]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/cart - Remove item from cart
export async function DELETE(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyJwt(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const cartItem = await db.cart.findFirst({
      where: {
        userId: payload.userId,
        productId: parseInt(productId),
      },
    });

    if (!cartItem) {
      return NextResponse.json(
        { error: "Cart item not found" },
        { status: 404 }
      );
    }

    await db.cart.delete({
      where: { id: cartItem.id },
    });

    return NextResponse.json({ message: "Item removed from cart" });
  } catch (error) {
    console.error("[Cart Error]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
