import { verifyJwt, isTokenExpired } from "@/utils/jwt";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const decoded = verifyJwt(token.value);

    if (!decoded || isTokenExpired(decoded)) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          phoneNumber: true,
        },
      });

      if (!user) {
        return NextResponse.json({ user: null }, { status: 200 });
      }

      return NextResponse.json({ user });
    } catch (dbError) {
      return NextResponse.json(
        { user: null, error: "Database error" },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { user: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}
