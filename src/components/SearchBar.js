"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import ImageWithFallback from "./ImageWithFallback";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [completionHint, setCompletionHint] = useState("");

  // Find completion hint
  const findCompletionHint = (input, results) => {
    if (!input.trim() || results.length === 0) return "";

    const inputLower = input.toLowerCase();
    const firstResult = results[0].name.toLowerCase();

    if (firstResult.startsWith(inputLower)) {
      return firstResult.slice(input.length);
    }

    return "";
  };

  // Fetch search results
  const fetchSearchResults = async (value) => {
    if (!value.trim()) {
      setSearchResults([]);
      setIsLoading(false);
      setCompletionHint("");
      return;
    }

    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(value.trim())}&limit=5`
      );
      const data = await response.json();
      const results = data.products || [];
      setSearchResults(results);
      setCompletionHint(findCompletionHint(value, results));
    } catch (error) {
      console.error("Error fetching search results:", error);
      setSearchResults([]);
      setCompletionHint("");
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce search input (only for API, not for hint)
  const debouncedSearch = useCallback(
    debounce((value) => {
      fetchSearchResults(value);
    }, 300),
    []
  );

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setIsLoading(true);
    // Update hint instantly
    setCompletionHint(findCompletionHint(value, searchResults));
    debouncedSearch(value);
    setShowDropdown(true);
    setSelectedIndex(-1);
    setIsCompleting(false);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showDropdown || searchResults.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => {
          const newIndex = prev < searchResults.length - 1 ? prev + 1 : prev;
          if (newIndex !== prev) {
            setQuery(searchResults[newIndex].name);
            setIsCompleting(true);
            setCompletionHint("");
          }
          return newIndex;
        });
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => {
          const newIndex = prev > 0 ? prev - 1 : prev;
          if (newIndex !== prev) {
            setQuery(searchResults[newIndex].name);
            setIsCompleting(true);
            setCompletionHint("");
          }
          return newIndex;
        });
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleResultClick(searchResults[selectedIndex].id);
        } else if (query.trim()) {
          router.push(`/search?q=${encodeURIComponent(query.trim())}`);
          setShowDropdown(false);
          setQuery("");
          setCompletionHint("");
        }
        break;
      case "Escape":
        setShowDropdown(false);
        break;
      case "Tab":
        if (completionHint) {
          e.preventDefault();
          setQuery(query + completionHint);
          setIsCompleting(true);
          setCompletionHint("");
        } else if (selectedIndex >= 0) {
          e.preventDefault();
          setQuery(searchResults[selectedIndex].name);
          setIsCompleting(true);
          setCompletionHint("");
        }
        break;
    }
  };

  // Handle result click
  const handleResultClick = (productId) => {
    const selectedProduct = searchResults.find((p) => p.id === productId);
    if (selectedProduct) {
      setQuery(selectedProduct.name);
      setIsCompleting(true);
      setCompletionHint("");
    }
    router.push(`/products/${productId}`);
    setShowDropdown(false);
    setQuery("");
    setCompletionHint("");
  };

  // Handle input focus
  const handleFocus = () => {
    if (query.trim()) {
      setShowDropdown(true);
    }
  };

  // Reset loading state when route changes
  useEffect(() => {
    setIsLoading(false);
  }, [searchParams]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".search-container")) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="relative flex-1 max-w-md mx-4 search-container">
      <div className="relative">
        <div className="relative w-full">
          {/* Hint overlay */}
          <div
            className="absolute inset-0 flex items-center pointer-events-none select-none"
            aria-hidden="true"
          >
            <span
              className="block w-full px-4 py-2 pl-10 text-sm font-normal"
              style={{
                color: completionHint ? undefined : "transparent",
                transition: "color 0.2s",
                fontFamily: "inherit",
                fontSize: "inherit",
                letterSpacing: "inherit",
                lineHeight: "inherit",
                boxSizing: "border-box",
              }}
            >
              <span className="text-black">{query}</span>
              <span className="text-gray-400 transition-colors duration-200">
                {completionHint}
              </span>
            </span>
          </div>
          {/* Real input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (
                completionHint &&
                (e.key === "ArrowRight" || e.key === "Tab") &&
                inputRef.current &&
                inputRef.current.selectionStart === query.length
              ) {
                e.preventDefault();
                setQuery(query + completionHint);
                setIsCompleting(true);
                setCompletionHint("");
                return;
              }
              handleKeyDown(e);
            }}
            onFocus={handleFocus}
            placeholder="Пошук товарів..."
            className="w-full border rounded-lg px-4 py-2 pl-10 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent text-transparent caret-blue-600"
            style={{
              position: "relative",
              zIndex: 1,
              background: "transparent",
              fontFamily: "inherit",
              fontSize: "inherit",
              letterSpacing: "inherit",
              lineHeight: "inherit",
              boxSizing: "border-box",
            }}
            autoComplete="off"
          />
        </div>
        <Search
          className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
            isLoading ? "text-gray-400" : "text-gray-500"
          }`}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showDropdown && searchResults.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {searchResults.map((product, index) => (
            <div
              key={product.id}
              onClick={() => handleResultClick(product.id)}
              className={`p-3 cursor-pointer border-b last:border-b-0 ${
                index === selectedIndex ? "bg-blue-50" : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded overflow-hidden">
                  <ImageWithFallback
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-medium">{product.name}</h4>
                  <p className="text-sm text-gray-500">{product.brand}</p>
                  <p className="text-sm font-medium text-blue-600">
                    {product.price} грн
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
