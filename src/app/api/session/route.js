import { verifyJwt, isTokenExpired } from "@/utils/jwt";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    console.log("[Session API] Token from cookie:", token?.value);

    if (!token) {
      console.log("[Session API] No token found");
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const decoded = verifyJwt(token.value);
    console.log("[Session API] Decoded token:", decoded);

    if (!decoded || isTokenExpired(decoded)) {
      console.log("[Session API] Token invalid or expired:", {
        isValid: !!decoded,
        isExpired: decoded ? isTokenExpired(decoded) : true,
      });
      return NextResponse.json({ user: null }, { status: 200 });
    }

    try {
      console.log("[Session API] Looking up user with ID:", decoded.userId);
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

      console.log("[Session API] User from database:", user);

      if (!user) {
        console.log("[Session API] No user found in database");
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
