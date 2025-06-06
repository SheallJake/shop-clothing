"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { addToCart } from "@/utils/cart";
import ProductCard from "@/components/ProductCard";

export default function WishlistPage() {
  const router = useRouter();
  const { wishlist, loading, removeFromWishlist } = useWishlist();
  const { addToCart: addToCartContext } = useCart();

  const handleAddToCart = async (product) => {
    try {
      const productToAdd = {
        ...product,
        selectedColor: product.color?.[0] || null,
        selectedSize: product.size?.[0] || null,
      };

      const success = await addToCart(productToAdd);
      if (success) {
        addToCartContext(productToAdd);
        toast.success("Товар додано до кошика");
        router.push("/cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add item to cart");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--foreground)]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-[var(--foreground)]">
        Список бажаного
      </h1>

      {wishlist.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg mb-4 text-[var(--foreground)]">
            Список бажаного порожній
          </p>
          <a
            href="/products"
            className="btn bg-[var(--card-bg)] text-[var(--foreground)] hover:bg-[var(--hover-bg)]"
          >
            Перейти до товарів
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((item) => {
            const product = item.product;
            if (!product) return null;

            return (
              <motion.div
                key={`${product.id}-${item.productId}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <ProductCard
                  product={product}
                  onAddToCart={handleAddToCart}
                  onRemove={removeFromWishlist}
                />
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
