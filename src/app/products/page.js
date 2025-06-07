"use client";
import { useEffect, useState } from "react";
import ImageWithFallback from "@/components/ImageWithFallback";
import { useSearchParams } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";
import PageTransition from "@/components/PageTransition";
import ProductFilters from "@/components/ProductFilters";
import { colorMapping } from "@/utils/colorMapping";
import ProductCard from "@/components/ProductCard";

const ITEMS_PER_PAGE = 20;

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");
  const [products, setProducts] = useState([]);
  const [sortType, setSortType] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isCatalogVisible, setIsCatalogVisible] = useState(false);
  const [selectedColors, setSelectedColors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSticky, setIsSticky] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [filters, setFilters] = useState({
    categories: [],
    colors: [],
    sizes: [],
    brands: [],
    priceRange: { min: 0, max: Infinity },
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);

      // Визначаємо, коли елемент має стати sticky
      // 64 - це висота навігації
      if (currentScrollY > 64) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch products or search results
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setIsCatalogVisible(false);
      setError(null);
      try {
        let url = query
          ? `/api/search?q=${encodeURIComponent(query)}`
          : "/api/products";

        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch products");
        }

        setProducts(query ? data.products || [] : data);
        setIsCatalogVisible(true);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [query]);

  // Handle URL parameters
  useEffect(() => {
    const category = searchParams.get("category");
    if (category) {
      setFilters((prev) => ({
        ...prev,
        categories: [category],
      }));
    }
  }, [searchParams]);

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      if (filterType === "priceRange") {
        newFilters.priceRange = value;
      } else if (filterType === "categories") {
        newFilters[filterType] = value;
      } else if (Array.isArray(prev[filterType])) {
        if (prev[filterType].includes(value)) {
          newFilters[filterType] = prev[filterType].filter((v) => v !== value);
        } else {
          newFilters[filterType] = [...prev[filterType], value];
        }
      }
      return newFilters;
    });
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      colors: [],
      sizes: [],
      brands: [],
      priceRange: { min: 0, max: Infinity },
    });
    setCurrentPage(1);
  };

  const filteredProducts = products.filter((product) => {
    // Category filter
    if (
      filters.categories.length > 0 &&
      !filters.categories.includes(product.category?.name)
    ) {
      return false;
    }

    // Color filter
    if (
      filters.colors.length > 0 &&
      !product.color?.some((c) => filters.colors.includes(c))
    ) {
      return false;
    }

    // Size filter
    if (filters.sizes.length > 0 && !filters.sizes.includes(product.size)) {
      return false;
    }

    // Brand filter
    if (filters.brands.length > 0 && !filters.brands.includes(product.brand)) {
      return false;
    }

    // Price range filter
    if (
      product.price < filters.priceRange.min ||
      product.price > filters.priceRange.max
    ) {
      return false;
    }

    return true;
  });

  // Calculate pagination for filtered products
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const sortProducts = (type) => {
    let sorted = [...filteredProducts];
    if (type === "price-asc") {
      sorted.sort((a, b) => a.price - b.price);
    } else if (type === "price-desc") {
      sorted.sort((a, b) => b.price - a.price);
    } else if (type === "reviews-desc") {
      sorted.sort((a, b) => {
        // First sort by average rating
        const ratingDiff = (b.averageRating || 0) - (a.averageRating || 0);
        if (ratingDiff !== 0) return ratingDiff;

        // If ratings are equal, sort by number of reviews
        return (b.reviewCount || 0) - (a.reviewCount || 0);
      });
    } else if (type === "reviews-asc") {
      sorted.sort((a, b) => {
        // First sort by average rating
        const ratingDiff = (a.averageRating || 0) - (b.averageRating || 0);
        if (ratingDiff !== 0) return ratingDiff;

        // If ratings are equal, sort by number of reviews
        return (a.reviewCount || 0) - (b.reviewCount || 0);
      });
    }
    setProducts(sorted);
    setSortType(type);
    setDropdownOpen(false);
    setCurrentPage(1);
  };

  // Handle page change without animation
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 2) {
        end = 4;
      }
      if (currentPage >= totalPages - 1) {
        start = totalPages - 3;
      }

      if (start > 2) {
        pages.push("...");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const handleColorSelect = (productId, color) => {
    setSelectedColors((prev) => ({
      ...prev,
      [productId]: color,
    }));
  };

  const handleCategoryClick = (category) => {
    setFilters((prev) => ({
      ...prev,
      categories: [category],
    }));
    setCurrentPage(1);
    // Оновлюємо URL без перезавантаження сторінки
    const url = new URL(window.location);
    url.searchParams.set("category", category);
    window.history.pushState({}, "", url);
  };

  return (
    <PageTransition>
      <div className="flex flex-col min-h-[calc(100vh-64px-80px)]">
        <div className="px-6 py-4 flex-1">
          {/* Search results heading */}
          {query && (
            <h1 className="text-2xl font-bold mb-6">
              Результати пошуку для "{query}"
            </h1>
          )}

          {/* Sorting and filtering block - now sticky */}
          <div
            className={`sticky top-[80px] z-10 bg-[var(--card-bg)] dark:bg-black rounded-lg p-2 shadow-[0_0_5px_var(--glow-color)] ${
              isSticky ? "shadow-md" : ""
            }`}
            style={
              {
                /* Removed framer-motion styles */
              }
            }
          >
            <div className="flex justify-between items-center py-4 px-4">
              <div className="relative">
                <button
                  className="border border-[var(--card-border)] px-4 py-2 bg-[var(--card-bg)] rounded-lg p-2"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  Сортувати за
                </button>

                {dropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-[var(--card-bg)] border border-[var(--card-border)] rounded shadow-lg z-20 w-60">
                    <button
                      className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-[var(--hover-bg)]"
                      onClick={() => sortProducts("price-asc")}
                    >
                      <ArrowUp size={16} /> За зростанням ціни
                    </button>
                    <button
                      className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-[var(--hover-bg)]"
                      onClick={() => sortProducts("price-desc")}
                    >
                      <ArrowDown size={16} /> За спаданням ціни
                    </button>
                    <button
                      className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-[var(--hover-bg)]"
                      onClick={() => sortProducts("reviews-desc")}
                    >
                      <Star size={16} /> За найвищими рейтингами
                    </button>
                    <button
                      className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-[var(--hover-bg)]"
                      onClick={() => sortProducts("reviews-asc")}
                    >
                      <Star size={16} /> За найнижчими рейтингами
                    </button>
                  </div>
                )}
              </div>

              <button
                className="border border-[var(--card-border)] px-4 py-2 rounded bg-[var(--card-bg)] hover:bg-[var(--hover-bg)]"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                Фільтрувати
              </button>
            </div>

            {/* Active filters */}
            {(filters.categories.length > 0 ||
              filters.colors.length > 0 ||
              filters.sizes.length > 0 ||
              filters.brands.length > 0 ||
              filters.priceRange.min > 0 ||
              filters.priceRange.max < Infinity) && (
              <div className="flex flex-wrap gap-2 py-3 px-4 border-t border-[var(--card-border)]">
                {filters.categories.map((category) => (
                  <div
                    key={`category-${category}`}
                    className="flex items-center gap-1 bg-[var(--card-bg)] px-3 py-1 rounded-full text-sm  border border-[var(--card-border)]"
                  >
                    <span>Категорія: {category}</span>
                    <button
                      onClick={() => handleFilterChange("categories", [])}
                      className="hover:text-red-400 text-gray-400 ml-1"
                    >
                      ⨉
                    </button>
                  </div>
                ))}
                {filters.colors.map((color) => (
                  <div
                    key={`color-${color}`}
                    className="flex items-center gap-1 bg-[var(--card-bg)] px-3 py-1 rounded-full text-sm  border border-[var(--card-border)]"
                  >
                    <span>Колір: {color}</span>
                    <button
                      onClick={() => handleFilterChange("colors", color)}
                      className="hover:text-red-400 text-gray-400 ml-1"
                    >
                      ⨉
                    </button>
                  </div>
                ))}
                {filters.sizes.map((size) => (
                  <div
                    key={`size-${size}`}
                    className="flex items-center gap-1 bg-[var(--card-bg)] px-3 py-1 rounded-full text-sm  border border-[var(--card-border)]"
                  >
                    <span>Розмір: {size}</span>
                    <button
                      onClick={() => handleFilterChange("sizes", size)}
                      className="hover:text-red-400 text-gray-400 ml-1"
                    >
                      ⨉
                    </button>
                  </div>
                ))}
                {filters.brands.map((brand) => (
                  <div
                    key={`brand-${brand}`}
                    className="flex items-center gap-1 bg-[var(--card-bg)] px-3 py-1 rounded-full text-sm  border border-[var(--card-border)]"
                  >
                    <span>Бренд: {brand}</span>
                    <button
                      onClick={() => handleFilterChange("brands", brand)}
                      className="hover:text-red-400 text-gray-400 ml-1"
                    >
                      ⨉
                    </button>
                  </div>
                ))}
                {(filters.priceRange.min > 0 ||
                  filters.priceRange.max < Infinity) && (
                  <div className="flex items-center gap-1 bg-[var(--card-bg)] px-3 py-1 rounded-full text-sm  border border-[var(--card-border)]">
                    <span>
                      Ціна:{" "}
                      {filters.priceRange.min > 0 &&
                      filters.priceRange.max < Infinity
                        ? `${filters.priceRange.min} - ${filters.priceRange.max} грн`
                        : filters.priceRange.min > 0
                        ? `Від ${filters.priceRange.min} грн`
                        : `До ${filters.priceRange.max} грн`}
                    </span>
                    <button
                      onClick={() =>
                        handleFilterChange("priceRange", {
                          min: 0,
                          max: Infinity,
                        })
                      }
                      className="hover:text-red-400 text-gray-400 ml-1"
                    >
                      ⨉
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600">{error}</p>
            </div>
          ) : isLoading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--card-border)]"></div>
            </div>
          ) : (
            <div className="flex gap-4 mt-8">
              <ProductFilters
                products={products}
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={clearFilters}
                isFilterOpen={isFilterOpen}
                onCloseFilter={() => setIsFilterOpen(false)}
              />

              {/* Products */}
              <div className="flex-1">
                {currentProducts.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    {query
                      ? "Товарів не знайдено за вашим запитом"
                      : "Товарів не знайдено"}
                  </p>
                ) : (
                  <div
                    key={currentPage}
                    className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 ${
                      isCatalogVisible
                        ? "catalog-grid-visible"
                        : "catalog-grid-hidden"
                    }`}
                    style={{ position: "relative", zIndex: 2 }}
                  >
                    {currentProducts.map((product, index) => (
                      <div key={product.id} style={{}}>
                        <ProductCard product={product} index={index} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && !isLoading && !error && (
          <div
            className="px-6 py-2 bg-[var(--card-bg)] dark:bg-black rounded-lg p-2 shadow-[0_0_2px_var(--glow-color)] relative"
            style={{ zIndex: 1 }}
          >
            <div className="flex justify-center items-center gap-2 bg-[var(--card-bg)] dark:bg-black">
              <button
                onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border rounded hover:bg-[var(--hover-bg)] bg-[var(--card-bg)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={20} />
              </button>

              {getPageNumbers().map((page, index) => (
                <button
                  key={index}
                  onClick={() =>
                    typeof page === "number" && handlePageChange(page)
                  }
                  disabled={page === "..."}
                  className={`px-4 py-2 border rounded ${
                    page === currentPage
                      ? "bg-[var(--background)] shadow-[0_0_10px_var(--glow-color)]"
                      : "hover:bg-[var(--hover-bg)]"
                  } ${
                    page === "..." ? "cursor-default" : ""
                  } transition-colors`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() =>
                  handlePageChange(Math.min(currentPage + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="p-2 border rounded hover:bg-[var(--hover-bg)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
