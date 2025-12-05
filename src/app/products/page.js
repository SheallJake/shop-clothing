"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  BiChevronUp,
  BiChevronDown,
  BiStar,
  BiChevronLeft,
  BiChevronRight,
  BiFilter,
} from "react-icons/bi";
import PageTransition from "@/components/PageTransition";
import ProductFilters from "@/components/ProductFilters";
import ProductCard from "@/components/ProductCard";
import { motion, AnimatePresence } from "framer-motion";
import Spinner from "@/components/Spinner";

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
  const [filters, setFilters] = useState({
    categories: [],
    colors: [],
    sizes: [],
    brands: [],
    priceRange: { min: 0, max: Infinity },
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  // Handle scroll
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const shouldBeSticky = currentScrollY > 100;
          
          setIsSticky((prev) => {
            // Only update if state actually changes
            if (prev !== shouldBeSticky) {
              return shouldBeSticky;
            }
            return prev;
          });
          
          ticking = false;
        });
        ticking = true;
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

  const sortProducts = useCallback((type) => {
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
    setCurrentPage(1);
    setDropdownOpen(false);
  }, [filteredProducts]);

  // Handle page change without animation
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    // Scroll to the top of the page
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
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

  const handleCategoryClick = useCallback((category) => {
    setFilters((prev) => ({
      ...prev,
      categories: [category],
    }));
    setCurrentPage(1);
    // Оновлюємо URL без перезавантаження сторінки
    const url = new URL(window.location);
    url.searchParams.set("category", category);
    window.history.pushState({}, "", url);
  }, []);

  const toggleDropdown = useCallback((e) => {
    e?.stopPropagation();
    setDropdownOpen((prev) => !prev);
  }, []);

  const toggleFilters = useCallback(() => {
    setIsFilterOpen((prev) => !prev);
  }, []);

  return (
    <PageTransition>
      <div className="relative overflow-x-hidden">
        <div className="relative max-w-[1400px] mx-auto px-4 py-4 md:px-8 md:py-8">
          {/* Search results heading */}
          {query && (
            <div className="mb-6">
              <h1 className="section-title">
                Результати пошуку для "{query}"
              </h1>
            </div>
          )}

          {/* Sorting and filtering block - now sticky */}
          <div className="sticky top-0 z-30 mb-6" style={{ willChange: "transform" }}>
            <motion.div
              animate={{
                boxShadow: isSticky 
                  ? "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
                  : "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)"
              }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="border-[0.1px] border-[var(--card-border)] bg-[var(--card-bg)] shadow-card backdrop-blur-card rounded-3xl p-4"
              style={{ transition: "none" }}
            >
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
              <div className="relative w-full sm:w-auto" ref={dropdownRef}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="w-full sm:w-auto btn-secondary rounded-full flex items-center justify-between sm:justify-start gap-2"
                  style={{ transition: "none" }}
                  onClick={toggleDropdown}
                >
                  <span className="text-sm md:text-base text-[var(--text-inverse)]">
                    Сортувати
                  </span>
                  <motion.div
                    animate={{ rotate: dropdownOpen ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    style={{ transition: "none" }}
                  >
                    <BiChevronDown
                      size={18}
                      className="text-[var(--text-inverse)]"
                    />
                  </motion.div>
                </motion.button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ 
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                        mass: 0.5
                      }}
                      style={{ transition: "none" }}
                      className="absolute top-full left-0 right-0 sm:right-auto mt-2 search-dropdown w-full sm:w-64 max-h-80"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <motion.button
                        whileHover={{ scale: 1.01, x: 2 }}
                        whileTap={{ scale: 0.99 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        style={{ transition: "none" }}
                        className="search-result-item justify-start text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          sortProducts("price-asc");
                        }}
                      >
                        <BiChevronUp size={16} className="text-primary" />
                        <span className="text-primary">
                          За зростанням ціни
                        </span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.01, x: 2 }}
                        whileTap={{ scale: 0.99 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        style={{ transition: "none" }}
                        className="search-result-item justify-start text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          sortProducts("price-desc");
                        }}
                      >
                        <BiChevronDown size={16} className="text-primary" />
                        <span className="text-primary">
                          За спаданням ціни
                        </span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.01, x: 2 }}
                        whileTap={{ scale: 0.99 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        style={{ transition: "none" }}
                        className="search-result-item justify-start text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          sortProducts("reviews-desc");
                        }}
                      >
                        <BiStar size={16} className="text-primary" />
                        <span className="text-primary">
                          За найвищими рейтингами
                        </span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.01, x: 2 }}
                        whileTap={{ scale: 0.99 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        style={{ transition: "none" }}
                        className="search-result-item justify-start text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          sortProducts("reviews-asc");
                        }}
                      >
                        <BiStar size={16} className="text-primary" />
                        <span className="text-primary">
                          За найнижчими рейтингами
                        </span>
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                style={{ transition: "none" }}
                className="w-full sm:w-auto btn-secondary rounded-full flex items-center justify-center gap-2"
                onClick={toggleFilters}
              >
                <span className="text-sm md:text-base text-[var(--text-inverse)]">
                  Фільтри
                </span>
                <BiFilter size={18} className="text-[var(--text-inverse)]" />
              </motion.button>
            </div>

            {/* Active filters */}
            {(filters.categories.length > 0 ||
              filters.colors.length > 0 ||
              filters.sizes.length > 0 ||
              filters.brands.length > 0 ||
              filters.priceRange.min > 0 ||
              filters.priceRange.max < Infinity) && (
              <div className="flex flex-wrap gap-2 py-3 mt-4 border-t border-[var(--border)] overflow-x-auto">
                {filters.categories.map((category) => (
                  <div
                    key={`category-${category}`}
                    className="flex items-center gap-1 bg-[var(--hover-bg)] text-primary px-4 py-2 rounded-full text-sm whitespace-nowrap"
                  >
                    <span>Категорія: {category}</span>
                    <button
                      onClick={() => handleFilterChange("categories", [])}
                      className="hover:text-red-500 text-muted ml-1 transition-colors"
                    >
                      ⨉
                    </button>
                  </div>
                ))}
                {filters.colors.map((color) => (
                  <div
                    key={`color-${color}`}
                    className="flex items-center gap-1 bg-[var(--hover-bg)] text-primary px-4 py-2 rounded-full text-sm"
                  >
                    <span>Колір: {color}</span>
                    <button
                      onClick={() => handleFilterChange("colors", color)}
                      className="hover:text-red-500 text-muted ml-1 transition-colors"
                    >
                      ⨉
                    </button>
                  </div>
                ))}
                {filters.sizes.map((size) => (
                  <div
                    key={`size-${size}`}
                    className="flex items-center gap-1 bg-[var(--hover-bg)] text-primary px-4 py-2 rounded-full text-sm"
                  >
                    <span>Розмір: {size}</span>
                    <button
                      onClick={() => handleFilterChange("sizes", size)}
                      className="hover:text-red-500 text-muted ml-1 transition-colors"
                    >
                      ⨉
                    </button>
                  </div>
                ))}
                {filters.brands.map((brand) => (
                  <div
                    key={`brand-${brand}`}
                    className="flex items-center gap-1 bg-[var(--hover-bg)] text-primary px-4 py-2 rounded-full text-sm"
                  >
                    <span>Бренд: {brand}</span>
                    <button
                      onClick={() => handleFilterChange("brands", brand)}
                      className="hover:text-red-500 text-muted ml-1 transition-colors"
                    >
                      ⨉
                    </button>
                  </div>
                ))}
                {(filters.priceRange.min > 0 ||
                  filters.priceRange.max < Infinity) && (
                  <div className="flex items-center gap-1 bg-[var(--hover-bg)] text-primary px-4 py-2 rounded-full text-sm">
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
                      className="hover:text-red-500 text-muted ml-1 transition-colors"
                    >
                      ⨉
                    </button>
                  </div>
                )}
              </div>
            )}
            </motion.div>
          </div>

          {error ? (
            <div className="bg-red-500/20 border border-red-500 rounded-2xl p-6 mb-6">
              <p className="text-red-400">{error}</p>
            </div>
          ) : isLoading ? (
            <div className="min-h-screen flex items-center justify-center">
              <Spinner size="md" />
            </div>
          ) : (
            <div className="page-section mt-0">
              <ProductFilters
                products={products}
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={clearFilters}
                isFilterOpen={isFilterOpen}
                onCloseFilter={() => setIsFilterOpen(false)}
              />

              {/* Products */}
              {currentProducts.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-white text-lg">
                    {query
                      ? "Товарів не знайдено за вашим запитом"
                      : "Товарів не знайдено"}
                  </p>
                </div>
              ) : (
                <div
                  key={currentPage}
                  className={`section-grid mt-0 ${
                    isCatalogVisible
                      ? "catalog-grid-visible"
                      : "catalog-grid-hidden"
                  }`}
                >
                  {currentProducts.map((product, index) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && !isLoading && !error && (
            <div className="flex justify-center items-center gap-2 py-8">
              {/* Previous */}
              <button
                onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-full border border-[var(--border)] bg-[var(--hover-bg)] text-muted hover:bg-[var(--card-bg)] hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1 text-sm"
              >
                <BiChevronLeft size={18} />
                <span className="hidden sm:inline">Назад</span>
              </button>

              {/* Page numbers */}
              {getPageNumbers().map((page, index) => (
                <button
                  key={index}
                  onClick={() =>
                    typeof page === "number" && handlePageChange(page)
                  }
                  disabled={page === "..."}
                  className={`min-w-[2.5rem] h-9 px-3 py-1 rounded-full text-sm transition-colors flex items-center justify-center ${
                    page === currentPage && typeof page === "number"
                      ? "bg-[var(--btn-primary)] text-[var(--text-inverse)]"
                      : typeof page === "number"
                      ? "bg-[var(--hover-bg)] text-primary border border-[var(--border)] hover:bg-[var(--card-bg)]"
                      : "bg-transparent text-muted cursor-default"
                  }`}
                >
                  {page}
                </button>
              ))}

              {/* Next */}
              <button
                onClick={() =>
                  handlePageChange(Math.min(currentPage + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-full border border-[var(--border)] bg-[var(--hover-bg)] text-muted hover:bg-[var(--card-bg)] hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1 text-sm"
              >
                <span className="hidden sm:inline">Вперед</span>
                <BiChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
