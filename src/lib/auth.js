import { cookies } from "next/headers";
import { verifyJwt } from "@/utils/jwt";
import prisma from "@/lib/prisma";

export async function getServerSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = verifyJwt(token);
    if (!decoded) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return user ? { user } : null;
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
}

export async function verifyAuth() {
  const session = await getServerSession();

  if (!session) {
    return { isAuthenticated: false, isAdmin: false };
  }

  return {
    isAuthenticated: true,
    isAdmin: session.user.role === "ADMIN",
  };
}
