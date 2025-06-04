"use client";

import { useEffect, useState } from "react";
import ImageWithFallback from "@/components/ImageWithFallback";
import AddToCartButton from "@/components/AddToCartButton";
import AddToWishlistButton from "@/components/AddToWishlistButton";
import PageTransition from "@/components/PageTransition";
import ItemSize from "@/components/ItemSize";
import ReviewSection from "@/components/ReviewSection";
import {
  Truck,
  MessageSquare,
  CreditCard,
  ChevronDown,
  Heart,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

export default function ProductPageClient({ id }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(true);
  const [errorRelated, setErrorRelated] = useState(null);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [expandedSections, setExpandedSections] = useState({
    description: false,
    structure: false,
    delivery: false,
    payment: false,
    reviews: false,
  });

  const fetchRelatedProducts = async () => {
    try {
      setLoadingRelated(true);
      setErrorRelated(null);
      console.log("[ProductPage] Fetching related products for ID:", id);

      const response = await fetch(`/api/products/related/${id}`);
      const data = await response.json();

      if (!response.ok) {
        console.error("[ProductPage] Related products API error:", {
          status: response.status,
          statusText: response.statusText,
          data,
        });
        throw new Error(data.error || "Failed to fetch related products");
      }

      if (!Array.isArray(data)) {
        console.error("[ProductPage] Invalid response format:", data);
        throw new Error("Invalid response format from server");
      }

      if (data.length === 0) {
        console.log("[ProductPage] No related products found");
        setRelatedProducts([]);
        return;
      }

      console.log("[ProductPage] Related products received:", data.length);
      setRelatedProducts(data);
    } catch (error) {
      console.error("[ProductPage] Related Products Error:", error);
      setErrorRelated(
        error.message ||
          "Не вдалося завантажити пов'язані товари. Спробуйте оновити сторінку."
      );
    } finally {
      setLoadingRelated(false);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/products/${id}`);
        if (!response.ok) {
          throw new Error("Product not found");
        }
        const data = await response.json();
        setProduct(data);
        if (data.color && data.color.length > 0) {
          setSelectedColor(data.color[0]);
        }
        if (data.size && data.size.length > 0) {
          setSelectedSize(data.size[0]);
        }
      } catch (error) {
        console.error("[ProductPage] Product Error:", error);
        setError("Не вдалося завантажити товар. Спробуйте пізніше.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    fetchRelatedProducts();
  }, [id]);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleAddToCart = (product) => {
    addToCart({
      ...product,
      quantity: 1,
      selectedSize: product.size?.[0] || null,
      selectedColor: product.color?.[0] || null,
    });
  };

  const handleAddToWishlist = (product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-3xl font-bold mb-4">Помилка</h2>
        <p className="text-gray-600 mb-6">{error || "Товар не знайдено"}</p>
        <Link
          href="/products"
          className="bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition-colors"
        >
          Повернутися до каталогу
        </Link>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-[490px] flex-shrink-0">
            <ImageWithFallback
              src={product.image}
              alt={product.name}
              className="w-full h-auto rounded"
              priority
            />
          </div>
          <div className="inline-flex flex-col items-start gap-4 relative w-full max-w-[490px]">
            <div className="flex w-full items-start justify-between">
              <div className="relative w-fit mt-[-1.00px] font-normal text-white text-4xl tracking-normal leading-normal">
                {product.name}
              </div>
              <AddToWishlistButton product={product} />
            </div>

            <p className="relative w-fit font-normal text-gray-500 text-[11px] tracking-normal leading-5">
              <span className="font-normal text-gray-500">Article: </span>
              <span className="font-light">{product.article || "N/A"}</span>
            </p>

            <div className="relative w-fit font-semibold text-green-600 text-2xl tracking-normal leading-5">
              {product.price} UAH
            </div>

            {/* Color Picker */}
            {product.color && product.color.length > 0 && (
              <div className="inline-flex items-start gap-[21px] px-[5px] py-[11px] relative">
                {product.color.map((color, index) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-[27px] h-[27px] rounded-[13.5px] border border-solid border-[#0000001f] transition-all ${
                      selectedColor === color
                        ? "ring-2 ring-white ring-offset-2"
                        : ""
                    }`}
                    style={{ backgroundColor: color.toLowerCase() }}
                    title={color}
                  />
                ))}
              </div>
            )}

            {/* Size Selection */}
            {product.size && (
              <div className="flex flex-col w-full items-start gap-3">
                <div className="relative w-fit font-light text-white text-[17px] tracking-normal leading-5">
                  SIZE
                </div>
                <div className="flex gap-[5px]">
                  {(Array.isArray(product.size)
                    ? product.size
                    : [product.size]
                  ).map((size) => (
                    <ItemSize
                      key={size}
                      text={size}
                      property1={selectedSize === size ? "active" : "default"}
                      onClick={() => setSelectedSize(size)}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="flex w-[99px] items-start relative">
              <div className="absolute w-[99px] h-px top-[17px] left-0 bg-black" />
              <button className="relative w-[99px] text-xs text-gray-500 text-center tracking-normal leading-5">
                Help About Size
              </button>
            </div>

            <AddToCartButton
              product={product}
              className="w-full"
              selectedSize={selectedSize}
              selectedColor={selectedColor}
            />

            {/* Reviews Section */}
            <div className="w-full py-8 border-t border-[#222222]">
              <ReviewSection productId={id} />
            </div>

            {/* Additional Information Sections */}
            <div className="flex-col flex w-full items-start">
              {/* Description */}
              {product.description && (
                <div className="w-full py-4 border-t border-[#222222]">
                  <button
                    onClick={() => toggleSection("description")}
                    className="flex w-full items-center justify-between opacity-50 hover:opacity-100 transition-opacity"
                  >
                    <span className="text-sm">Description</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        expandedSections.description ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {expandedSections.description && (
                    <div className="mt-4 text-sm">{product.description}</div>
                  )}
                </div>
              )}

              {/* Structure */}
              {product.structure && (
                <div className="w-full py-4 border-t border-[#222222]">
                  <button
                    onClick={() => toggleSection("structure")}
                    className="flex w-full items-center justify-between opacity-50 hover:opacity-100 transition-opacity"
                  >
                    <span className="text-sm">Structure</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        expandedSections.structure ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {expandedSections.structure && (
                    <div className="mt-4 text-sm">{product.structure}</div>
                  )}
                </div>
              )}

              {/* Delivery */}
              <div className="w-full py-4 border-t border-[#222222]">
                <button
                  onClick={() => toggleSection("delivery")}
                  className="flex w-full items-center justify-between opacity-50 hover:opacity-100 transition-opacity pl-9"
                >
                  <div className="flex items-center gap-2">
                    <Truck className="w-6 h-6 text-gray-500" />
                    <span className="text-sm">Delivery</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      expandedSections.delivery ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {expandedSections.delivery && (
                  <div className="mt-4 text-sm pl-9">
                    Free delivery for orders over 1000 UAH
                  </div>
                )}
              </div>

              {/* Payment */}
              <div className="w-full py-4 border-t border-[#222222]">
                <button
                  onClick={() => toggleSection("payment")}
                  className="flex w-full items-center justify-between opacity-50 hover:opacity-100 transition-opacity pl-9"
                >
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-6 h-6 text-gray-500" />
                    <span className="text-sm">Payment</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      expandedSections.payment ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {expandedSections.payment && (
                  <div className="mt-4 text-sm pl-9">
                    We accept credit cards and PayPal
                  </div>
                )}
              </div>

              {/* Reviews */}
              <div className="w-full py-4 border-t border-[#222222]">
                <button
                  onClick={() => toggleSection("reviews")}
                  className="flex w-full items-center justify-between opacity-50 hover:opacity-100 transition-opacity pl-9"
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-6 h-6 text-gray-500" />
                    <span className="text-sm">Reviews</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      expandedSections.reviews ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {expandedSections.reviews && (
                  <div className="mt-4 text-sm pl-9">
                    {product.reviews && product.reviews.length > 0
                      ? product.reviews.map((review) => (
                          <div key={review.id} className="mb-4">
                            <p className="font-medium">{review.user.name}</p>
                            <p className="text-gray-600">{review.comment}</p>
                          </div>
                        ))
                      : "No reviews yet"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* You May Also Like Section */}
        <div className="mt-24 border-t border-[#222222] pt-16">
          <h2 className="text-3xl font-normal mb-12 text-center">
            Вам також може сподобатись
          </h2>
          {loadingRelated ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
            </div>
          ) : errorRelated ? (
            <div className="text-center py-16">
              <p className="text-gray-600 mb-6 text-lg">{errorRelated}</p>
              <button
                onClick={fetchRelatedProducts}
                className="text-sm text-gray-500 hover:text-gray-700 underline transition-colors"
              >
                Спробувати ще раз
              </button>
            </div>
          ) : relatedProducts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-600 text-lg">Немає пов'язаних товарів</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((relatedProduct) => (
                <div
                  key={relatedProduct.id}
                  className="transform transition-transform hover:scale-105"
                >
                  <ProductCard
                    product={relatedProduct}
                    onAddToCart={handleAddToCart}
                    onAddToWishlist={handleAddToWishlist}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
