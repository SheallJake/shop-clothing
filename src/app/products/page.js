"use client";
import { useEffect, useState } from "react";
import ImageWithFallback from "@/components/ImageWithFallback";
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
import { motion, AnimatePresence } from "framer-motion";

const ITEMS_PER_PAGE = 20;

// Animation variants for the products grid
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      staggerChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [sortType, setSortType] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isChangingPage, setIsChangingPage] = useState(false);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then(setProducts);
  }, []);

  const sortProducts = (type) => {
    let sorted = [...products];
    if (type === "price-asc") {
      sorted.sort((a, b) => a.price - b.price);
    } else if (type === "price-desc") {
      sorted.sort((a, b) => b.price - a.price);
    } else if (type === "reviews") {
      // Заглушка для сортування за відгуками
    }
    setProducts(sorted);
    setSortType(type);
    setDropdownOpen(false);
    setCurrentPage(1);
  };

  // Calculate pagination
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProducts = products.slice(startIndex, endIndex);

  // Handle page change with animation
  const handlePageChange = (newPage) => {
    setIsChangingPage(true);
    setTimeout(() => {
      setCurrentPage(newPage);
      setIsChangingPage(false);
    }, 300); // Match this with the animation duration
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

  return (
    <PageTransition>
      <div className="flex flex-col min-h-[calc(100vh-64px-80px)]">
        <div className="px-6 py-4 flex-1">
          {/* Блок сортування і фільтрації */}
          <div className="flex justify-between items-center mb-4">
            <div className="relative">
              <button
                className="border px-4 py-2 rounded bg-white hover:bg-gray-100 text-black"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                Сортувати за
              </button>

              {dropdownOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white border rounded shadow-md z-10 w-60">
                  <button
                    className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100 text-black"
                    onClick={() => sortProducts("price-asc")}
                  >
                    <ArrowUp size={16} /> За зростанням ціни
                  </button>
                  <button
                    className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100 text-black"
                    onClick={() => sortProducts("price-desc")}
                  >
                    <ArrowDown size={16} /> За спаданням ціни
                  </button>
                  <button
                    className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100 text-black"
                    onClick={() => sortProducts("reviews")}
                  >
                    <Star size={16} /> За відгуками
                  </button>
                </div>
              )}
            </div>

            <button className="border px-4 py-2 rounded bg-white hover:bg-gray-100 text-black">
              Фільтрувати
            </button>
          </div>

          {/* Товари */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              {currentProducts.map((p) => (
                <motion.div key={p.id} variants={itemVariants}>
                  <Link href={`/products/${p.id}`}>
                    <div className="border p-4 rounded hover:shadow transition">
                      <ImageWithFallback
                        src={p.image}
                        alt={p.name}
                        className="w-full h-40 object-cover rounded"
                      />
                      <div className="flex justify-between items-center">
                        <div>
                          <h2 className="mt-2 font-bold">{p.name}</h2>
                          <p className="text-sm text-gray-500">
                            {p.category?.name}
                          </p>
                          <p className="mt-1 text-green-600 font-semibold">
                            {p.price} грн
                          </p>
                        </div>
                        <AddToCartButton product={p} />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Пагінація */}
        {totalPages > 1 && (
          <div className="px-6 py-2 bg-black border-t border-gray-800">
            <div className="flex justify-center items-center gap-2">
              <button
                onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1 || isChangingPage}
                className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </button>

              {getPageNumbers().map((page, index) => (
                <button
                  key={index}
                  onClick={() =>
                    typeof page === "number" && handlePageChange(page)
                  }
                  disabled={page === "..." || isChangingPage}
                  className={`px-4 py-2 border rounded ${
                    page === currentPage
                      ? "bg-black text-white"
                      : "hover:bg-gray-100"
                  } ${page === "..." ? "cursor-default" : ""}`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() =>
                  handlePageChange(Math.min(currentPage + 1, totalPages))
                }
                disabled={currentPage === totalPages || isChangingPage}
                className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
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
