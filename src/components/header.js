"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Menu, X, User, Heart, ShoppingCart } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import AuthModal from "@/components/AuthModal";
import SearchBar from "@/components/SearchBar";
import { useTheme } from "@/context/ThemeContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import {
  FiSun,
  FiMoon,
  FiShoppingCart,
  FiHeart,
  FiUser,
  FiSearch,
  FiShield,
} from "react-icons/fi";
import { useAuthModal } from "@/context/AuthModalContext";
import ImageWithFallback from "@/components/ImageWithFallback";
import Spinner from "./Spinner";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const router = useRouter();
  const menuRef = useRef(null);
  const userMenuRef = useRef(null);
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { cart = [] } = useCart();
  const { wishlistItems = [] } = useWishlist();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchRef = useRef(null);
  const { openAuthModal } = useAuthModal();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [inputSuggestion, setInputSuggestion] = useState("");
  const searchTimeoutRef = useRef(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const inputRef = useRef(null);

  // Функція перевірки сесії
  const checkSession = useCallback(async () => {
    try {
      const res = await fetch("/api/session");
      const data = await res.json();

      if (!res.ok) {
        console.error("[Header] Session check error:", data.error);
        setUser(null);
        return null;
      }

      if (data.error) {
        console.error("[Header] Session check error:", data.error);
        setUser(null);
        return null;
      }

      console.log("[Header] User data from session:", data.user);
      setUser(data.user);
      return data.user;
    } catch (err) {
      console.error("[Header] Session check failed:", err);
      setUser(null);
      return null;
    }
  }, []);

  // Завантаження сесії при монтуванні
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Оновлення при зміні стану авторизації
  useEffect(() => {
    if (showAuth) {
      checkSession();
    }
  }, [showAuth, checkSession]);

  // Логіка закриття меню при кліку поза ним
  const handleClickOutside = useCallback((event, ref, setState) => {
    if (ref.current && !ref.current.contains(event.target)) {
      setState(false);
    }
  }, []);

  // Налаштування обробників кліків поза меню
  useEffect(() => {
    const handleBurgerClick = (e) =>
      handleClickOutside(e, menuRef, setIsMenuOpen);
    const handleUserMenuClick = (e) =>
      handleClickOutside(e, userMenuRef, setUserMenuOpen);

    if (isMenuOpen) document.addEventListener("mousedown", handleBurgerClick);
    if (userMenuOpen)
      document.addEventListener("mousedown", handleUserMenuClick);

    return () => {
      document.removeEventListener("mousedown", handleBurgerClick);
      document.removeEventListener("mousedown", handleUserMenuClick);
    };
  }, [isMenuOpen, userMenuOpen, handleClickOutside]);

  // Навігація
  const navigateToProducts = () => {
    router.push("/products");
    setOpen(false);
  };

  const navigateToProfile = () => {
    router.push("/cabinet");
    setUserMenuOpen(false);
  };

  // Обробка виходу
  const logout = async () => {
    try {
      const res = await fetch("/api/logout", { method: "POST" });
      if (!res.ok) throw new Error("Logout failed");

      setUser(null);
      setUserMenuOpen(false);
      router.refresh();
      window.location.reload();
    } catch (error) {
      console.error("Помилка при виході:", error);
    }
  };

  // Обробка кліку по кнопці користувача
  const handleUserButtonClick = () => {
    if (!user) {
      openAuthModal("login");
    } else {
      setUserMenuOpen(!userMenuOpen);
    }
  };

  // Handle click outside user menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { href: "/", label: "Головна" },
    { href: "/products", label: "Каталог" },
    { href: "/game", label: "Отримати промокод" },
  ];

  // Handle click outside search
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSuggestions(true);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for search
    if (value.trim()) {
      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const response = await fetch(
            `/api/search?q=${encodeURIComponent(value)}&limit=5`
          );
          const data = await response.json();
          if (response.ok) {
            setSearchResults(data.products);

            // Find the first matching product name for suggestion
            const firstMatch = data.products.find((product) => {
              const name = product.name.toLowerCase();
              const query = value.toLowerCase();
              return name.startsWith(query) && name !== query;
            });

            if (firstMatch) {
              setInputSuggestion(firstMatch.name);
            } else {
              setInputSuggestion("");
            }
          }
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setIsSearching(false);
        }
      }, 300);
    } else {
      setSearchResults([]);
      setInputSuggestion("");
      setIsSearching(false);
    }
  };

  // Handle search collapse
  const handleSearchCollapse = () => {
    setIsSearchExpanded(false);
    setShowSuggestions(false);
    setInputSuggestion("");
    setSearchResults([]);
  };

  // Handle suggestion accept
  const handleSuggestionAccept = () => {
    if (inputSuggestion) {
      setSearchQuery(inputSuggestion);
      setInputSuggestion("");
    }
  };

  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery)}`);
      setShowSuggestions(false);
      setIsSearchExpanded(false);
    }
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearchSubmit(e);
    } else if (e.key === "Tab" && inputSuggestion) {
      e.preventDefault();
      handleSuggestionAccept();
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <>
      <div className="bg-[var(--card-bg)] dark:bg-black rounded-lg p-2 shadow-[0_0_2px_var(--glow-color)] fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-[80%]">
        <div className="flex items-center justify-between h-9">
          {/* Left Side - Burger Menu and Logo */}
          <div className="flex items-center space-x-4" ref={menuRef}>
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md hover:bg-gradient-to-r hover:from-zinc-300/80 hover:to-zinc-200/80 dark:hover:from-zinc-700/30 dark:hover:to-zinc-600/30 transition-all duration-500 ease-in-out"
              aria-label="Меню"
            >
              <div className="w-6 h-5 flex flex-col justify-between">
                <span
                  className={`w-full h-0.5 bg-[var(--foreground)] transition-transform ${
                    isMenuOpen ? "rotate-45 translate-y-2" : ""
                  }`}
                ></span>
                <span
                  className={`w-full h-0.5 bg-[var(--foreground)] transition-opacity ${
                    isMenuOpen ? "opacity-0" : ""
                  }`}
                ></span>
                <span
                  className={`w-full h-0.5 bg-[var(--foreground)] transition-transform ${
                    isMenuOpen ? "-rotate-45 -translate-y-2" : ""
                  }`}
                ></span>
              </div>
            </button>

            {/* Logo */}
            <Link href="/" className="text-xl font-bold">
              Крамничка
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative" ref={searchRef}>
              <form
                onSubmit={handleSearchSubmit}
                className="flex items-center gap-2"
              >
                <div
                  className={`overflow-visible transition-all duration-300 ${
                    isSearchExpanded ? "w-64" : "w-0"
                  }`}
                >
                  <div
                    className={`relative ${isSearchFocused ? "animate-gradient-border" : ""}`}
                  >
                    <div className="relative">
                      <div className="relative">
                        <input
                          ref={inputRef}
                          type="text"
                          value={searchQuery}
                          onChange={handleSearchChange}
                          onKeyDown={handleKeyPress}
                          onFocus={() => {
                            setIsSearchExpanded(true);
                            setShowSuggestions(true);
                            setIsSearchFocused(true);
                          }}
                          onBlur={() => {
                            setTimeout(() => {
                              setIsSearchFocused(false);
                              setInputSuggestion("");
                            }, 200);
                          }}
                          placeholder="Пошук товарів..."
                          className={`w-full px-4 py-2 rounded-md bg-[var(--background)] border border-[var(--card-border)] focus:outline-none transition-all duration-300 ${
                            isSearchExpanded ? "opacity-100" : "opacity-0"
                          }`}
                        />
                        {inputSuggestion && isSearchExpanded && (
                          <div
                            className="absolute top-0 left-0 w-full h-full px-4 py-2 pointer-events-none"
                            style={{
                              color: "var(--foreground)",
                              opacity: 0.5,
                            }}
                          >
                            {searchQuery}
                            <span
                              style={{
                                color: "var(--foreground)",
                                opacity: 0.4,
                              }}
                            >
                              {inputSuggestion.slice(searchQuery.length)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {showSuggestions &&
                    searchQuery.trim() &&
                    isSearchExpanded && (
                      <div className="absolute top-[calc(100%+4px)] left-0 right-0 mt-1 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-md shadow-lg z-[55] max-h-96 overflow-y-auto backdrop-blur-sm bg-opacity-95">
                        {isSearching ? (
                          <div className="p-4 text-center text-[var(--foreground)]">
                            <Spinner size="sm" className="mx-auto" />
                          </div>
                        ) : searchResults.length > 0 ? (
                          <div className="py-2 divide-y divide-[var(--card-border)]">
                            {searchResults.map((product) => (
                              <button
                                key={product.id}
                                onClick={() => {
                                  router.push(`/products/${product.id}`);
                                  setShowSuggestions(false);
                                  setSearchQuery("");
                                }}
                                className="w-full px-4 py-3 text-left hover:bg-[var(--hover-bg)] transition-colors flex items-center gap-3 group"
                              >
                                <div className="relative w-14 h-14 flex-shrink-0">
                                  <ImageWithFallback
                                    src={product.mainImage}
                                    alt={product.name}
                                    className="w-full h-full object-cover rounded-md transition-transform duration-300 group-hover:scale-105"
                                    width={56}
                                    height={56}
                                  />
                                  {product.isDiscountActive &&
                                    product.discountPrice && (
                                      <div className="absolute -top-2 -right-2 bg-red-500 dark:bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full transform rotate-12 shadow-lg">
                                        -
                                        {Math.round(
                                          (1 -
                                            product.discountPrice /
                                              product.price) *
                                            100
                                        )}
                                        %
                                      </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div
                                    className="font-medium text-[var(--foreground)] truncate"
                                    dangerouslySetInnerHTML={{
                                      __html:
                                        product.nameHighlight || product.name,
                                    }}
                                  />
                                  <div className="text-sm text-[var(--foreground)]/70 truncate">
                                    {product.brand}
                                  </div>
                                  {product.descriptionHighlight && (
                                    <div
                                      className="text-xs text-[var(--foreground)]/60 mt-1 line-clamp-2"
                                      dangerouslySetInnerHTML={{
                                        __html: product.descriptionHighlight,
                                      }}
                                    />
                                  )}
                                </div>
                                <div className="flex flex-col items-end flex-shrink-0 ml-2">
                                  {product.isDiscountActive &&
                                  product.discountPrice ? (
                                    <>
                                      <div className="text-red-500 dark:text-red-400 font-medium">
                                        {product.discountPrice} ₴
                                      </div>
                                      <div className="text-xs text-[var(--foreground)]/50 line-through">
                                        {product.price} ₴
                                      </div>
                                    </>
                                  ) : (
                                    <div className="text-[var(--foreground)] font-medium">
                                      {product.price} ₴
                                    </div>
                                  )}
                                </div>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 text-center text-[var(--foreground)]">
                            Нічого не знайдено
                          </div>
                        )}
                      </div>
                    )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (isSearchExpanded) {
                      handleSearchCollapse();
                    } else {
                      setIsSearchExpanded(true);
                      inputRef.current?.focus();
                    }
                  }}
                  className="p-2 rounded-md hover:bg-gradient-to-r hover:from-zinc-300/80 hover:to-zinc-200/80 dark:hover:from-zinc-700/30 dark:hover:to-zinc-600/30 transition-all duration-500 ease-in-out z-10"
                  aria-label="Пошук"
                >
                  <FiSearch size={20} />
                </button>
              </form>
            </div>

            {/* Cart */}
            <Link
              href="/cart"
              className="p-2 rounded-md hover:bg-gradient-to-r hover:from-zinc-300/80 hover:to-zinc-200/80 dark:hover:from-zinc-700/30 dark:hover:to-zinc-600/30 transition-all duration-500 ease-in-out relative"
              aria-label="Кошик"
            >
              <FiShoppingCart size={20} />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[var(--card-border)] text-[var(--background)] text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </Link>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="p-2 rounded-md hover:bg-gradient-to-r hover:from-zinc-300/80 hover:to-zinc-200/80 dark:hover:from-zinc-700/30 dark:hover:to-zinc-600/30 transition-all duration-500 ease-in-out relative"
              aria-label="Обрані"
            >
              <FiHeart size={20} />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[var(--card-border)] text-[var(--background)] text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* User */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={handleUserButtonClick}
                className="p-2 rounded-md hover:bg-gradient-to-r hover:from-zinc-300/80 hover:to-zinc-200/80 dark:hover:from-zinc-700/30 dark:hover:to-zinc-600/30 transition-all duration-500 ease-in-out"
                aria-label="Профіль"
              >
                <FiUser size={20} />
              </button>

              {/* User Menu Dropdown */}
              <div
                className={`absolute right-0 mt-2 w-48 bg-[var(--card-bg)] rounded-lg shadow-lg border border-[var(--card-border)] transition-all duration-200 ${
                  userMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
                }`}
              >
                {user && (
                  <div className="py-2">
                    <div className="px-4 py-2 border-b border-[var(--card-border)]">
                      <p className="font-medium">{user.name}</p>
                    </div>
                    <Link
                      href="/cabinet"
                      className="block px-4 py-2 hover:bg-gradient-to-r hover:from-zinc-300/80 hover:to-zinc-200/80 dark:hover:from-zinc-700/30 dark:hover:to-zinc-600/30 transition-all duration-500 ease-in-out"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Особистий кабінет
                    </Link>
                    {user.role.toLowerCase() === "admin" && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 hover:bg-gradient-to-r hover:from-zinc-300/80 hover:to-zinc-200/80 dark:hover:from-zinc-700/30 dark:hover:to-zinc-600/30 transition-all duration-500 ease-in-out"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-[var(--foreground)]">
                            Адмін панель
                          </span>
                          <FiShield className="w-4 h-4 text-[var(--foreground)]" />
                        </span>
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gradient-to-r hover:from-zinc-300/80 hover:to-zinc-200/80 dark:hover:from-zinc-700/30 dark:hover:to-zinc-600/30 transition-all duration-500 ease-in-out"
                    >
                      Вийти з аккаунту
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Theme Toggle */}
            <div className="ml-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md hover:bg-gradient-to-r hover:from-zinc-300/80 hover:to-zinc-200/80 dark:hover:from-zinc-700/30 dark:hover:to-zinc-600/30 transition-all duration-500 ease-in-out"
                aria-label="Змінити тему"
              >
                {theme === "light" ? <FiMoon size={20} /> : <FiSun size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div
          className={`overflow-hidden transition-all duration-300 ${
            isMenuOpen ? "max-h-96" : "max-h-0"
          }`}
        >
          <nav className="py-4 border-t-[0.5px] border-[var(--card-border)]">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 hover:bg-gradient-to-r hover:from-zinc-300/80 hover:to-zinc-200/80 dark:hover:from-zinc-700/30 dark:hover:to-zinc-600/30 rounded-md transition-all duration-500 ease-in-out ${
                    pathname === item.href ? "bg-[var(--hover-bg)]" : ""
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </div>

      <style jsx global>{`
        @keyframes gradient-border-light {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes gradient-border-dark {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .animate-gradient-border {
          position: relative;
          border-radius: 0.5rem;
          padding: 2px;
        }

        .light .animate-gradient-border {
          background: linear-gradient(
            45deg,
            var(--card-border),
            var(--hover-bg),
            var(--card-border),
            var(--hover-bg)
          );
          background-size: 300% 300%;
          animation: gradient-border-light 3s ease infinite;
        }

        .dark .animate-gradient-border {
          background: linear-gradient(
            45deg,
            var(--card-border),
            rgba(255, 255, 255, 0.1),
            var(--card-border),
            rgba(255, 255, 255, 0.1)
          );
          background-size: 300% 300%;
          animation: gradient-border-dark 3s ease infinite;
        }

        .animate-gradient-border input {
          border: none !important;
        }

        .light .animate-gradient-border input {
          background-color: white;
        }

        .dark .animate-gradient-border input {
          background-color: #1a1a1a;
        }

        /* Стили для подсветки совпадений в поиске */
        mark {
          background-color: rgba(128, 128, 128, 0.2);
          color: inherit;
          padding: 0 2px;
          border-radius: 2px;
        }

        .light mark {
          background-color: rgba(128, 128, 128, 0.15);
        }

        .dark mark {
          background-color: rgba(128, 128, 128, 0.25);
        }
      `}</style>
    </>
  );
}
