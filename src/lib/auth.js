import { cookies } from "next/headers";
import { verifyJwt } from "@/utils/jwt";
import prisma from "@/lib/prisma";

export async function getServerSession() {
  const cookieStore = cookies();
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
