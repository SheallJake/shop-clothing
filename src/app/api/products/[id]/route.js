import { db } from "@/lib/db";

export async function GET(request, { params }) {
  const { id } = await params;

  try {
    const product = await db.product.findUnique({
      where: { id: Number(id) },
      include: { category: true },
    });

    if (!product) {
      return new Response(JSON.stringify({ error: "Product not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return Response.json(product);
  } catch (error) {
    console.error("[Product API Error]:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch product" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
