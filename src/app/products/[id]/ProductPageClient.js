"use client";

import { useEffect, useState } from "react";
import ImageWithFallback from "@/components/imageWithFallback";
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
import Spinner from "@/components/Spinner";
import { getColorFromName, getContrastTextColor } from "@/utils/colorUtils";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useAuthModal } from "@/context/AuthModalContext";

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
    sizeGuide: false,
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const router = useRouter();
  const { openAuthModal } = useAuthModal();

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
        console.log("[ProductPage] Starting to fetch product with ID:", id);
        setLoading(true);
        const response = await fetch(`/api/products/${id}`, {
          headers: {
            Accept: "application/json",
            "Cache-Control": "no-cache",
          },
          cache: "no-store",
        });

        console.log("[ProductPage] Response status:", response.status);

        if (!response.ok) {
          console.error(
            "[ProductPage] Response not OK:",
            response.status,
            response.statusText
          );
          throw new Error("Product not found");
        }

        const data = await response.json();
        console.log("[ProductPage] Received product data:", {
          id: data.id,
          name: data.name,
          mainImage: data.mainImage,
          galleryImages: data.galleryImages,
        });

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
        console.log("[ProductPage] Setting loading to false");
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

  const handleAddToCart = async (product) => {
    try {
      const res = await fetch("/api/session");
      const data = await res.json();
      if (!data.user) {
        openAuthModal("login");
      } else {
        addToCart(
          {
            ...product,
            quantity: 1,
            selectedSize: selectedSize,
            selectedColor: selectedColor,
          },
          true
        );
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Помилка при додаванні товару до кошика");
    }
  };

  const handleAddToWishlist = (product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleOrder = async () => {
    try {
      const res = await fetch("/api/session");
      const data = await res.json();
      if (!data.user) {
        sessionStorage.setItem("intendedDestination", "/order");
        openAuthModal("login");
      } else {
        await addToCart(
          {
            ...product,
            quantity: 1,
            selectedSize: selectedSize,
            selectedColor: selectedColor,
          },
          true
        );
        router.push("/order");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Помилка при додаванні товару до кошика");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="md" />
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
      <div className="max-w-5xl mx-auto p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          {/* Product Image Section */}
          <div className="w-full lg:w-[490px] flex-shrink-0 bg-white dark:bg-zinc-800 rounded-lg p-2 sm:p-4 shadow-sm">
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
                  className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded border-2 transition-colors ${
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
                    className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded border-2 transition-colors ${
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
          <div className="flex-1 space-y-4">
            {/* Product Header */}
            <div className="w-full bg-white dark:bg-zinc-800 rounded-lg p-4 sm:p-6 shadow-sm">
              <div className="flex w-full items-start justify-between">
                <div className="relative w-fit mt-[-1.00px] font-normal text-zinc-900 dark:text-white text-2xl sm:text-4xl tracking-normal leading-normal">
                  {product.name}
                </div>
                <AddToWishlistButton product={product} />
              </div>

              <p className="relative w-fit font-normal text-zinc-500 dark:text-zinc-400 text-[11px] tracking-normal leading-5 mt-2">
                <span className="font-normal text-zinc-500 dark:text-zinc-400">
                  Артикул:{" "}
                </span>
                <span className="font-light">{product.article || "N/A"}</span>
              </p>

              <div className="relative w-fit font-semibold text-green-600 dark:text-green-500 text-xl sm:text-2xl tracking-normal leading-5 mt-2">
                {product.price} UAH
              </div>
            </div>

            {/* Color Selection Section */}
            {product.color && product.color.length > 0 && (
              <div className="w-full bg-white dark:bg-zinc-800 rounded-lg p-4 sm:p-6 shadow-sm">
                <div className="flex flex-col w-full items-start gap-3">
                  <div className="flex justify-between items-center w-full">
                    <div className="relative w-fit font-light text-zinc-900 dark:text-white text-[17px] tracking-normal leading-5">
                      КОЛІР
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.color.map((color) => {
                      const colorStyle = getColorFromName(color);
                      return (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`w-8 h-8 rounded-full border-2 transition-colors ${
                            selectedColor === color
                              ? "border-zinc-900 dark:border-white"
                              : "border-transparent"
                          }`}
                          style={colorStyle}
                          title={color}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Size Selection Section */}
            {product.size ? (
              <div className="w-full bg-white dark:bg-zinc-800 rounded-lg p-4 sm:p-6 shadow-sm">
                <div className="flex flex-col w-full items-start gap-3">
                  <div className="flex justify-between items-center w-full">
                    <div className="relative w-fit font-light text-zinc-900 dark:text-white text-[17px] tracking-normal leading-5">
                      РОЗМІР
                    </div>
                    <button
                      className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors flex items-center gap-1"
                      onClick={() => toggleSection("sizeGuide")}
                    >
                      <span>Таблиця розмірів</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          expandedSections.sizeGuide ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 w-full">
                    {(Array.isArray(product.size)
                      ? product.size
                      : [product.size]
                    )
                      .flatMap((size) => size.split(/[,\s]+/).filter(Boolean))
                      .map((size) => (
                        <div key={size} className="relative">
                          <button
                            onClick={() => setSelectedSize(size)}
                            className={`w-full h-10 flex items-center justify-center text-sm font-medium border rounded transition-all ${
                              selectedSize === size
                                ? "border-zinc-900 dark:border-white bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                                : "border-[var(--card-border)] hover:border-[var(--foreground)] hover:bg-[var(--hover-bg)] text-[var(--foreground)]"
                            }`}
                          >
                            {size.toUpperCase()}
                          </button>
                        </div>
                      ))}
                  </div>
                  {expandedSections.sizeGuide && (
                    <div className="w-full mt-4 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                      <h4 className="text-sm font-medium mb-2">
                        Як визначити свій розмір:
                      </h4>
                      <ol className="text-sm text-zinc-600 dark:text-zinc-400 space-y-2 list-decimal list-inside">
                        <li>Виміряйте обхват грудей на найширшій частині</li>
                        <li>Виміряйте обхват талії на найвужчій частині</li>
                        <li>Виміряйте обхват стегон на найширшій частині</li>
                        <li>Порівняйте свої виміри з таблицею розмірів</li>
                      </ol>
                      <div className="mt-4 overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                          <thead>
                            <tr className="border-b border-zinc-200 dark:border-zinc-700">
                              <th className="py-2 px-3 text-left">Розмір</th>
                              <th className="py-2 px-3 text-left">
                                Груди (см)
                              </th>
                              <th className="py-2 px-3 text-left">
                                Талія (см)
                              </th>
                              <th className="py-2 px-3 text-left">
                                Стегна (см)
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-zinc-200 dark:border-zinc-700">
                              <td className="py-2 px-3">XS</td>
                              <td className="py-2 px-3">82-86</td>
                              <td className="py-2 px-3">62-66</td>
                              <td className="py-2 px-3">88-92</td>
                            </tr>
                            <tr className="border-b border-zinc-200 dark:border-zinc-700">
                              <td className="py-2 px-3">S</td>
                              <td className="py-2 px-3">86-90</td>
                              <td className="py-2 px-3">66-70</td>
                              <td className="py-2 px-3">92-96</td>
                            </tr>
                            <tr className="border-b border-zinc-200 dark:border-zinc-700">
                              <td className="py-2 px-3">M</td>
                              <td className="py-2 px-3">90-94</td>
                              <td className="py-2 px-3">70-74</td>
                              <td className="py-2 px-3">96-100</td>
                            </tr>
                            <tr className="border-b border-zinc-200 dark:border-zinc-700">
                              <td className="py-2 px-3">L</td>
                              <td className="py-2 px-3">94-98</td>
                              <td className="py-2 px-3">74-78</td>
                              <td className="py-2 px-3">100-104</td>
                            </tr>
                            <tr className="border-b border-zinc-200 dark:border-zinc-700">
                              <td className="py-2 px-3">XL</td>
                              <td className="py-2 px-3">98-102</td>
                              <td className="py-2 px-3">78-82</td>
                              <td className="py-2 px-3">104-108</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-3">XXL</td>
                              <td className="py-2 px-3">102-106</td>
                              <td className="py-2 px-3">82-86</td>
                              <td className="py-2 px-3">108-112</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="w-full bg-white dark:bg-zinc-800 rounded-lg p-4 sm:p-6 shadow-sm">
                <div className="flex flex-col w-full items-start gap-3">
                  <div className="flex justify-between items-center w-full">
                    <div className="relative w-fit font-light text-zinc-900 dark:text-white text-[17px] tracking-normal leading-5">
                      РОЗМІР
                    </div>
                  </div>
                  <div className="w-full">
                    <div className="w-full h-10 flex items-center justify-center text-sm font-medium border border-[var(--card-border)] rounded">
                      CUSTOM
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Product Actions */}
            <div className="w-full bg-white dark:bg-zinc-800 rounded-lg p-4 sm:p-6 shadow-sm">
              <div className="flex flex-col gap-4">
                <AddToCartButton product={product} />
                <button
                  onClick={() => handleOrder()}
                  className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-3 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Купити зараз</span>
                </button>
              </div>
            </div>

            {/* Additional Information Sections */}
            <div className="w-full bg-white dark:bg-zinc-800 rounded-lg p-4 sm:p-6 shadow-sm">
              {/* Description */}
              {product.description && (
                <div className="w-full py-4 border-b border-zinc-200 dark:border-zinc-700">
                  <button
                    onClick={() => toggleSection("description")}
                    className="flex w-full items-center justify-between opacity-50 hover:opacity-100 transition-opacity"
                  >
                    <span className="text-sm text-zinc-900 dark:text-white">
                      Опис
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
                      Склад
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
                  <span className="text-sm text-zinc-900 dark:text-white">
                    Доставка
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform text-zinc-900 dark:text-white ${
                      expandedSections.delivery ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {expandedSections.delivery && (
                  <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
                    <div className="flex items-start gap-2 mb-4">
                      <Truck className="w-5 h-5 text-zinc-900 dark:text-white flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-zinc-900 dark:text-white mb-1">
                          Доставка по Україні
                        </h4>
                        <p>
                          Доставка здійснюється через Нову Пошту та Укрпошту.
                          Термін доставки 1-3 дні.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment */}
              <div className="w-full py-4">
                <button
                  onClick={() => toggleSection("payment")}
                  className="flex w-full items-center justify-between opacity-50 hover:opacity-100 transition-opacity"
                >
                  <span className="text-sm text-zinc-900 dark:text-white">
                    Оплата
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform text-zinc-900 dark:text-white ${
                      expandedSections.payment ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {expandedSections.payment && (
                  <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
                    <div className="flex items-start gap-2">
                      <CreditCard className="w-5 h-5 text-zinc-900 dark:text-white flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-zinc-900 dark:text-white mb-1">
                          Способи оплати
                        </h4>
                        <p>
                          Оплата при отриманні, банківською картою онлайн або
                          через термінал.
                        </p>
                      </div>
                    </div>
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
                    <MessageSquare className="w-5 h-5 text-zinc-900 dark:text-white" />
                    <span className="text-sm text-zinc-900 dark:text-white">
                      Відгуки
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

        {/* Related Products Section */}
        <div className="mt-12 sm:mt-24 bg-white dark:bg-zinc-800 rounded-lg p-4 sm:p-6 shadow-sm">
          <h2 className="text-2xl sm:text-3xl font-normal mb-8 sm:mb-12 text-center text-zinc-900 dark:text-white">
            Вам також може сподобатися
          </h2>
          {loadingRelated ? (
            <div className="flex justify-center py-16">
              <Spinner size="md" />
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
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
