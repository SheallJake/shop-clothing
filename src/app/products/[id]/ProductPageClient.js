"use client";

import { useEffect, useState } from "react";
import ImageWithFallback from "@/components/ImageWithFallback";
import AddToCartButton from "@/components/AddToCartButton";
import AddToWishlistButton from "@/components/AddToWishlistButton";
import PageTransition from "@/components/PageTransition";

export default function ProductPageClient({ id }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${id}`);
        if (!response.ok) {
          throw new Error("Product not found");
        }
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error("[Product Error]:", error);
        setError("Не вдалося завантажити товар. Спробуйте пізніше.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error || !product) {
    return <div className="text-red-500">{error || "Product not found"}</div>;
  }

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex flex-col md:flex-row gap-8">
          <ImageWithFallback
            src={product.image}
            alt={product.name}
            className="w-full max-w-md h-auto rounded"
            priority
          />
          <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold">{product.name}</h1>
            {product.category && (
              <p className="text-gray-600">{product.category.name}</p>
            )}
            <p className="text-lg">{product.description}</p>
            <p className="text-green-600 text-2xl font-semibold">
              {product.price} грн
            </p>
            <div className="flex gap-4">
              <AddToCartButton product={product} />
              <AddToWishlistButton product={product} />
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
