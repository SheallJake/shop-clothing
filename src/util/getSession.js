import { cookies } from "next/headers";
import { verifyJwt } from "@/util/jwt";

export function getSession() {
  const token = cookies().get("token")?.value;
  if (!token) return null;

  try {
    return verifyJwt(token);
  } catch (e) {
    return null;
  }
}
