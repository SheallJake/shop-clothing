import prisma from "@/lib/prisma";

export async function GET() {
  const categories = await prisma.category.findMany();
  return Response.json(categories);
}
