import ImageWithFallback from "./ImageWithFallback";
import { Heart, ShoppingCart, Star } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { colorMapping } from "../utils/colorMapping";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { addToCart } from "@/utils/cart";

export default function ProductCard({ product }) {
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
  const [showTooltip, setShowTooltip] = useState(false);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCart: addToCartContext } = useCart();

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

    const success = await addToCart(productToAdd);
    if (success) {
      addToCartContext(productToAdd);
    }
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

  const productImage = String(product.image || "");
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
      className="group border border-gray-500 rounded px-2 py-2 relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      style={{ zIndex: showTooltip ? 2 : 1 }}
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
                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
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
                  <h3 className="text-sm font-normal mb-1 hover:text-gray-600 transition-colors">
                    {productName}
                  </h3>
                  <p className="text-sm font-semibold text-green-600 mb-3">
                    {finalPrice} UAH
                    {product.isDiscountActive && product.discountPrice && (
                      <span className="text-sm line-through text-red-400 ml-2">
                        {productPrice} UAH
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-1 mb-2">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm text-gray-600">
                    {averageRating.toFixed(1)}
                  </span>
                </div>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-black text-white py-2 px-4 rounded border border-gray-500 hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="text-xs">В кошик</span>
              </button>
              <button
                onClick={handleAddToWishlist}
                className={`p-2 border rounded transition-colors ${
                  isInWishlist(product.id)
                    ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Heart
                  className={`w-4 h-4 ${
                    isInWishlist(product.id) ? "fill-current" : ""
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
        <div
          className={`absolute left-0 right-0 bg-black bg-opacity-95 border-x border-b border-gray-500 rounded-b transition-all duration-300 transform origin-top ${
            showTooltip ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0"
          }`}
          style={{
            zIndex: -1,
            top: "calc(100% - 4px)",
          }}
        >
          <div className="p-4">
            <div className="text-sm text-white grid grid-cols-2 gap-4">
              <div className="space-y-4">
                {colors.length > 0 && (
                  <div>
                    <p className="text-xs mb-1 text-gray-400">
                      Доступні кольори:
                    </p>
                    <div className="flex gap-1 flex-wrap">
                      {colors.map((color) => (
                        <div
                          key={color}
                          className="w-4 h-4 rounded-full border border-gray-300"
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
                    <p className="text-xs mb-1 text-gray-400">Розміри:</p>
                    <div className="flex gap-1 flex-wrap">
                      {sizes.map((size) => (
                        <span
                          key={size}
                          className="w-8 h-8 flex items-center justify-center text-xs border border-gray-500 rounded hover:border-white transition-colors"
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
                  <p className="text-xs mb-1 text-gray-400">Рейтинг:</p>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3 h-3 ${
                          star <= Math.round(averageRating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-600"
                        }`}
                      />
                    ))}
                    <span className="text-xs text-gray-400 ml-1">
                      ({product.reviews?.length || 0})
                    </span>
                  </div>
                </div>

                {productDescription && (
                  <div>
                    <p className="text-xs mb-1 text-gray-400">Опис:</p>
                    <p className="text-xs">{productDescription}</p>
                  </div>
                )}

                {productMaterial && (
                  <div>
                    <p className="text-xs mb-1 text-gray-400">Матеріал:</p>
                    <p className="text-xs">{productMaterial}</p>
                  </div>
                )}

                {categoryName && (
                  <div>
                    <p className="text-xs mb-1 text-gray-400">Категорія:</p>
                    <p className="text-xs">{categoryName}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
