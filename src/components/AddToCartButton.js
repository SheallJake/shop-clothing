import { ShoppingCart, Plus } from "lucide-react";
import { addToCart } from "@/utils/cart";

export default function AddToCartButton({ product }) {
  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await addToCart(product);
  };

  return (
    <button
      onClick={handleAddToCart}
      className="relative bg-black text-white p-3 rounded-full hover:bg-gray-800 transition-colors"
    >
      <ShoppingCart size={20} />
      <div className="absolute -top-[1px] -right-[1px] bg-red-500 text-white rounded-full p-1 flex items-center justify-center">
        <Plus size={12} />
      </div>
    </button>
  );
}
