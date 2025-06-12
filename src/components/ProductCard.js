import ImageWithFallback from "./ImageWithFallback";
import { Heart, ShoppingCart, Star } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { colorMapping } from "../utils/colorMapping";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";

export default function ProductCard({ product }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCart: addToCartContext } = useCart();

  useEffect(() => {
    console.log("Product data:", JSON.stringify(product, null, 2));
  }, [product]);

  if (!product || typeof product !== "object") {
    console.error("Invalid product data:", product);
    return null;
  }

  const [selectedColor, setSelectedColor] = useState(
    product.color?.[0] || null
  );

  const handleColorSelect = (color) => {
    setSelectedColor(color);
  };

  const handleAddToWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const productToAdd = {
      ...product,
      selectedColor: selectedColor,
      selectedSize: product.size,
      price: finalPrice,
    };

    addToCartContext(productToAdd, true);
  };

  // Ensure we have a string for category name
  const categoryName = (() => {
    if (!product.category) return "";
    if (typeof product.category === "string") return product.category;
    if (typeof product.category === "object" && product.category !== null) {
      return product.category.name || "";
    }
    return "";
  })();

  // Ensure we have an array for colors
  const colors = Array.isArray(product.color) ? product.color : [];

  // Ensure we have a string or array for size
  const sizes = Array.isArray(product.size)
    ? product.size
    : [product.size].filter(Boolean);

  // Ensure all text values are strings
  const productName = String(product.name || "");
  const productPrice = Number(product.price || 0);
  const finalPrice =
    product.isDiscountActive && product.discountPrice
      ? product.discountPrice
      : productPrice;

  // Calculate discount percentage if applicable
  const discountPercentage =
    product.isDiscountActive && product.discountPrice
      ? Math.round(
          ((productPrice - product.discountPrice) / productPrice) * 100
        )
      : 0;

  // Debug logging for discount properties
  console.log("Discount properties:", {
    isDiscountActive: product.isDiscountActive,
    discountPrice: product.discountPrice,
    originalPrice: productPrice,
    finalPrice: finalPrice,
  });

  const productImage = (() => {
    if (!product.mainImage) return "/placeholder.svg";
    try {
      const url = String(product.mainImage);
      // Check if it's a valid URL or a relative path
      if (
        url.startsWith("/") ||
        url.startsWith("http://") ||
        url.startsWith("https://")
      ) {
        return url;
      }
      return "/placeholder.svg";
    } catch (error) {
      console.error("Invalid image URL:", product.mainImage);
      return "/placeholder.svg";
    }
  })();
  const productDescription = String(product.description || "");
  const productMaterial = String(product.material || "");

  // Calculate average rating
  const averageRating = product.reviews?.length
    ? product.reviews.reduce((acc, review) => acc + review.rating, 0) /
      product.reviews.length
    : 0;

  // Debug logging
  console.log("Processed values:", {
    categoryName,
    colors,
    sizes,
    productName,
    productPrice,
    finalPrice,
    productImage,
    productDescription,
    productMaterial,
    averageRating,
  });

  return (
    <div
      className="group bg-[var(--card-bg)] dark:bg-black rounded-lg p-2 shadow-[0_0_2px_var(--glow-color)] relative card animate-fadeIn hover:shadow-[0_0_8px_var(--glow-color)] transition-all duration-300"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      style={{ zIndex: showTooltip ? 20 : 2 }}
    >
      <div className="relative w-full">
        <div>
          <Link href={`/products/${product.id}`}>
            <div className="relative aspect-square overflow-hidden rounded">
              <ImageWithFallback
                src={productImage}
                alt={productName}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {product.isDiscountActive && product.discountPrice && (
                <div className="absolute top-2 right-2 bg-red-500 dark:bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full transform rotate-12 shadow-lg">
                  -{discountPercentage}%
                </div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300" />
            </div>
          </Link>
          <div className="mt-4">
            <Link href={`/products/${product.id}`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-normal mb-1 text-[var(--foreground)] hover:text-[var(--foreground)]/70 transition-colors">
                    {productName}
                  </h3>
                  <p className="text-sm font-semibold text-green-600 dark:text-green-400 mb-3">
                    {finalPrice} UAH
                    {product.isDiscountActive && product.discountPrice && (
                      <span className="text-sm line-through text-red-500 dark:text-red-400 ml-2">
                        {productPrice} UAH
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-1 mb-2">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm text-[var(--foreground)]/70">
                    {averageRating.toFixed(1)}
                  </span>
                </div>
              </div>
            </Link>

            <div
              className="flex items-center gap-2 relative"
              style={{ zIndex: 40 }}
            >
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-[var(--card-bg)] dark:bg-black p-2 py-2 px-4 rounded border border-[var(--card-border)] hover:bg-[var(--hover-bg)] transition-all duration-300 flex items-center justify-center gap-2 text-[var(--foreground)] group/cart relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 transition-transform duration-300 group-hover/cart:scale-110" />
                  <span className="text-xs transition-transform duration-300 group-hover/cart:translate-x-0.5">
                    В кошик
                  </span>
                </span>
                <span className="absolute inset-0 bg-[var(--foreground)]/5 scale-x-0 group-hover/cart:scale-x-100 transition-transform duration-300 origin-left"></span>
              </button>
              <button
                onClick={handleAddToWishlist}
                className={`p-2 border border-[var(--card-border)] rounded transition-all duration-300 relative overflow-hidden group/wishlist ${
                  isInWishlist(product.id)
                    ? "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50"
                    : "bg-[var(--card-bg)] dark:bg-black hover:bg-[var(--hover-bg)] hover:shadow-[0_0_4px_var(--glow-color)]"
                }`}
              >
                <Heart
                  className={`w-4 h-4 transition-all duration-300 ${
                    isInWishlist(product.id)
                      ? "fill-current scale-110"
                      : "group-hover/wishlist:scale-110"
                  }`}
                />
                <span
                  className={`absolute inset-0 bg-red-500/10 scale-x-0 group-hover/wishlist:scale-x-100 transition-transform duration-300 origin-left ${
                    isInWishlist(product.id) ? "opacity-0" : "opacity-100"
                  }`}
                ></span>
              </button>
            </div>
          </div>
        </div>
        {showTooltip && (
          <div
            className={`absolute left-0 right-0 bg-[var(--card-bg)] dark:bg-black border border-[var(--card-border)] rounded-b transition-all duration-300 transform origin-top hover:shadow-[0_0_8px_var(--glow-color)] animate-slideDown ${
              showTooltip ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0"
            }`}
            style={{
              zIndex: 20,
              top: "100%",
              marginTop: "-8px",
            }}
          >
            <div className="p-4">
              <div className="text-sm grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  {colors.length > 0 && (
                    <div>
                      <p className="text-xs mb-1 text-[var(--foreground)]/70">
                        Доступні кольори:
                      </p>
                      <div className="flex gap-1 flex-wrap">
                        {colors.map((color) => (
                          <div
                            key={color}
                            className="w-4 h-4 rounded-full border border-[var(--card-border)]"
                            style={{
                              backgroundColor:
                                colorMapping[color.toLowerCase()] ||
                                color.toLowerCase(),
                            }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {sizes.length > 0 && (
                    <div>
                      <p className="text-xs mb-1 text-[var(--foreground)]/70">
                        Розміри:
                      </p>
                      <div className="flex gap-1 flex-wrap">
                        {sizes.map((size) => (
                          <span
                            key={size}
                            className="w-8 h-8 flex items-center justify-center text-xs border border-[var(--card-border)] rounded hover:border-[var(--foreground)] transition-colors text-[var(--foreground)]"
                          >
                            {size}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs mb-1 text-[var(--foreground)]/70">
                      Рейтинг:
                    </p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 ${
                            star <= Math.round(averageRating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-[var(--foreground)]/30"
                          }`}
                        />
                      ))}
                      <span className="text-xs text-[var(--foreground)]/70 ml-1">
                        ({product.reviews?.length || 0})
                      </span>
                    </div>
                  </div>

                  {productDescription && (
                    <div>
                      <p className="text-xs mb-1 text-[var(--foreground)]/70">
                        Опис:
                      </p>
                      <p className="text-xs text-[var(--foreground)]">
                        {productDescription}
                      </p>
                    </div>
                  )}

                  {productMaterial && (
                    <div>
                      <p className="text-xs mb-1 text-[var(--foreground)]/70">
                        Матеріал:
                      </p>
                      <p className="text-xs text-[var(--foreground)]">
                        {productMaterial}
                      </p>
                    </div>
                  )}

                  {categoryName && (
                    <div>
                      <p className="text-xs mb-1 text-[var(--foreground)]/70">
                        Категорія:
                      </p>
                      <p className="text-xs text-[var(--foreground)]">
                        {categoryName}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
