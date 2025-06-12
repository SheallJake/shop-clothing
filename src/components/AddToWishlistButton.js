"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";

export default function AddToWishlistButton({ product }) {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  const handleClick = () => {
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md transition-colors ${
        inWishlist
          ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
          : "hover:bg-gray-50"
      }`}
    >
      <Heart className={`h-5 w-5 ${inWishlist ? "fill-current" : ""}`} />
      {/* {inWishlist ? "Видалити з обраного" : "Додати до обраного"} */}
    </button>
  );
}
