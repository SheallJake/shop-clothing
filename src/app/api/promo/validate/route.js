import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: "Promo code is required" },
        { status: 400 }
      );
    }

    const promoCode = await prisma.promoCode.findUnique({
      where: { code },
    });

    if (!promoCode) {
      return NextResponse.json(
        { valid: false, message: "Invalid promo code" },
        { status: 200 }
      );
    }

    // Check if promo code is active
    if (!promoCode.isActive) {
      return NextResponse.json(
        { valid: false, message: "Promo code is not active" },
        { status: 200 }
      );
    }

    // Check if promo code has expired
    if (new Date(promoCode.expirationDate) < new Date()) {
      return NextResponse.json(
        { valid: false, message: "Promo code has expired" },
        { status: 200 }
      );
    }

    // Check if promo code has reached its usage limit
    const usageCount = await prisma.order.count({
      where: { promoId: promoCode.id },
    });

    if (usageCount >= promoCode.usageLimit) {
      return NextResponse.json(
        { valid: false, message: "Promo code usage limit reached" },
        { status: 200 }
      );
    }

    return NextResponse.json({
      valid: true,
      discountPercent: promoCode.discountPercent,
      promoCodeId: promoCode.id,
    });
  } catch (error) {
    console.error("[Promo Code Validation Error]:", error);
    return NextResponse.json(
      { error: "Failed to validate promo code" },
      { status: 500 }
    );
  }
}
