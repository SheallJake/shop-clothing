import { verifyJwt, isTokenExpired } from "@/utils/jwt";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    console.log("[Session Debug] Token from cookie:", token?.value);

    if (!token) {
      console.log("[Session Debug] No token found");
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const decoded = verifyJwt(token.value);
    console.log("[Session Debug] Decoded token:", decoded);

    if (!decoded || isTokenExpired(decoded)) {
      console.log("[Session Debug] Token invalid or expired:", {
        isValid: !!decoded,
        isExpired: decoded ? isTokenExpired(decoded) : true,
      });
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
        },
      });

      console.log("[Session Debug] User from database:", user);

      if (!user) {
        console.log("[Session Debug] No user found in database");
        return NextResponse.json({ user: null }, { status: 200 });
      }

      return NextResponse.json({ user });
    } catch (dbError) {
      console.error("[Session API Database Error]:", dbError);
      return NextResponse.json(
        { user: null, error: "Database error" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[Session API Error]:", error);
    return NextResponse.json(
      { user: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}
