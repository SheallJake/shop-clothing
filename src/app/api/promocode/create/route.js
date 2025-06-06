import prisma from "@/lib/prisma";

export async function POST(req) {
  const { code, discountPercent, expirationDate, usageLimit } =
    await req.json();

  const existing = await prisma.promoCode.findUnique({ where: { code } });
  if (existing) {
    return Response.json({ success: false, error: "Промокод вже існує" });
  }

  const promo = await prisma.promoCode.create({
    data: {
      code,
      discountPercent,
      expirationDate: new Date(expirationDate),
      usageLimit,
    },
  });

  return Response.json({ success: true, promo });
}
