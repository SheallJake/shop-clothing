"use client";

import { useEffect, useState } from "react";
import ImageWithFallback from "@/components/ImageWithFallback";
import AddToCartButton from "@/components/AddToCartButton";
import AddToWishlistButton from "@/components/AddToWishlistButton";
import PageTransition from "@/components/PageTransition";
import ItemSize from "@/components/ItemSize";
import ReviewSection from "@/components/ReviewSection";
import { colorMapping } from "@/utils/colorMapping";
import {
  Truck,
  MessageSquare,
  CreditCard,
  ChevronDown,
  Heart,
  ShoppingCart,
  Package,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  X,
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
  const [selectedImage, setSelectedImage] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

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
        const response = await fetch(`/api/products/${id}`, {
          headers: {
            Accept: "application/json",
            "Cache-Control": "no-cache",
          },
          cache: "no-store",
        });

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

  const handleOrder = () => {
    addToCart({
      ...product,
      quantity: 1,
      selectedSize: selectedSize,
      selectedColor: selectedColor,
    });
    window.location.href = "/checkout";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-zinc-900 dark:border-white"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-3xl font-bold mb-4 text-zinc-900 dark:text-white">
          Помилка
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          {error || "Товар не знайдено"}
        </p>
        <Link
          href="/products"
          className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-3 rounded hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
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
          {/* Product Image Section */}
          <div className="w-[490px] flex-shrink-0 bg-white dark:bg-zinc-800 rounded-lg p-4 shadow-sm">
            <div className="relative">
              {/* Main Image */}
              <div
                className="relative cursor-zoom-in"
                onMouseMove={(e) => {
                  if (isZoomed) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                    const y = ((e.clientY - rect.top) / rect.height) * 100;
                    setZoomPosition({ x, y });
                  }
                }}
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
              >
                <ImageWithFallback
                  src={selectedImage || product.mainImage}
                  alt={product.name}
                  className="w-full h-auto rounded transition-transform duration-200"
                  style={{
                    transform: isZoomed ? "scale(1.5)" : "scale(1)",
                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  }}
                  priority
                />
                <button
                  className="absolute top-2 right-2 p-2 bg-white/80 dark:bg-zinc-800/80 rounded-full hover:bg-white dark:hover:bg-zinc-800 transition-colors"
                  onClick={() => setIsZoomed(!isZoomed)}
                >
                  <ZoomIn className="w-5 h-5 text-zinc-900 dark:text-white" />
                </button>
              </div>

              {/* Navigation Arrows */}
              {product.galleryImages && product.galleryImages.length > 0 && (
                <>
                  <button
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 dark:bg-zinc-800/80 rounded-full hover:bg-white dark:hover:bg-zinc-800 transition-colors"
                    onClick={() => {
                      const currentIndex = selectedImage
                        ? product.galleryImages.indexOf(selectedImage)
                        : -1;
                      const prevIndex =
                        currentIndex <= 0
                          ? product.galleryImages.length - 1
                          : currentIndex - 1;
                      setSelectedImage(product.galleryImages[prevIndex]);
                    }}
                  >
                    <ChevronLeft className="w-5 h-5 text-zinc-900 dark:text-white" />
                  </button>
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 dark:bg-zinc-800/80 rounded-full hover:bg-white dark:hover:bg-zinc-800 transition-colors"
                    onClick={() => {
                      const currentIndex = selectedImage
                        ? product.galleryImages.indexOf(selectedImage)
                        : -1;
                      const nextIndex =
                        currentIndex === product.galleryImages.length - 1
                          ? 0
                          : currentIndex + 1;
                      setSelectedImage(product.galleryImages[nextIndex]);
                    }}
                  >
                    <ChevronRight className="w-5 h-5 text-zinc-900 dark:text-white" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {product.galleryImages && product.galleryImages.length > 0 && (
              <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                <button
                  className={`flex-shrink-0 w-16 h-16 rounded border-2 transition-colors ${
                    !selectedImage
                      ? "border-zinc-900 dark:border-white"
                      : "border-transparent"
                  }`}
                  onClick={() => setSelectedImage(null)}
                >
                  <ImageWithFallback
                    src={product.mainImage}
                    alt={`${product.name} - Main`}
                    className="w-full h-full object-cover rounded"
                  />
                </button>
                {product.galleryImages.map((image, index) => (
                  <button
                    key={index}
                    className={`flex-shrink-0 w-16 h-16 rounded border-2 transition-colors ${
                      selectedImage === image
                        ? "border-zinc-900 dark:border-white"
                        : "border-transparent"
                    }`}
                    onClick={() => setSelectedImage(image)}
                  >
                    <ImageWithFallback
                      src={image}
                      alt={`${product.name} - Gallery ${index + 1}`}
                      className="w-full h-full object-cover rounded"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details Section */}
          <div className="inline-flex flex-col items-start gap-4 relative w-full max-w-[490px]">
            {/* Product Header */}
            <div className="w-full bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm">
              <div className="flex w-full items-start justify-between">
                <div className="relative w-fit mt-[-1.00px] font-normal text-zinc-900 dark:text-white text-4xl tracking-normal leading-normal">
                  {product.name}
                </div>
                <AddToWishlistButton product={product} />
              </div>

              <p className="relative w-fit font-normal text-zinc-500 dark:text-zinc-400 text-[11px] tracking-normal leading-5 mt-2">
                <span className="font-normal text-zinc-500 dark:text-zinc-400">
                  Article:{" "}
                </span>
                <span className="font-light">{product.article || "N/A"}</span>
              </p>

              <div className="relative w-fit font-semibold text-green-600 dark:text-green-500 text-2xl tracking-normal leading-5 mt-2">
                {product.price} UAH
              </div>
            </div>

            {/* Color Selection Section */}
            {product.color && product.color.length > 0 && (
              <div className="w-full bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm">
                <div className="flex flex-col w-full items-start gap-3">
                  <div className="relative w-fit font-light text-zinc-900 dark:text-white text-[17px] tracking-normal leading-5">
                    КОЛІР
                  </div>
                  <div className="inline-flex items-start gap-[21px] px-[5px] py-[11px] relative">
                    {product.color.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-[27px] h-[27px] rounded-[13.5px] border border-solid border-zinc-200 dark:border-zinc-700 transition-all ${
                          selectedColor === color
                            ? "ring-2 ring-zinc-900 dark:ring-white ring-offset-2"
                            : ""
                        }`}
                        style={{
                          backgroundColor:
                            colorMapping[color.toLowerCase()] ||
                            color.toLowerCase(),
                          boxShadow:
                            selectedColor === color
                              ? "0 0 0 2px rgba(255,255,255,0.5)"
                              : "none",
                        }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Size Selection Section */}
            {product.size && (
              <div className="w-full bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm">
                <div className="flex flex-col w-full items-start gap-3">
                  <div className="relative w-fit font-light text-zinc-900 dark:text-white text-[17px] tracking-normal leading-5">
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
              </div>
            )}

            {/* Size Help Section */}
            <div className="w-full bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm">
              <div className="flex w-[99px] items-start relative">
                <div className="absolute w-[99px] h-px top-[17px] left-0 bg-zinc-900 dark:bg-white" />
                <button className="relative w-[99px] text-xs text-zinc-500 dark:text-zinc-400 text-center tracking-normal leading-5">
                  Help About Size
                </button>
              </div>
            </div>

            {/* Add to Cart Section */}
            <div className="w-full bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm">
              <div className="flex flex-col gap-4">
                <AddToCartButton
                  product={product}
                  selectedSize={selectedSize}
                  selectedColor={selectedColor}
                />
                <button
                  onClick={handleOrder}
                  className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-3 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Package className="w-5 h-5" />
                  <span>Замовити</span>
                </button>
              </div>
            </div>

            {/* Additional Information Sections */}
            <div className="w-full bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm">
              {/* Description */}
              {product.description && (
                <div className="w-full py-4 border-b border-zinc-200 dark:border-zinc-700">
                  <button
                    onClick={() => toggleSection("description")}
                    className="flex w-full items-center justify-between opacity-50 hover:opacity-100 transition-opacity"
                  >
                    <span className="text-sm text-zinc-900 dark:text-white">
                      Description
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform text-zinc-900 dark:text-white ${
                        expandedSections.description ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {expandedSections.description && (
                    <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
                      {product.description}
                    </div>
                  )}
                </div>
              )}

              {/* Structure */}
              {product.structure && (
                <div className="w-full py-4 border-b border-zinc-200 dark:border-zinc-700">
                  <button
                    onClick={() => toggleSection("structure")}
                    className="flex w-full items-center justify-between opacity-50 hover:opacity-100 transition-opacity"
                  >
                    <span className="text-sm text-zinc-900 dark:text-white">
                      Structure
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform text-zinc-900 dark:text-white ${
                        expandedSections.structure ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {expandedSections.structure && (
                    <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
                      {product.structure}
                    </div>
                  )}
                </div>
              )}

              {/* Delivery */}
              <div className="w-full py-4 border-b border-zinc-200 dark:border-zinc-700">
                <button
                  onClick={() => toggleSection("delivery")}
                  className="flex w-full items-center justify-between opacity-50 hover:opacity-100 transition-opacity"
                >
                  <div className="flex items-center gap-2">
                    <Truck className="w-6 h-6 text-zinc-500 dark:text-zinc-400" />
                    <span className="text-sm text-zinc-900 dark:text-white">
                      Delivery
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform text-zinc-900 dark:text-white ${
                      expandedSections.delivery ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {expandedSections.delivery && (
                  <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
                    Free delivery for orders over 1000 UAH
                  </div>
                )}
              </div>

              {/* Payment */}
              <div className="w-full py-4 border-b border-zinc-200 dark:border-zinc-700">
                <button
                  onClick={() => toggleSection("payment")}
                  className="flex w-full items-center justify-between opacity-50 hover:opacity-100 transition-opacity"
                >
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-6 h-6 text-zinc-500 dark:text-zinc-400" />
                    <span className="text-sm text-zinc-900 dark:text-white">
                      Payment
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform text-zinc-900 dark:text-white ${
                      expandedSections.payment ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {expandedSections.payment && (
                  <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
                    We accept credit cards and PayPal
                  </div>
                )}
              </div>

              {/* Reviews */}
              <div className="w-full py-4">
                <button
                  onClick={() => toggleSection("reviews")}
                  className="flex w-full items-center justify-between opacity-50 hover:opacity-100 transition-opacity"
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-6 h-6 text-zinc-500 dark:text-zinc-300" />
                    <span className="text-sm text-zinc-900 dark:text-white">
                      Reviews
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform text-zinc-900 dark:text-white ${
                      expandedSections.reviews ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {expandedSections.reviews && (
                  <div className="mt-4">
                    <ReviewSection productId={id} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* You May Also Like Section */}
        <div className="mt-24 bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-3xl font-normal mb-12 text-center text-zinc-900 dark:text-white">
            Вам також може сподобатись
          </h2>
          {loadingRelated ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-zinc-900 dark:border-white"></div>
            </div>
          ) : errorRelated ? (
            <div className="text-center py-16">
              <p className="text-zinc-600 dark:text-zinc-400 mb-6 text-lg">
                {errorRelated}
              </p>
              <button
                onClick={fetchRelatedProducts}
                className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 underline transition-colors"
              >
                Спробувати ще раз
              </button>
            </div>
          ) : relatedProducts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-zinc-600 dark:text-zinc-400 text-lg">
                Немає пов'язаних товарів
              </p>
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
