"use client";

import Image from "next/image";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import Link from "next/link";

export default function HomeProductCard({ product }) {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCart: addToCartContext } = useCart();

  if (!product || typeof product !== "object") {
    console.error("Invalid product data:", product);
    return null;
  }

  const handleAddToWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const finalPrice =
      product.isDiscountActive && product.discountPrice
        ? product.discountPrice
        : product.price;

    const productToAdd = {
      ...product,
      selectedColor: null,
      selectedSize: null,
      price: finalPrice,
    };

    addToCartContext(productToAdd, true);
  };

  const productName = String(product.name || "");
  const categoryName = (() => {
    if (!product.category) return "";
    if (typeof product.category === "string") return product.category;
    if (typeof product.category === "object" && product.category !== null) {
      return product.category.name || "";
    }
    return "";
  })();

  const productPrice =
    product.isDiscountActive && product.discountPrice
      ? product.discountPrice
      : product.price;

  const formattedPrice = Math.round(Number(productPrice) || 0);
  const formattedOriginalPrice = Math.round(Number(product.price) || 0);

  const productImage = (() => {
    if (!product.mainImage) return null;
    try {
      const url = String(product.mainImage);
      if (
        url.startsWith("/") ||
        url.startsWith("http://") ||
        url.startsWith("https://")
      ) {
        return url;
      }
      return null;
    } catch (error) {
      console.error("Invalid image URL:", product.mainImage);
      return null;
    }
  })();

  return (
    <Link href={`/products/${product.id}`}>
      <div className="product-card group cursor-pointer">
        {/* Image section */}
        <div className="product-card-image">
          {productImage && (
            <Image
              alt={productName}
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              src={productImage}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          )}
          {/* Heart icon */}
          <button
            onClick={handleAddToWishlist}
            className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-colors z-10 shadow-card bg-[var(--btn-secondary)] hover:bg-[var(--btn-secondary-hover)]"
          >
            <Image
              alt="Like"
              className="object-contain"
              src={
                isInWishlist(product.id)
                  ? "/design-assets/b6eec70ab3291b50ff685e23963b50ae37dcdd8b.png"
                  : "/design-assets/a5337ea02a6dfc764da94ca4fce4166b7786e16b.png"
              }
              width={20}
              height={20}
            />
          </button>
          {/* Limited Edition badge */}
          {product.isDiscountActive && product.discountPrice && (
            <div className="product-card-badge">
              ЗНИЖКА
            </div>
          )}
        </div>

        {/* Content section */}
        <div className="product-card-content flex flex-col gap-2">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-muted uppercase tracking-wide">
              {categoryName}
            </p>
          </div>
          <p className="text-sm text-primary mb-2 line-clamp-2">
            {productName}
          </p>
          <div className="flex items-center justify-between mt-1">
            <div className="flex flex-col">
              <span className="text-primary font-semibold text-base">
                {formattedPrice} грн
              </span>
              {product.isDiscountActive &&
                product.discountPrice &&
                formattedOriginalPrice > formattedPrice && (
                  <span className="text-xs text-muted line-through">
                    {formattedOriginalPrice} грн
                  </span>
                )}
            </div>
            <button
              onClick={handleAddToCart}
              className="product-card-action-button w-10 h-10"
            >
              <Image
                alt="Add to cart"
                className="object-contain"
                src="/design-assets/dd1fcb6566f5429eaf7e96ddde7ed434a662d7a8.png"
                width={20}
                height={20}
              />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

