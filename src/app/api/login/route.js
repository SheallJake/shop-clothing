import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { signJwt } from "@/utils/jwt";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password } = body;

    console.log("[Login API] Login attempt for email:", email);

    if (!email || !password) {
      console.log("[Login API] Missing email or password");
      return NextResponse.json(
        { error: "Введіть email та пароль" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        role: true,
        name: true,
      },
    });

    console.log(
      "[Login API] User found:",
      user ? { ...user, passwordHash: "HIDDEN" } : null
    );

    if (!user) {
      console.log("[Login API] User not found");
      return NextResponse.json(
        { error: "Користувача не знайдено" },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    console.log("[Login API] Password validation:", isPasswordValid);

    if (!isPasswordValid) {
      console.log("[Login API] Invalid password");
      return NextResponse.json({ error: "Невірний пароль" }, { status: 401 });
    }

    // Генеруємо токен
    const token = signJwt({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    console.log("[Login API] JWT token generated, user role:", user.role);

    // Ставимо токен в cookie
    const response = NextResponse.json(
      { message: "Авторизація успішна" },
      { status: 200 }
    );

    // Встановлюємо cookie з правильними параметрами
    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    });

    console.log("[Login API] Cookie set successfully");
    return response;
  } catch (err) {
    console.error("[Login API] Error:", err);
    return NextResponse.json(
      { error: "Внутрішня помилка сервера" },
      { status: 500 }
    );
  }
}
