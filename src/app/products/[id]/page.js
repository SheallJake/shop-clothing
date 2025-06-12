import { notFound } from "next/navigation";
import ProductPageClient from "./ProductPageClient";
import prisma from "@/lib/prisma";
import Spinner from "@/components/Spinner";

// Validate product ID
function isValidProductId(id) {
  const numId = Number(id);
  return !isNaN(numId) && numId > 0 && Number.isInteger(numId);
}

export async function generateMetadata({ params }) {
  if (!params?.id) {
    return {
      title: "Товар не знайдено",
    };
  }

  const id = params.id;
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
  if (!params?.id) {
    notFound();
  }

  const id = params.id;

  if (!isValidProductId(id)) {
    notFound();
  }

  return <ProductPageClient id={id} />;
}
