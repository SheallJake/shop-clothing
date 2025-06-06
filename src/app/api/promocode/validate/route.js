import prisma from "@/lib/prisma";

export async function POST(req) {
  const { code } = await req.json();

  const promo = await prisma.promoCode.findUnique({
    where: { code },
  });

  if (
    !promo ||
    !promo.isActive ||
    promo.expirationDate < new Date() ||
    promo.usedCount >= promo.usageLimit
  ) {
    return Response.json({ valid: false });
  }

  return Response.json({ valid: true, discount: promo.discountPercent });
}
