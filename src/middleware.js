import { NextResponse } from "next/server";
import { verifyJwt } from "@/utils/jwt";

export function middleware(request) {
  const token = request.cookies.get("token")?.value;
  const user = token && verifyJwt(token);

  // Можемо перевіряти захищені маршрути
  // if (!user && request.nextUrl.pathname.startsWith('/cabinet')) {
  //   return NextResponse.redirect(new URL('/login', request.url));
  // }

  return NextResponse.next();
}
