"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import ProductCard from "@/components/ProductCard";
import Spinner from "@/components/Spinner";

export default function WishlistPage() {
  const router = useRouter();
  const { wishlist, loading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = async (product) => {
    try {
      const productToAdd = {
        ...product,
        selectedColor: product.color?.[0] || null,
        selectedSize: product.size?.[0] || null,
      };

      await addToCart(productToAdd, true);
      router.push("/cart");
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add item to cart");
    }
  };

  return (
    <div className="container-main">
      {/* Заголовок и описание */}
      <div className="page-section">
        <h1 className="heading-1 mb-2">Список бажаного</h1>
        <p className="text-muted text-sm md:text-base">
          Зберігайте улюблені товари, щоб повернутися до них пізніше.
        </p>
      </div>

      {/* Состояние загрузки */}
      {loading ? (
        <div className="loading-state">
          <Spinner size="md" />
        </div>
      ) : wishlist.length === 0 ? (
        // Пустий список
        <div className="empty-state">
          <p className="empty-message mb-4">Список бажаного порожній</p>
          <a href="/products" className="btn-primary inline-flex">
            Перейти до товарів
          </a>
        </div>
      ) : (
        // Список товарів
        <div className="section-grid">
          {wishlist.map((item) => {
            const product = item.product;
            if (!product) return null;

            return (
              <motion.div
                key={`${product.id}-${item.productId}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="product-card"
              >
                <ProductCard product={product} />
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
