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
  BiTruck,
  BiMessageSquare,
  BiCreditCard,
  BiChevronDown,
  BiShoppingBag,
  BiZoomIn,
  BiChevronLeft,
  BiChevronRight,
} from "react-icons/bi";
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
      <div className="loading-state">
        <Spinner size="md" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container-main">
        <div className="empty-state">
          <h2 className="heading-1 mb-4">Помилка</h2>
          <p className="empty-message mb-6">
            {error || "Товар не знайдено"}
          </p>
          <Link href="/products" className="btn-primary inline-flex">
            Повернутися до каталогу
          </Link>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="container-main">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Product Image Section */}
          <div className="w-full lg:w-[490px] flex-shrink-0 card shadow-card rounded-3xl p-4 sm:p-6">
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
                  className="absolute top-2 right-2 p-2 bg-[var(--card-bg)]/80 backdrop-blur-sm rounded-full hover:bg-[var(--card-bg)] transition-colors border border-[var(--border)]"
                  onClick={() => setIsZoomed(!isZoomed)}
                >
                  <BiZoomIn className="w-5 h-5 text-primary" />
                </button>
              </div>

              {/* Navigation Arrows */}
              {product.galleryImages && product.galleryImages.length > 0 && (
                <>
                  <button
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-[var(--card-bg)]/80 backdrop-blur-sm rounded-full hover:bg-[var(--card-bg)] transition-colors border border-[var(--border)]"
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
                    <BiChevronLeft className="w-5 h-5 text-primary" />
                  </button>
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[var(--card-bg)]/80 backdrop-blur-sm rounded-full hover:bg-[var(--card-bg)] transition-colors border border-[var(--border)]"
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
                    <BiChevronRight className="w-5 h-5 text-primary" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {product.galleryImages && product.galleryImages.length > 0 && (
              <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                <button
                  className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg border-2 transition-colors overflow-hidden ${
                    !selectedImage
                      ? "border-[var(--btn-primary)]"
                      : "border-[var(--card-border)] hover:border-[var(--btn-primary)]"
                  }`}
                  onClick={() => setSelectedImage(null)}
                >
                  <ImageWithFallback
                    src={product.mainImage}
                    alt={`${product.name} - Main`}
                    className="w-full h-full object-cover"
                  />
                </button>
                {product.galleryImages.map((image, index) => (
                  <button
                    key={index}
                    className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg border-2 transition-colors overflow-hidden ${
                      selectedImage === image
                        ? "border-[var(--btn-primary)]"
                        : "border-[var(--card-border)] hover:border-[var(--btn-primary)]"
                    }`}
                    onClick={() => setSelectedImage(image)}
                  >
                    <ImageWithFallback
                      src={image}
                      alt={`${product.name} - Gallery ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details Section */}
          <div className="flex-1 space-y-6">
            {/* Product Header */}
            <div className="card shadow-card rounded-3xl p-4 sm:p-6">
              <div className="flex w-full items-start justify-between mb-4">
                <h1 className="heading-1 flex-1 pr-4">
                  {product.name}
                </h1>
                <AddToWishlistButton product={product} />
              </div>

              <p className="text-muted text-xs mb-4">
                <span>Артикул: </span>
                <span className="font-light">{product.article || "N/A"}</span>
              </p>

              <div className="flex items-baseline gap-3">
                {product.isDiscountActive && product.discountPrice ? (
                  <>
                    <div className="text-2xl sm:text-3xl font-bold text-primary">
                      {Math.round(product.discountPrice)} ₴
                    </div>
                    <div className="text-lg text-muted line-through">
                      {Math.round(product.price)} ₴
                    </div>
                    <div className="badge badge-pending">
                      -{Math.round((1 - product.discountPrice / product.price) * 100)}%
                    </div>
                  </>
                ) : (
                  <div className="text-2xl sm:text-3xl font-bold text-primary">
                    {Math.round(product.price)} ₴
                  </div>
                )}
              </div>
            </div>

            {/* Color Selection Section */}
            {product.color && product.color.length > 0 && (
              <div className="card shadow-card rounded-3xl p-4 sm:p-6">
                <div className="flex flex-col w-full items-start gap-4">
                  <h3 className="heading-2 uppercase">
                    Колір
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.color.map((color) => {
                      const colorStyle = getColorFromName(color);
                      return (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`w-10 h-10 rounded-full border-2 transition-all hover:scale-110 ${
                            selectedColor === color
                              ? "border-[var(--btn-primary)] ring-2 ring-[var(--btn-primary)] ring-offset-2"
                              : "border-[var(--card-border)] hover:border-[var(--btn-primary)]"
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
              <div className="card shadow-card rounded-3xl p-4 sm:p-6">
                <div className="flex flex-col w-full items-start gap-4">
                  <div className="flex justify-between items-center w-full">
                    <h3 className="heading-2 uppercase">
                      Розмір
                    </h3>
                    <button
                      className="text-xs text-muted hover:text-primary transition-colors flex items-center gap-1"
                      onClick={() => toggleSection("sizeGuide")}
                    >
                      <span>Таблиця розмірів</span>
                      <BiChevronDown
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
                            className={`w-full h-10 flex items-center justify-center text-sm font-medium border rounded-lg transition-all ${
                              selectedSize === size
                                ? "border-[var(--btn-primary)] bg-[var(--btn-primary)] text-[var(--text-inverse)]"
                                : "border-[var(--card-border)] hover:border-[var(--btn-primary)] hover:bg-[var(--hover-bg)] text-primary"
                            }`}
                          >
                            {size.toUpperCase()}
                          </button>
                        </div>
                      ))}
                  </div>
                  {expandedSections.sizeGuide && (
                    <div className="w-full mt-4 p-4 bg-[var(--hover-bg)] rounded-lg">
                      <h4 className="text-sm font-medium mb-2 text-primary">
                        Як визначити свій розмір:
                      </h4>
                      <ol className="text-sm text-secondary space-y-2 list-decimal list-inside">
                        <li>Виміряйте обхват грудей на найширшій частині</li>
                        <li>Виміряйте обхват талії на найвужчій частині</li>
                        <li>Виміряйте обхват стегон на найширшій частині</li>
                        <li>Порівняйте свої виміри з таблицею розмірів</li>
                      </ol>
                      <div className="mt-4 overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                          <thead>
                            <tr className="border-b border-[var(--border)]">
                              <th className="py-2 px-3 text-left text-primary">Розмір</th>
                              <th className="py-2 px-3 text-left text-primary">
                                Груди (см)
                              </th>
                              <th className="py-2 px-3 text-left text-primary">
                                Талія (см)
                              </th>
                              <th className="py-2 px-3 text-left text-primary">
                                Стегна (см)
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-[var(--border)]">
                              <td className="py-2 px-3 text-secondary">XS</td>
                              <td className="py-2 px-3 text-secondary">82-86</td>
                              <td className="py-2 px-3 text-secondary">62-66</td>
                              <td className="py-2 px-3 text-secondary">88-92</td>
                            </tr>
                            <tr className="border-b border-[var(--border)]">
                              <td className="py-2 px-3 text-secondary">S</td>
                              <td className="py-2 px-3 text-secondary">86-90</td>
                              <td className="py-2 px-3 text-secondary">66-70</td>
                              <td className="py-2 px-3 text-secondary">92-96</td>
                            </tr>
                            <tr className="border-b border-[var(--border)]">
                              <td className="py-2 px-3 text-secondary">M</td>
                              <td className="py-2 px-3 text-secondary">90-94</td>
                              <td className="py-2 px-3 text-secondary">70-74</td>
                              <td className="py-2 px-3 text-secondary">96-100</td>
                            </tr>
                            <tr className="border-b border-[var(--border)]">
                              <td className="py-2 px-3 text-secondary">L</td>
                              <td className="py-2 px-3 text-secondary">94-98</td>
                              <td className="py-2 px-3 text-secondary">74-78</td>
                              <td className="py-2 px-3 text-secondary">100-104</td>
                            </tr>
                            <tr className="border-b border-[var(--border)]">
                              <td className="py-2 px-3 text-secondary">XL</td>
                              <td className="py-2 px-3 text-secondary">98-102</td>
                              <td className="py-2 px-3 text-secondary">78-82</td>
                              <td className="py-2 px-3 text-secondary">104-108</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-3 text-secondary">XXL</td>
                              <td className="py-2 px-3 text-secondary">102-106</td>
                              <td className="py-2 px-3 text-secondary">82-86</td>
                              <td className="py-2 px-3 text-secondary">108-112</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="card shadow-card rounded-3xl p-4 sm:p-6">
                <div className="flex flex-col w-full items-start gap-4">
                  <h3 className="heading-2 uppercase">
                    Розмір
                  </h3>
                  <div className="w-full">
                    <div className="w-full h-10 flex items-center justify-center text-sm font-medium border border-[var(--card-border)] rounded-lg text-secondary">
                      CUSTOM
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Product Actions */}
            <div className="card shadow-card rounded-3xl p-4 sm:p-6">
              <div className="flex flex-col gap-4">
                <AddToCartButton product={product} />
                <button
                  onClick={() => handleOrder()}
                  className="btn-success w-full flex items-center justify-center gap-2 rounded-full"
                >
                  <BiShoppingBag className="w-5 h-5" />
                  <span>Купити зараз</span>
                </button>
              </div>
            </div>

            {/* Additional Information Sections */}
            <div className="card shadow-card rounded-3xl p-4 sm:p-6">
              {/* Description */}
              {product.description && (
                <div className="w-full py-4 border-b border-[var(--border)]">
                  <button
                    onClick={() => toggleSection("description")}
                    className="flex w-full items-center justify-between hover:opacity-80 transition-opacity"
                  >
                    <span className="text-sm text-primary font-medium">
                      Опис
                    </span>
                    <BiChevronDown
                      className={`w-4 h-4 transition-transform text-primary ${
                        expandedSections.description ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {expandedSections.description && (
                    <div className="mt-4 text-sm text-secondary">
                      {product.description}
                    </div>
                  )}
                </div>
              )}

              {/* Structure */}
              {product.structure && (
                <div className="w-full py-4 border-b border-[var(--border)]">
                  <button
                    onClick={() => toggleSection("structure")}
                    className="flex w-full items-center justify-between hover:opacity-80 transition-opacity"
                  >
                    <span className="text-sm text-primary font-medium">
                      Склад
                    </span>
                    <BiChevronDown
                      className={`w-4 h-4 transition-transform text-primary ${
                        expandedSections.structure ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {expandedSections.structure && (
                    <div className="mt-4 text-sm text-secondary">
                      {product.structure}
                    </div>
                  )}
                </div>
              )}

              {/* Delivery */}
              <div className="w-full py-4 border-b border-[var(--border)]">
                <button
                  onClick={() => toggleSection("delivery")}
                  className="flex w-full items-center justify-between hover:opacity-80 transition-opacity"
                >
                  <span className="text-sm text-primary font-medium">
                    Доставка
                  </span>
                  <BiChevronDown
                    className={`w-4 h-4 transition-transform text-primary ${
                      expandedSections.delivery ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {expandedSections.delivery && (
                  <div className="mt-4 text-sm text-secondary">
                    <div className="flex items-start gap-2 mb-4">
                      <BiTruck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-primary mb-1">
                          Доставка по Україні
                        </h4>
                        <p className="text-secondary">
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
                  className="flex w-full items-center justify-between hover:opacity-80 transition-opacity"
                >
                  <span className="text-sm text-primary font-medium">
                    Оплата
                  </span>
                  <BiChevronDown
                    className={`w-4 h-4 transition-transform text-primary ${
                      expandedSections.payment ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {expandedSections.payment && (
                  <div className="mt-4 text-sm text-secondary">
                    <div className="flex items-start gap-2">
                      <BiCreditCard className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-primary mb-1">
                          Способи оплати
                        </h4>
                        <p className="text-secondary">
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
                  className="flex w-full items-center justify-between hover:opacity-80 transition-opacity"
                >
                  <div className="flex items-center gap-2">
                    <BiMessageSquare className="w-5 h-5 text-primary" />
                    <span className="text-sm text-primary font-medium">
                      Відгуки
                    </span>
                  </div>
                  <BiChevronDown
                    className={`w-4 h-4 transition-transform text-primary ${
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
        <div className="page-section mt-12 sm:mt-16">
          <h2 className="section-title text-center mb-8 sm:mb-12">
            Вам також може сподобатися
          </h2>
          {loadingRelated ? (
            <div className="loading-state">
              <Spinner size="md" />
            </div>
          ) : errorRelated ? (
            <div className="error-state">
              <p className="error-message mb-6">
                {errorRelated}
              </p>
              <button
                onClick={fetchRelatedProducts}
                className="btn-secondary"
              >
                Спробувати ще раз
              </button>
            </div>
          ) : relatedProducts.length === 0 ? (
            <div className="empty-state">
              <p className="empty-message">
                Немає пов'язаних товарів
              </p>
            </div>
          ) : (
            <div className="section-grid">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
