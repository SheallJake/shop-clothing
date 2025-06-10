import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, password, phoneNumber } = body;

    // Перевірка обов'язкових полів
    if (!name || !email || !password) {
      return Response.json(
        { error: "Заповніть всі обов'язкові поля" },
        { status: 400 }
      );
    }

    // Перевірка чи існує такий email
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return Response.json(
        { error: "Користувач з таким email вже існує" },
        { status: 400 }
      );
    }

    // Хешуємо пароль
    const passwordHash = await bcrypt.hash(password, 10);

    // Записуємо нового користувача
    await prisma.user.create({
      data: {
        name,
        email,
        phoneNumber,
        passwordHash,
        role: "user", // default роль
      },
    });

    return Response.json({ message: "Реєстрація успішна" }, { status: 200 });
  } catch (err) {
    console.error(err);
    return Response.json(
      { error: "Внутрішня помилка сервера" },
      { status: 500 }
    );
  }
}
