import { notFound } from "next/navigation";
import ProductPageClient from "./ProductPageClient";

// Validate product ID
function isValidProductId(id) {
  const numId = Number(id);
  return !isNaN(numId) && numId > 0 && Number.isInteger(numId);
}

export async function generateMetadata({ params }) {
  const { id } = await params;

  if (!isValidProductId(id)) {
    return {
      title: "Товар не знайдено",
    };
  }

  try {
    // Use absolute URL for server-side fetch
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const product = await fetch(`${baseUrl}/api/products/${id}`);
    if (!product.ok) {
      throw new Error("Product not found");
    }
    const data = await product.json();

    return {
      title: data?.name || "Товар не знайдено",
    };
  } catch (error) {
    console.error("[Metadata Error]:", error);
    return {
      title: "Товар не знайдено",
    };
  }
}

export default async function ProductPage({ params }) {
  const { id } = await params;

  if (!isValidProductId(id)) {
    notFound();
  }

  return <ProductPageClient id={id} />;
}
