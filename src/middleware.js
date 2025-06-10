import { NextResponse } from "next/server";
import { verifyJwtEdge } from "@/utils/jwtEdge";

export async function middleware(request) {
  // Перевіряємо чи це адмін маршрут
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  console.log("[Middleware] Is admin route:", isAdminRoute);

  if (isAdminRoute) {
    // Отримуємо токен з кукі
    const token = request.cookies.get("token");
    console.log("[Middleware] Token exists:", !!token);

    // Якщо токена немає - перенаправляємо
    if (!token) {
      console.log("[Middleware] No token found, redirecting to home");
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Перевіряємо токен
    const decoded = await verifyJwtEdge(token.value);
    console.log("[Middleware] Decoded token:", decoded);

    if (!decoded || decoded.role.toLowerCase() !== "admin") {
      console.log("[Middleware] Access denied - not an admin");
      return NextResponse.redirect(new URL("/", request.url));
    }

    console.log("[Middleware] Access granted to admin route");
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
