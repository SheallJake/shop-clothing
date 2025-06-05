import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export function signJwt(payload, expiresIn = "7d") {
  console.log("[JWT] Signing token with payload:", payload);
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn });
  console.log("[JWT] Token signed successfully");
  return token;
}

export function verifyJwt(token) {
  try {
    console.log("[JWT] Verifying token...");
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("[JWT] Token verified successfully:", decoded);
    return decoded;
  } catch (error) {
    console.error("[JWT] Token verification failed:", error.message);
    return null;
  }
}

export function isTokenExpired(decoded) {
  if (!decoded || !decoded.exp) {
    console.log("[JWT] Token invalid or no expiration");
    return true;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  const isExpired = decoded.exp < currentTime;
  console.log("[JWT] Token expiration check:", {
    exp: decoded.exp,
    current: currentTime,
    isExpired,
  });
  return isExpired;
}
