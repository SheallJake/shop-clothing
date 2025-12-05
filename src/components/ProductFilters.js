import { useState, useEffect } from "react";
import { BiX, BiChevronUp, BiChevronDown } from "react-icons/bi";
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
  const uniqueSizes = [
    ...new Set(
      products.flatMap((p) => {
        // Split sizes by comma and trim whitespace
        return p.size ? p.size.split(",").map((s) => s.trim()) : [];
      })
    ),
  ].sort((a, b) => {
    // Custom sorting for sizes
    const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

    // Check if both sizes are numeric
    const aNum = parseInt(a);
    const bNum = parseInt(b);

    if (!isNaN(aNum) && !isNaN(bNum)) {
      return aNum - bNum;
    }

    // If one is numeric and other is letter
    if (!isNaN(aNum)) return -1;
    if (!isNaN(bNum)) return 1;

    // If both are letters, use the predefined order
    return sizeOrder.indexOf(a) - sizeOrder.indexOf(b);
  });
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
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "tween", duration: 0.2, ease: "easeInOut" }}
            style={{ transition: "none" }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onCloseFilter}
          />
        )}
      </AnimatePresence>

      {/* Filter Sidebar */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: isFilterOpen ? 0 : "100%" }}
        transition={{ 
          type: "spring", 
          damping: 30, 
          stiffness: 400,
          mass: 0.5
        }}
        style={{ transition: "none" }}
        className="fixed right-0 top-0 h-screen w-80 bg-[#2F2F2F] shadow-2xl z-[90]"
      >
        <div className="h-full flex flex-col pt-[57px] md:pt-[120px]">
          <div className="flex justify-between items-center p-4 border-b border-[#4D4D4D] sticky top-0 bg-[#2F2F2F] z-10">
            <h2 className="text-xl font-bold text-white w-full text-center">
              Фільтри
            </h2>
            <button
              onClick={onCloseFilter}
              className="p-1 hover:bg-[#4D4D4D] rounded-full absolute right-4 transition-colors"
            >
              <BiX size={24} className="text-white" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {/* Categories */}
            <div className="mb-6">
              <button
                onClick={() => toggleSection("categories")}
                className="flex justify-between items-center w-full mb-3 hover:bg-[#4D4D4D] p-2 rounded-lg transition-colors"
              >
                <h3 className="font-semibold text-white text-base">
                  Категорії
                </h3>
                {expandedSections.categories ? (
                  <BiChevronUp size={20} className="text-white" />
                ) : (
                  <BiChevronDown size={20} className="text-white" />
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
                    <div className="space-y-1.5">
                      {uniqueCategories.map((category) => (
                        <label
                          key={category}
                          className="flex items-center gap-3 text-white cursor-pointer hover:bg-[#4D4D4D] p-2 rounded-lg transition-colors"
                          onClick={() =>
                            handleFilterChange("categories", category)
                          }
                        >
                          <div
                            className={`w-4 h-4 rounded-full border-2 border-[#4D4D4D] flex items-center justify-center transition-colors ${
                              filters.categories.includes(category)
                                ? "bg-[#C4C4C4] border-[#C4C4C4]"
                                : "bg-[#2F2F2F]"
                            }`}
                          >
                            {filters.categories.includes(category) && (
                              <div className="w-2 h-2 rounded-full bg-[#2F2F2F]" />
                            )}
                          </div>
                          <span className="text-sm">{category}</span>
                        </label>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Colors */}
            <div className="mb-6">
              <button
                onClick={() => toggleSection("colors")}
                className="flex justify-between items-center w-full mb-3 hover:bg-[#4D4D4D] p-2 rounded-lg transition-colors"
              >
                <h3 className="font-semibold text-white text-base">
                  Кольори
                </h3>
                {expandedSections.colors ? (
                  <BiChevronUp size={20} className="text-white" />
                ) : (
                  <BiChevronDown size={20} className="text-white" />
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
                    <div className="space-y-1.5">
                      {uniqueColors.map((color) => (
                        <label
                          key={color}
                          className="flex items-center gap-3 text-white hover:bg-[#4D4D4D] p-2 rounded-lg transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={filters.colors.includes(color)}
                            onChange={() => handleFilterChange("colors", color)}
                            className="w-4 h-4 rounded border-[#4D4D4D] text-[#C4C4C4] focus:ring-[#C4C4C4] bg-[#2F2F2F]"
                          />
                          <span className="text-sm">{color}</span>
                        </label>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sizes */}
            <div className="mb-6">
              <button
                onClick={() => toggleSection("sizes")}
                className="flex justify-between items-center w-full mb-3 hover:bg-[#4D4D4D] p-2 rounded-lg transition-colors"
              >
                <h3 className="font-semibold text-white text-base">
                  Розміри
                </h3>
                {expandedSections.sizes ? (
                  <BiChevronUp size={20} className="text-white" />
                ) : (
                  <BiChevronDown size={20} className="text-white" />
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
                    <div className="space-y-1.5">
                      {uniqueSizes.map((size) => (
                        <label
                          key={size}
                          className="flex items-center gap-3 text-white hover:bg-[#4D4D4D] p-2 rounded-lg transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={filters.sizes.includes(size)}
                            onChange={() => handleFilterChange("sizes", size)}
                            className="w-4 h-4 rounded border-[#4D4D4D] text-[#C4C4C4] focus:ring-[#C4C4C4] bg-[#2F2F2F]"
                          />
                          <span className="text-sm">{size}</span>
                        </label>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Brands */}
            <div className="mb-6">
              <button
                onClick={() => toggleSection("brands")}
                className="flex justify-between items-center w-full mb-3 hover:bg-[#4D4D4D] p-2 rounded-lg transition-colors"
              >
                <h3 className="font-semibold text-white text-base">
                  Бренди
                </h3>
                {expandedSections.brands ? (
                  <BiChevronUp size={20} className="text-white" />
                ) : (
                  <BiChevronDown size={20} className="text-white" />
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
                    <div className="space-y-1.5">
                      {uniqueBrands.map((brand) => (
                        <label
                          key={brand}
                          className="flex items-center gap-3 text-white hover:bg-[#4D4D4D] p-2 rounded-lg transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={filters.brands.includes(brand)}
                            onChange={() => handleFilterChange("brands", brand)}
                            className="w-4 h-4 rounded border-[#4D4D4D] text-[#C4C4C4] focus:ring-[#C4C4C4] bg-[#2F2F2F]"
                          />
                          <span className="text-sm">{brand}</span>
                        </label>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Price */}
            <div className="mb-6">
              <button
                onClick={() => toggleSection("price")}
                className="flex justify-between items-center w-full mb-3 hover:bg-[#4D4D4D] p-2 rounded-lg transition-colors"
              >
                <h3 className="font-semibold text-white text-base">
                  Ціна
                </h3>
                {expandedSections.price ? (
                  <BiChevronUp size={20} className="text-white" />
                ) : (
                  <BiChevronDown size={20} className="text-white" />
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
                              className="h-1 w-full bg-[#4D4D4D] rounded-full"
                            >
                              <div
                                className="h-1 bg-[#C4C4C4] rounded-full"
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
                              className="h-5 w-5 bg-[#2F2F2F] border-2 border-[#C4C4C4] rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-[#C4C4C4] focus:ring-opacity-50"
                            />
                          )}
                        />
                      </div>
                      <div className="flex justify-between items-center px-2">
                        <div className="flex items-center gap-2">
                          <span className="text-white">Від:</span>
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
                            className="w-20 border border-[#4D4D4D] rounded-lg px-2 py-1 text-white bg-[#2F2F2F] focus:outline-none focus:border-[#C4C4C4]"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-white">До:</span>
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
                            className="w-20 border border-[#4D4D4D] rounded-lg px-2 py-1 text-white bg-[#2F2F2F] focus:outline-none focus:border-[#C4C4C4]"
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
              className="w-full bg-[#4D4D4D] text-white py-3 rounded-full hover:bg-[#5D5D5D] transition-colors font-semibold"
            >
              Очистити фільтри
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
