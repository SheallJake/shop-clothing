import prisma from "@/lib/prisma";

export async function GET() {
  const promos = await prisma.promoCode.findMany({
    orderBy: { id: "desc" },
  });

  return Response.json({ promos });
}
