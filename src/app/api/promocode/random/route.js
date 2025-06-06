import prisma from "@/lib/prisma";

export async function GET() {
  const promos = await prisma.promoCode.findMany({
    where: {
      isActive: true,
      expirationDate: { gt: new Date() },
      usageLimit: { gt: prisma.promoCode.usedCount },
    },
  });

  if (promos.length === 0) {
    return Response.json({ promo: null });
  }

  const random = promos[Math.floor(Math.random() * promos.length)];

  return Response.json({ promo: random.code });
}
