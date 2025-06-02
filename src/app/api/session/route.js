import { verifyJwt, isTokenExpired } from "@/util/jwt";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ user: null });
    }

    // Check if token is expired
    if (isTokenExpired(token)) {
      // Clear the expired token
      const response = NextResponse.json({ user: null });
      response.cookies.delete("token");
      return response;
    }

    const decoded = verifyJwt(token);
    if (!decoded) {
      return NextResponse.json({ user: null });
    }

    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { user: null, message: "Користувача не знайдено" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("Session error:", error);
    return NextResponse.json({ user: null });
  }
}
