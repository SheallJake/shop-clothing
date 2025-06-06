import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyJwt, isTokenExpired } from "@/utils/jwt";
import { NextResponse } from "next/server";

// Генерація унікального промокоду
function generatePromoCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const codeLength = 8;
  let code = "";

  for (let i = 0; i < codeLength; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return code;
}

export async function POST(req) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("token");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyJwt(token.value);
    if (!decoded || isTokenExpired(decoded)) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Перевірка користувача в базі даних
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    // Перевірка кількості спроб за сьогодні
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyAttempts = await prisma.gameAttempt.count({
      where: {
        userId: user.id,
        createdAt: {
          gte: today,
        },
      },
    });

    if (dailyAttempts >= 3) {
      return NextResponse.json(
        {
          error: "Вичерпано ліміт спроб на сьогодні",
          nextAttemptTime: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
        { status: 429 }
      );
    }

    // Генерація унікального промокоду
    let code;
    let isUnique = false;
    let generationAttempts = 0;

    while (!isUnique && generationAttempts < 5) {
      code = generatePromoCode();
      const existing = await prisma.promoCode.findUnique({ where: { code } });
      if (!existing) {
        isUnique = true;
      }
      generationAttempts++;
    }

    if (!isUnique) {
      return NextResponse.json(
        { error: "Не вдалося згенерувати унікальний промокод" },
        { status: 500 }
      );
    }

    // Створення промокоду
    const discountPercent = Math.floor(Math.random() * 21) + 5; // Випадкова знижка від 5% до 25%
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7); // Дійсний 7 днів

    const promo = await prisma.promoCode.create({
      data: {
        code,
        discountPercent,
        expirationDate,
        usageLimit: 1, // Одноразовий промокод
        isActive: true,
      },
    });

    // Збереження спроби
    await prisma.gameAttempt.create({
      data: {
        userId: user.id,
        promoCodeId: promo.id,
        success: true,
      },
    });

    return NextResponse.json({
      promo: code,
      discountPercent,
      attemptsLeft: 3 - (dailyAttempts + 1),
    });
  } catch (error) {
    console.error("Error generating promo code:", error);
    return NextResponse.json(
      { error: "Помилка генерації промокоду" },
      { status: 500 }
    );
  }
}
