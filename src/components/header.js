"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "@/context/ThemeContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuthModal } from "@/context/AuthModalContext";
import {
  BiSun,
  BiMoon,
  BiShield,
  BiHome,
  BiListUl,
  BiShoppingBag,
  BiHeart,
  BiMenu,
  BiX,
  BiSearch,
} from "react-icons/bi";
import ImageWithFallback from "@/components/imageWithFallback";
import Spinner from "./Spinner";

function NavItem({ href, icon: Icon, label, isActive, badge, theme }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-4 py-2 cursor-pointer transition-colors rounded-2xl relative ${
        isActive
          ? "bg-zinc-800 dark:bg-zinc-600 text-white"
          : "hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200"
      }`}
    >
      <div className="w-6 h-6 flex-shrink-0 relative">
        <Icon
          className={`w-full h-full ${
            isActive
              ? "text-white"
              : theme === "light"
              ? "text-zinc-700"
              : "text-zinc-200"
          }`}
        />
        {badge > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
            {badge}
          </span>
        )}
      </div>
      <span className="text-base">
        {label}
      </span>
    </Link>
  );
}

export default function Header() {
  const [query, setQuery] = useState("");
  const [user, setUser] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [inputSuggestion, setInputSuggestion] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchTimeoutRef = useRef(null);
  const userMenuRef = useRef(null);
  const searchRef = useRef(null);
  const mobileMenuRef = useRef(null);
  
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { cart = [] } = useCart();
  const { wishlistItems = [] } = useWishlist();
  const { openAuthModal } = useAuthModal();

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

  // Handle click outside user menu, search, and mobile menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
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

  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery)}`);
      setShowSuggestions(false);
    }
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearchSubmit(e);
    } else if (e.key === "Tab" && inputSuggestion) {
      e.preventDefault();
      setSearchQuery(inputSuggestion);
      setInputSuggestion("");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const navItems = [
    {
      href: "/",
      icon: BiHome,
      label: "Головна",
      path: "/",
    },
    {
      href: "/products",
      icon: BiListUl,
      label: "Каталог",
      path: "/products",
    },
    {
      href: "/cart",
      icon: BiShoppingBag,


      label: "Кошик",
      path: "/cart",
      badge: cart.length,
    },
    {
      href: "/wishlist",
      icon: BiHeart,
      label: "Обрані",
      path: "/wishlist",
      badge: wishlistItems.length,
    },
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between gap-3 px-4 py-3 bg-zinc-100 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 transition-colors duration-300 shadow-md md:hidden">
        {/* Logo */}
        <Link href="/" className="text-zinc-900 dark:text-white text-xl font-bold transition-colors flex-shrink-0">
          Крамничка
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Search Button (Mobile) */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="w-10 h-10 flex items-center justify-center bg-zinc-200 dark:bg-zinc-600 rounded-full flex-shrink-0 hover:bg-zinc-300 dark:hover:bg-zinc-500 transition-colors"
            title="Пошук"
          >
            <BiSearch className="w-5 h-5 text-zinc-900 dark:text-white" />
          </button>

          {/* Cart Icon (Mobile) */}
          <Link
            href="/cart"
            className="w-10 h-10 flex items-center justify-center bg-zinc-200 dark:bg-zinc-600 rounded-full flex-shrink-0 hover:bg-zinc-300 dark:hover:bg-zinc-500 transition-colors relative"
            title="Кошик"
          >
            <BiShoppingBag className="w-5 h-5 text-zinc-900 dark:text-white" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                {cart.length}
              </span>
            )}
          </Link>

          {/* Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 flex items-center justify-center bg-zinc-200 dark:bg-zinc-600 rounded-full flex-shrink-0 hover:bg-zinc-300 dark:hover:bg-zinc-500 transition-colors"
            title="Меню"
          >
            {mobileMenuOpen ? (
              <BiX className="w-5 h-5 text-zinc-900 dark:text-white" />
            ) : (
              <BiMenu className="w-5 h-5 text-zinc-900 dark:text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {searchOpen && (
        <div className="fixed top-[57px] left-0 right-0 z-[99] px-4 py-3 bg-zinc-100 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 md:hidden" ref={searchRef}>
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <input
                type="text"
                placeholder="Пошук товарів..."
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleKeyPress}
                onFocus={() => setShowSuggestions(true)}
                className="w-full px-4 py-2 pr-10 bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-400 rounded-full outline-none transition-colors text-sm"
                autoFocus
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6"
              >
                <BiSearch className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
              </button>
            </div>
          </form>
          
          {/* Search Results Dropdown (Mobile) */}
          {showSuggestions && searchQuery.trim() && (
            <div className="absolute top-full left-4 right-4 mt-2 search-dropdown max-h-80 rounded-2xl shadow-xl border border-[var(--border)] overflow-hidden">
              {isSearching ? (
                <div className="p-6 text-center">
                  <Spinner size="sm" className="mx-auto" />
                </div>
              ) : searchResults.length > 0 ? (
                <div className="py-2">
                  {searchResults.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => {
                        router.push(`/products/${product.id}`);
                        setShowSuggestions(false);
                        setSearchQuery("");
                        setSearchOpen(false);
                      }}
                      className="search-result-item group hover:bg-[var(--hover-bg)] transition-colors"
                    >
                      <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-[var(--hover-bg)]">
                        <ImageWithFallback
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          width={48}
                          height={48}
                        />
                        {product.isDiscountActive && product.discountPrice && (
                          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            -
                            {Math.round(
                              (1 - product.discountPrice / product.price) * 100
                            )}
                            %
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className="font-semibold text-sm text-primary truncate mb-0.5"
                          dangerouslySetInnerHTML={{
                            __html: product.nameHighlight || product.name,
                          }}
                        />
                        <div className="text-xs text-muted truncate">
                          {product.brand}
                        </div>
                      </div>
                      <div className="flex flex-col items-end flex-shrink-0">
                        {product.isDiscountActive && product.discountPrice ? (
                          <>
                            <div className="text-red-500 font-bold text-sm">
                              {Math.round(product.discountPrice)} ₴
                            </div>
                            <div className="text-xs text-muted line-through">
                              {Math.round(product.price)} ₴
                            </div>
                          </>
                        ) : (
                          <div className="text-primary font-semibold text-sm">
                            {Math.round(product.price)} ₴
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-muted text-sm">
                  Нічого не знайдено
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed top-[57px] left-0 right-0 bottom-0 z-[98] bg-zinc-100 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 md:hidden overflow-y-auto" ref={mobileMenuRef}>
          <div className="px-4 py-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors ${
                  pathname === item.path
                    ? "bg-zinc-800 dark:bg-zinc-600 text-white"
                    : "hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200"
                }`}
              >
                <item.icon className="w-6 h-6" />
                <span className="text-base">{item.label}</span>
                {item.badge > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-semibold">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
            
            {/* User Section in Mobile Menu */}
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700 mt-4">
              {user ? (
                <>
                  <div className="px-4 py-2 mb-2">
                    <p className="font-medium text-zinc-900 dark:text-white text-sm">{user.name}</p>
                  </div>
                  <Link
                    href="/cabinet"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <span>Особистий кабінет</span>
                  </Link>
                  {user.role?.toLowerCase() === "admin" && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                      <BiShield className="w-6 h-6" />
                      <span>Адмін панель</span>
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-2xl text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <span>Вийти з аккаунту</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      openAuthModal("login");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-2xl text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <span>Увійти</span>
                  </button>
                  <button
                    onClick={() => {
                      openAuthModal("register");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-2xl text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <span>Зареєструватися</span>
                  </button>
                </>
              )}
              
              {/* Theme Toggle in Mobile Menu */}
              <button
                onClick={toggleTheme}
                className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-2xl text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors mt-2"
              >
                {theme === "light" ? (
                  <>
                    <BiMoon className="w-6 h-6" />
                    <span>Темна тема</span>
                  </>
                ) : (
                  <>
                    <BiSun className="w-6 h-6" />
                    <span>Світла тема</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tablet Header (Intermediate) */}
      <div className="hidden md:flex xl:hidden fixed top-0 left-0 right-0 z-[100] flex-row items-center gap-4 px-4 py-4 bg-zinc-100 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 transition-colors duration-300 shadow-md">
        {/* Logo */}
        <Link href="/" className="text-zinc-900 dark:text-white text-xl font-bold transition-colors flex-shrink-0">
          Крамничка
        </Link>

        {/* Navigation - в одну строку */}
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
          {navItems.map((item) => (
            <NavItem
              key={item.path}
              href={item.href}
              icon={item.icon}
              label={item.label}
              isActive={pathname === item.path}
              badge={item.badge}
              theme={theme}
            />
          ))}
        </div>

        {/* Search - компактный */}
        <div className="relative w-64 flex-shrink-0" ref={searchRef}>
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <input
                type="text"
                placeholder="Пошук..."
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleKeyPress}
                onFocus={() => setShowSuggestions(true)}
                className="w-full px-4 py-2 pr-10 bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-400 rounded-full outline-none transition-colors text-sm"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5"
              >
                <BiSearch className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
              </button>
            </div>
          </form>
          
          {/* Search Results Dropdown */}
          {showSuggestions && searchQuery.trim() && (
            <div className="absolute top-full left-0 right-0 mt-2 search-dropdown max-h-96 rounded-2xl shadow-xl border border-[var(--border)] overflow-hidden">
              {isSearching ? (
                <div className="p-6 text-center">
                  <Spinner size="sm" className="mx-auto" />
                </div>
              ) : searchResults.length > 0 ? (
                <div className="py-2">
                  {searchResults.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => {
                        router.push(`/products/${product.id}`);
                        setShowSuggestions(false);
                        setSearchQuery("");
                      }}
                      className="search-result-item group hover:bg-[var(--hover-bg)] transition-colors"
                    >
                      <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-[var(--hover-bg)]">
                        <ImageWithFallback
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          width={48}
                          height={48}
                        />
                        {product.isDiscountActive && product.discountPrice && (
                          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            -
                            {Math.round(
                              (1 - product.discountPrice / product.price) * 100
                            )}
                            %
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className="font-semibold text-sm text-primary truncate mb-0.5"
                          dangerouslySetInnerHTML={{
                            __html: product.nameHighlight || product.name,
                          }}
                        />
                        <div className="text-xs text-muted truncate">
                          {product.brand}
                        </div>
                      </div>
                      <div className="flex flex-col items-end flex-shrink-0">
                        {product.isDiscountActive && product.discountPrice ? (
                          <>
                            <div className="text-red-500 font-bold text-sm">
                              {Math.round(product.discountPrice)} ₴
                            </div>
                            <div className="text-xs text-muted line-through">
                              {Math.round(product.price)} ₴
                            </div>
                          </>
                        ) : (
                          <div className="text-primary font-semibold text-sm">
                            {Math.round(product.price)} ₴
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-muted text-sm">
                  Нічого не знайдено
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Menu и Theme Toggle */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={handleUserButtonClick}
              className="w-10 h-10 flex items-center justify-center bg-zinc-200 dark:bg-zinc-600 rounded-full flex-shrink-0 hover:bg-zinc-300 dark:hover:bg-zinc-500 transition-colors"
              title={user ? user.name : "Увійти"}
            >
              <Image
                alt="Profile"
                className={`object-contain ${theme === "light" ? "brightness-0" : ""}`}
                src="/design-assets/e557ef12782f60ca73de9718c0fa6405053a8b26.png"
                width={20}
                height={20}
              />
            </button>

            {/* User Dropdown Menu */}
            {userMenuOpen && (
              <div className="header-dropdown mt-2 right-0">
                {user ? (
                  <div className="py-2">
                    <div className="px-4 py-2 border-b border-[var(--border)]">
                      <p className="font-medium text-sm text-primary">
                        {user.name}
                      </p>
                    </div>
                    <Link
                      href="/cabinet"
                      className="header-dropdown-item"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Особистий кабінет
                    </Link>
                    {user.role?.toLowerCase() === "admin" && (
                      <Link
                        href="/admin"
                        className="header-dropdown-item"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <span className="flex items-center gap-2">
                          Адмін панель
                          <BiShield className="w-4 h-4" />
                        </span>
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="header-dropdown-item text-left w-full"
                    >
                      Вийти з аккаунту
                    </button>
                  </div>
                ) : (
                  <div className="py-2">
                    <button
                      onClick={() => {
                        openAuthModal("login");
                        setUserMenuOpen(false);
                      }}
                      className="header-dropdown-item text-left w-full"
                    >
                      Увійти
                    </button>
                    <button
                      onClick={() => {
                        openAuthModal("register");
                        setUserMenuOpen(false);
                      }}
                      className="header-dropdown-item text-left w-full"
                    >
                      Зареєструватися
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={toggleTheme}
            className="w-10 h-10 flex items-center justify-center bg-zinc-200 dark:bg-zinc-600 rounded-full flex-shrink-0 hover:bg-zinc-300 dark:hover:bg-zinc-500 transition-colors"
            title={theme === "light" ? "Темна тема" : "Світла тема"}
          >
            {theme === "light" ? (
              <BiMoon className="w-4 h-4 text-zinc-900" />
            ) : (
              <BiSun className="w-4 h-4 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Desktop Header (Full version для xl и больше) */}
      <div className="hidden xl:flex fixed top-0 left-0 right-0 z-[100] flex-row items-center gap-6 px-8 py-6 bg-zinc-100 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 transition-colors duration-300 shadow-md">
        {/* Logo and Navigation Menu */}
        <div className="flex flex-row items-center gap-6 w-auto">
          <Link href="/" className="text-zinc-900 dark:text-white text-2xl font-bold transition-colors flex-shrink-0">
            Крамничка
          </Link>
          <div className="flex flex-wrap items-center gap-2 w-auto overflow-x-visible">
            {navItems.map((item) => (
              <NavItem
                key={item.path}
                href={item.href}
                icon={item.icon}
                label={item.label}
                isActive={pathname === item.path}
                badge={item.badge}
                theme={theme}
              />
            ))}
          </div>
        </div>

        {/* Search and User Actions */}
        <div className="flex items-center gap-4 w-auto ml-auto">
          {/* Advanced Search with Autocomplete */}
          <div className="relative w-96" ref={searchRef}>
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Пошук товарів..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyDown={handleKeyPress}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full max-w-full px-6 py-3 pr-12 bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-400 rounded-full outline-none transition-colors"
                />
                {inputSuggestion && searchQuery && (
                  <div
                    className="absolute top-0 left-0 w-full h-full px-6 py-3 pointer-events-none"
                    style={{
                      color: theme === "light" ? "#18181b" : "#ffffff",
                      opacity: 0.3,
                    }}
                  >
                    {searchQuery}
                    <span>
                      {inputSuggestion.slice(searchQuery.length)}
                    </span>
                  </div>
                )}
                <button
                  type="submit"
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6"
                >
                  <Image
                    alt="Search"
                    className={`object-contain opacity-60 ${theme === "light" ? "brightness-0" : ""}`}
                    src="/design-assets/140c5c170bd89ef7e788e13cc111db7097d13aba.png"
                    width={24}
                    height={24}
                  />
                </button>
              </div>
            </form>
            
            {/* Search Results Dropdown */}
            {showSuggestions && searchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-2 search-dropdown max-h-96 rounded-2xl shadow-xl border border-[var(--border)] overflow-hidden">
                {isSearching ? (
                  <div className="p-6 text-center">
                    <Spinner size="sm" className="mx-auto" />
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="py-2">
                    {searchResults.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => {
                          router.push(`/products/${product.id}`);
                          setShowSuggestions(false);
                          setSearchQuery("");
                        }}
                        className="search-result-item gap-3 group hover:bg-[var(--hover-bg)] transition-colors"
                      >
                        <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-[var(--hover-bg)]">
                          <ImageWithFallback
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            width={64}
                            height={64}
                          />
                          {product.isDiscountActive && product.discountPrice && (
                            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                              -
                              {Math.round(
                                (1 - product.discountPrice / product.price) *
                                  100
                              )}
                              %
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div
                            className="font-semibold text-base text-primary truncate mb-1"
                            dangerouslySetInnerHTML={{
                              __html: product.nameHighlight || product.name,
                            }}
                          />
                          <div className="text-sm text-muted truncate">
                            {product.brand}
                          </div>
                        </div>
                        <div className="flex flex-col items-end flex-shrink-0">
                          {product.isDiscountActive && product.discountPrice ? (
                            <>
                              <div className="text-red-500 font-bold text-base">
                                {Math.round(product.discountPrice)} ₴
                              </div>
                              <div className="text-sm text-muted line-through">
                                {Math.round(product.price)} ₴
                              </div>
                            </>
                          ) : (
                            <div className="text-primary font-semibold text-base">
                              {Math.round(product.price)} ₴
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-muted">
                    Нічого не знайдено
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={handleUserButtonClick}
              className="w-12 h-12 flex items-center justify-center bg-zinc-200 dark:bg-zinc-600 rounded-full flex-shrink-0 hover:bg-zinc-300 dark:hover:bg-zinc-500 transition-colors"
              title={user ? user.name : "Увійти"}
            >
              <Image
                alt="Profile"
                className={`object-contain ${theme === "light" ? "brightness-0" : ""}`}
                src="/design-assets/e557ef12782f60ca73de9718c0fa6405053a8b26.png"
                width={24}
                height={24}
              />
            </button>

            {/* User Dropdown Menu */}
            {userMenuOpen && (
              <div className="header-dropdown mt-2 right-0">
                {user ? (
                  <div className="py-2">
                    <div className="px-4 py-2 border-b border-[var(--border)]">
                      <p className="font-medium text-primary">{user.name}</p>
                    </div>
                    <Link
                      href="/cabinet"
                      className="header-dropdown-item"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Особистий кабінет
                    </Link>
                    {user.role?.toLowerCase() === "admin" && (
                      <Link
                        href="/admin"
                        className="header-dropdown-item"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <span className="flex items-center gap-2">
                          Адмін панель
                          <BiShield className="w-4 h-4" />
                        </span>
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="header-dropdown-item text-left w-full"
                    >
                      Вийти з аккаунту
                    </button>
                  </div>
                ) : (
                  <div className="py-2">
                    <button
                      onClick={() => {
                        openAuthModal("login");
                        setUserMenuOpen(false);
                      }}
                      className="header-dropdown-item text-left w-full"
                    >
                      Увійти
                    </button>
                    <button
                      onClick={() => {
                        openAuthModal("register");
                        setUserMenuOpen(false);
                      }}
                      className="header-dropdown-item text-left w-full"
                    >
                      Зареєструватися
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-12 h-12 flex items-center justify-center bg-zinc-200 dark:bg-zinc-600 rounded-full flex-shrink-0 hover:bg-zinc-300 dark:hover:bg-zinc-500 transition-colors"
            title={theme === "light" ? "Темна тема" : "Світла тема"}
          >
            {theme === "light" ? (
              <BiMoon className="w-5 h-5 text-zinc-900" />
            ) : (
              <BiSun className="w-5 h-5 text-white" />
            )}
          </button>
        </div>
      </div>
    </>
  );
}
