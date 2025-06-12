import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function AddToCartButton({ product, className = "" }) {
  const { addToCart } = useCart();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await addToCart(
      {
        ...product,
        quantity: 1,
      },
      true
    );
  };

  return (
    <button
      onClick={handleAddToCart}
      className={`w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-3 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 ${className}`}
    >
      <ShoppingCart className="w-5 h-5" />
      <span>Додати до кошика</span>
    </button>
  );
}
