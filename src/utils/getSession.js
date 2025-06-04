import { cookies } from "next/headers";
import { verifyJwt } from "@/utils/jwt";

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;

  try {
    return verifyJwt(token);
  } catch (e) {
    return null;
  }
}
