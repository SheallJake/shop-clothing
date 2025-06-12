import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export function signJwt(payload, expiresIn = "7d") {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyJwt(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
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
