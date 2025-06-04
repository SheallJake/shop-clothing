import { useState, useEffect } from "react";
import { X, ChevronUp, ChevronDown } from "lucide-react";
import { Range } from "react-range";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductFilters({
  products,
  filters,
  onFilterChange,
  onClearFilters,
  isFilterOpen,
  onCloseFilter,
}) {
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    colors: true,
    sizes: true,
    brands: true,
    price: true,
  });

  // Initialize with default values
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [isPriceRangeReady, setIsPriceRangeReady] = useState(false);

  // Get unique values for filters
  const uniqueColors = [...new Set(products.flatMap((p) => p.color))];
  const uniqueSizes = [...new Set(products.map((p) => p.size).filter(Boolean))];
  const uniqueBrands = [
    ...new Set(products.map((p) => p.brand).filter(Boolean)),
  ];
  const uniqueCategories = [
    ...new Set(products.map((p) => p.category?.name).filter(Boolean)),
  ];

  // Get min and max prices from products
  const minPrice =
    products.length > 0
      ? Math.floor(Math.min(...products.map((p) => p.price)))
      : 0;
  const maxPrice =
    products.length > 0
      ? Math.ceil(Math.max(...products.map((p) => p.price)))
      : 1000;

  // Update price range when products are loaded
  useEffect(() => {
    if (products.length > 0 && !isPriceRangeReady) {
      const newMinPrice = Math.floor(Math.min(...products.map((p) => p.price)));
      const newMaxPrice = Math.ceil(Math.max(...products.map((p) => p.price)));
      setPriceRange([newMinPrice, newMaxPrice]);
      onFilterChange("priceRange", { min: newMinPrice, max: newMaxPrice });
      setIsPriceRangeReady(true);
    }
  }, [products, isPriceRangeReady, onFilterChange]);

  const handleFilterChange = (filterType, value) => {
    if (filterType === "categories") {
      // If clicking the same category, remove it to show all products
      if (filters.categories.includes(value)) {
        onFilterChange(filterType, []);
      } else {
        // Select new category
        onFilterChange(filterType, [value]);
      }
    } else {
      // For other filters, keep the existing array behavior
      onFilterChange(filterType, value);
    }
  };

  const handlePriceRangeChange = (values) => {
    // Ensure values are within bounds
    const validValues = [
      Math.max(minPrice, Math.min(maxPrice, values[0])),
      Math.max(minPrice, Math.min(maxPrice, values[1])),
    ];
    setPriceRange(validValues);
    onFilterChange("priceRange", { min: validValues[0], max: validValues[1] });
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <>
      {/* Overlay */}
      {isFilterOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onCloseFilter}
        />
      )}

      {/* Фільтр сайдбар */}
      <div
        className={`fixed right-0 top-[64px] h-[calc(100vh-64px)] w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          isFilterOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="flex justify-between items-center p-4 border-b bg-white">
            <h2 className="text-xl font-bold text-black w-full text-center">
              Фільтри
            </h2>
            <button
              onClick={onCloseFilter}
              className="p-1 hover:bg-gray-100 rounded-full absolute right-4"
            >
              <X size={24} className="text-black" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {/* Категорії */}
            <div className="mb-6">
              <button
                onClick={() => toggleSection("categories")}
                className="flex justify-between items-center w-full mb-2"
              >
                <h3 className="font-semibold text-black">Категорії</h3>
                {expandedSections.categories ? (
                  <ChevronUp size={20} className="text-black" />
                ) : (
                  <ChevronDown size={20} className="text-black" />
                )}
              </button>
              <AnimatePresence>
                {expandedSections.categories && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-2">
                      {uniqueCategories.map((category) => (
                        <label
                          key={category}
                          className="flex items-center gap-2 text-black cursor-pointer"
                          onClick={() =>
                            handleFilterChange("categories", category)
                          }
                        >
                          <div
                            className={`w-4 h-4 rounded-full border-2 border-black flex items-center justify-center ${
                              filters.categories.includes(category)
                                ? "bg-black"
                                : "bg-white"
                            }`}
                          >
                            {filters.categories.includes(category) && (
                              <div className="w-2 h-2 rounded-full bg-white" />
                            )}
                          </div>
                          <span>{category}</span>
                        </label>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Кольори */}
            <div className="mb-6">
              <button
                onClick={() => toggleSection("colors")}
                className="flex justify-between items-center w-full mb-2"
              >
                <h3 className="font-semibold text-black">Кольори</h3>
                {expandedSections.colors ? (
                  <ChevronUp size={20} className="text-black" />
                ) : (
                  <ChevronDown size={20} className="text-black" />
                )}
              </button>
              <AnimatePresence>
                {expandedSections.colors && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-2">
                      {uniqueColors.map((color) => (
                        <label
                          key={color}
                          className="flex items-center gap-2 text-black"
                        >
                          <input
                            type="checkbox"
                            checked={filters.colors.includes(color)}
                            onChange={() => handleFilterChange("colors", color)}
                            className="rounded"
                          />
                          <span>{color}</span>
                        </label>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Розміри */}
            <div className="mb-6">
              <button
                onClick={() => toggleSection("sizes")}
                className="flex justify-between items-center w-full mb-2"
              >
                <h3 className="font-semibold text-black">Розміри</h3>
                {expandedSections.sizes ? (
                  <ChevronUp size={20} className="text-black" />
                ) : (
                  <ChevronDown size={20} className="text-black" />
                )}
              </button>
              <AnimatePresence>
                {expandedSections.sizes && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-2">
                      {uniqueSizes.map((size) => (
                        <label
                          key={size}
                          className="flex items-center gap-2 text-black"
                        >
                          <input
                            type="checkbox"
                            checked={filters.sizes.includes(size)}
                            onChange={() => handleFilterChange("sizes", size)}
                            className="rounded"
                          />
                          <span>{size}</span>
                        </label>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Бренди */}
            <div className="mb-6">
              <button
                onClick={() => toggleSection("brands")}
                className="flex justify-between items-center w-full mb-2"
              >
                <h3 className="font-semibold text-black">Бренди</h3>
                {expandedSections.brands ? (
                  <ChevronUp size={20} className="text-black" />
                ) : (
                  <ChevronDown size={20} className="text-black" />
                )}
              </button>
              <AnimatePresence>
                {expandedSections.brands && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-2">
                      {uniqueBrands.map((brand) => (
                        <label
                          key={brand}
                          className="flex items-center gap-2 text-black"
                        >
                          <input
                            type="checkbox"
                            checked={filters.brands.includes(brand)}
                            onChange={() => handleFilterChange("brands", brand)}
                            className="rounded"
                          />
                          <span>{brand}</span>
                        </label>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Ціна */}
            <div className="mb-6">
              <button
                onClick={() => toggleSection("price")}
                className="flex justify-between items-center w-full mb-2"
              >
                <h3 className="font-semibold text-black">Ціна</h3>
                {expandedSections.price ? (
                  <ChevronUp size={20} className="text-black" />
                ) : (
                  <ChevronDown size={20} className="text-black" />
                )}
              </button>
              <AnimatePresence>
                {expandedSections.price && isPriceRangeReady && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="py-2"
                  >
                    <div className="space-y-4">
                      <div className="px-2">
                        <Range
                          step={1}
                          min={minPrice}
                          max={maxPrice}
                          values={priceRange}
                          onChange={handlePriceRangeChange}
                          renderTrack={({
                            props: { key, ...trackProps },
                            children,
                          }) => (
                            <div
                              key={key}
                              {...trackProps}
                              className="h-1 w-full bg-gray-200 rounded-full"
                            >
                              <div
                                className="h-1 bg-black rounded-full"
                                style={{
                                  width: `${
                                    ((priceRange[1] - priceRange[0]) /
                                      (maxPrice - minPrice)) *
                                    100
                                  }%`,
                                  left: `${
                                    ((priceRange[0] - minPrice) /
                                      (maxPrice - minPrice)) *
                                    100
                                  }%`,
                                  position: "absolute",
                                }}
                              />
                              {children}
                            </div>
                          )}
                          renderThumb={({
                            props: { key, ...thumbProps },
                            index,
                          }) => (
                            <div
                              key={key}
                              {...thumbProps}
                              className="h-5 w-5 bg-white border-2 border-black rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-50"
                            />
                          )}
                        />
                      </div>
                      <div className="flex justify-between items-center px-2">
                        <div className="flex items-center gap-2">
                          <span className="text-black">Від:</span>
                          <input
                            type="number"
                            value={priceRange[0]}
                            onChange={(e) => {
                              const value = Math.max(
                                minPrice,
                                Math.min(priceRange[1], Number(e.target.value))
                              );
                              handlePriceRangeChange([value, priceRange[1]]);
                            }}
                            className="w-20 border rounded px-2 py-1 text-black"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-black">До:</span>
                          <input
                            type="number"
                            value={priceRange[1]}
                            onChange={(e) => {
                              const value = Math.max(
                                priceRange[0],
                                Math.min(maxPrice, Number(e.target.value))
                              );
                              handlePriceRangeChange([priceRange[0], value]);
                            }}
                            className="w-20 border rounded px-2 py-1 text-black"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={onClearFilters}
              className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
            >
              Очистити фільтри
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
