import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyJwtEdge } from "@/utils/jwtEdge";

// Helper function to verify admin authentication
async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  if (!token) {
    return { isAuthenticated: false };
  }

  const decoded = await verifyJwtEdge(token.value);
  if (!decoded || decoded.role !== "admin") {
    return { isAuthenticated: false };
  }

  return { isAuthenticated: true };
}

// GET /api/admin/promocodes
export async function GET(request) {
  try {
    const { isAuthenticated } = await verifyAdmin();
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";

    const promoCodes = await prisma.promoCode.findMany({
      where: {
        code: {
          contains: query,
          mode: "insensitive",
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(promoCodes);
  } catch (error) {
    console.error("Error fetching promo codes:", error);
    return NextResponse.json(
      { error: "Failed to fetch promo codes" },
      { status: 500 }
    );
  }
}

// POST /api/admin/promocodes
export async function POST(request) {
  try {
    const { isAuthenticated } = await verifyAdmin();
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // Validate required fields
    if (
      !data.code ||
      !data.discountPercent ||
      !data.expirationDate ||
      !data.usageLimit
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if promo code already exists
    const existing = await prisma.promoCode.findUnique({
      where: { code: data.code },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Promo code already exists" },
        { status: 400 }
      );
    }

    const promoCode = await prisma.promoCode.create({
      data: {
        code: data.code,
        discountPercent: data.discountPercent,
        expirationDate: new Date(data.expirationDate),
        usageLimit: data.usageLimit,
        isActive: data.isActive,
      },
    });

    return NextResponse.json(promoCode);
  } catch (error) {
    console.error("Error creating promo code:", error);
    return NextResponse.json(
      { error: "Failed to create promo code" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/promocodes?id={id}
export async function PATCH(request) {
  try {
    const { isAuthenticated } = await verifyAdmin();
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const data = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "ID промокоду обов'язковий" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (
      !data.code ||
      !data.discountPercent ||
      !data.expirationDate ||
      !data.usageLimit
    ) {
      return NextResponse.json(
        { error: "Всі поля обов'язкові для заповнення" },
        { status: 400 }
      );
    }

    // Validate discount percent
    if (data.discountPercent < 0 || data.discountPercent > 100) {
      return NextResponse.json(
        { error: "Знижка повинна бути від 0 до 100%" },
        { status: 400 }
      );
    }

    // Validate usage limit
    if (data.usageLimit < 1) {
      return NextResponse.json(
        { error: "Ліміт використань повинен бути більше 0" },
        { status: 400 }
      );
    }

    // Validate expiration date
    const expirationDate = new Date(data.expirationDate);
    if (isNaN(expirationDate.getTime())) {
      return NextResponse.json(
        { error: "Невірний формат дати" },
        { status: 400 }
      );
    }

    // Check if promo code exists
    const existing = await prisma.promoCode.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: {
            orders: true,
            gameAttempts: true,
          },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Промокод не знайдено" },
        { status: 404 }
      );
    }

    // Check if new code already exists (if code is being changed)
    if (data.code !== existing.code) {
      const codeExists = await prisma.promoCode.findUnique({
        where: { code: data.code },
      });

      if (codeExists) {
        return NextResponse.json(
          { error: "Промокод з таким кодом вже існує" },
          { status: 400 }
        );
      }
    }

    // Check if trying to reduce usage limit below current usage
    const currentUsage = existing._count.orders + existing._count.gameAttempts;
    if (data.usageLimit < currentUsage) {
      return NextResponse.json(
        {
          error:
            "Новий ліміт використань не може бути меншим за поточну кількість використань",
        },
        { status: 400 }
      );
    }

    const promoCode = await prisma.promoCode.update({
      where: { id: parseInt(id) },
      data: {
        code: data.code,
        discountPercent: data.discountPercent,
        expirationDate: expirationDate,
        usageLimit: data.usageLimit,
        isActive: data.isActive,
      },
    });

    return NextResponse.json(promoCode);
  } catch (error) {
    console.error("Error updating promo code:", error);
    return NextResponse.json(
      { error: "Помилка при оновленні промокоду" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/promocodes?id={id}
export async function DELETE(request) {
  try {
    const token = request.cookies.get("token");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyJwtEdge(token.value);
    if (!decoded || decoded.role.toLowerCase() !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Promo code ID is required" },
        { status: 400 }
      );
    }

    const promoId = parseInt(id);
    if (isNaN(promoId)) {
      return NextResponse.json(
        { error: "Invalid promo code ID" },
        { status: 400 }
      );
    }

    // Check if promo code exists
    const existingPromo = await prisma.promoCode.findUnique({
      where: { id: promoId },
      include: {
        _count: {
          select: {
            orders: true,
            gameAttempts: true,
          },
        },
      },
    });

    if (!existingPromo) {
      return NextResponse.json(
        { error: "Промокод не знайдено" },
        { status: 404 }
      );
    }

    // Check if promo code is used in any orders
    if (existingPromo._count.orders > 0) {
      return NextResponse.json(
        {
          error:
            "Неможливо видалити промокод, який використовувався в замовленнях",
        },
        { status: 400 }
      );
    }

    // Check if promo code is used in any game attempts
    if (existingPromo._count.gameAttempts > 0) {
      return NextResponse.json(
        { error: "Неможливо видалити промокод, який використовувався в іграх" },
        { status: 400 }
      );
    }

    await prisma.promoCode.delete({
      where: { id: promoId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting promo code:", error);
    return NextResponse.json(
      { error: "Помилка при видаленні промокоду" },
      { status: 500 }
    );
  }
}
