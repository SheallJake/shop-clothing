import { notFound } from "next/navigation";
import ProductPageClient from "./ProductPageClient";
import prisma from "@/lib/prisma";

// Validate product ID
function isValidProductId(id) {
  const numId = Number(id);
  return !isNaN(numId) && numId > 0 && Number.isInteger(numId);
}

export async function generateMetadata({ params }) {
  const { id } = params;
  console.log("[Metadata] Generating metadata for product ID:", id);

  if (!isValidProductId(id)) {
    console.log("[Metadata] Invalid product ID:", id);
    return {
      title: "Товар не знайдено",
    };
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      select: {
        name: true,
      },
    });

    console.log("[Metadata] Found product:", product);

    if (!product) {
      return {
        title: "Товар не знайдено",
      };
    }

    return {
      title: product.name,
    };
  } catch (error) {
    console.error("[Metadata Error]:", error);
    return {
      title: "Товар не знайдено",
    };
  }
}

export default async function ProductPage({ params }) {
  const { id } = params;

  if (!isValidProductId(id)) {
    notFound();
  }

  return <ProductPageClient id={id} />;
}
