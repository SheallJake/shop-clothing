import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { signJwt } from "@/util/jwt";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return Response.json(
        { error: "Введіть email та пароль" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return Response.json(
        { error: "Користувача не знайдено" },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return Response.json({ error: "Невірний пароль" }, { status: 401 });
    }

    // Генеруємо токен
    const token = signJwt({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Ставимо токен в cookie
    return new Response(
      JSON.stringify({ message: "Авторизація успішна", token }),
      {
        status: 200,
        headers: {
          "Set-Cookie": `token=${token}; Path=/; SameSite=Strict; Max-Age=604800`, // cookie на 7 днів
        },
      }
    );
  } catch (err) {
    console.error(err);
    return Response.json(
      { error: "Внутрішня помилка сервера" },
      { status: 500 }
    );
  }
}
