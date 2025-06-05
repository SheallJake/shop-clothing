import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key"
);

export async function verifyJwtEdge(token) {
  try {
    console.log("[JWT Edge] Verifying token...");
    const { payload } = await jwtVerify(token, JWT_SECRET);
    console.log("[JWT Edge] Token verified successfully:", payload);
    return payload;
  } catch (error) {
    console.error("[JWT Edge] Token verification failed:", error.message);
    return null;
  }
}
