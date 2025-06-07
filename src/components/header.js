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
} from "react-icons/fi";
import { useAuthModal } from "@/context/AuthModalContext";

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
    const handleBurgerClick = (e) => handleClickOutside(e, menuRef, setOpen);
    const handleUserMenuClick = (e) =>
      handleClickOutside(e, userMenuRef, setUserMenuOpen);

    if (open) document.addEventListener("mousedown", handleBurgerClick);
    if (userMenuOpen)
      document.addEventListener("mousedown", handleUserMenuClick);

    return () => {
      document.removeEventListener("mousedown", handleBurgerClick);
      document.removeEventListener("mousedown", handleUserMenuClick);
    };
  }, [open, userMenuOpen, handleClickOutside]);

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
    { href: "/game", label: "Промогра" },
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

  return (
    <>
      <div className="bg-[var(--card-bg)] dark:bg-black rounded-lg p-2 shadow-[0_0_2px_var(--glow-color)] fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-7xl">
        <div className="flex items-center justify-between h-12">
          {/* Left Side - Burger Menu and Logo */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md hover:bg-[var(--hover-bg)] transition-colors"
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
              Магазин
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative" ref={searchRef}>
              <div className="flex items-center gap-2">
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isSearchExpanded ? "w-64" : "w-0"
                  }`}
                >
                  <input
                    type="text"
                    placeholder="Пошук..."
                    className={`w-full px-4 py-2 rounded-md bg-[var(--background)] border border-[var(--card-border)] focus:outline-none focus:border-[var(--accent)] ${
                      isSearchExpanded ? "opacity-100" : "opacity-0"
                    }`}
                    onFocus={() => setIsSearchExpanded(true)}
                  />
                </div>
                <button
                  onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                  className="p-2 rounded-md hover:bg-[var(--hover-bg)] transition-colors z-10"
                  aria-label="Пошук"
                >
                  <FiSearch size={20} />
                </button>
              </div>
            </div>

            {/* Cart */}
            <Link
              href="/cart"
              className="p-2 rounded-md hover:bg-[var(--hover-bg)] transition-colors relative"
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
              className="p-2 rounded-md hover:bg-[var(--hover-bg)] transition-colors relative"
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
                className="p-2 rounded-md hover:bg-[var(--hover-bg)] transition-colors"
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
                      className="block px-4 py-2 hover:bg-[var(--hover-bg)] transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Особистий кабінет
                    </Link>
                    {user.role === "admin" && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 hover:bg-[var(--hover-bg)] transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Адмін панель
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-[var(--hover-bg)] transition-colors"
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
                className="p-2 rounded-md hover:bg-[var(--hover-bg)] transition-colors"
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
                  className={`px-4 py-2 hover:bg-[var(--hover-bg)] rounded-md transition-colors ${
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
    </>
  );
}
