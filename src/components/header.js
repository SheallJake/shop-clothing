"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Menu, X, User, Heart, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthModal from "@/components/AuthModal";
import SearchBar from "@/components/SearchBar";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const router = useRouter();
  const menuRef = useRef(null);
  const userMenuRef = useRef(null);

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
    } catch (error) {
      console.error("Помилка при виході:", error);
    }
  };

  // Обробка кліку по кнопці користувача
  const handleUserButtonClick = async () => {
    const currentUser = await checkSession();
    if (currentUser) {
      setUserMenuOpen(!userMenuOpen);
    } else {
      setShowAuth(true);
    }
  };

  return (
    <>
      <header className="w-full flex items-center justify-between p-4 border-b bg-white sticky top-0 z-50 text-black px-4 md:px-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setOpen(!open)}
            className="hover:opacity-80 transition-opacity"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
          <Link
            href="/"
            className="text-xl font-bold hover:text-gray-700 transition-colors cursor-pointer"
          >
            Крамничка
          </Link>
        </div>

        <div className="hidden md:block flex-1 max-w-2xl mx-4">
          <SearchBar />
        </div>

        <div className="flex items-center gap-4 text-black relative">
          <Link
            href="/wishlist"
            title="Обране"
            className="hover:opacity-80 transition-opacity"
          >
            <Heart />
          </Link>
          <Link
            href="/cart"
            title="Кошик"
            className="hover:opacity-80 transition-opacity"
          >
            <ShoppingCart />
          </Link>

          <button
            title={user ? "Кабінет" : "Увійти"}
            onClick={handleUserButtonClick}
            className="hover:opacity-80 transition-opacity"
          >
            <User />
          </button>

          {user && userMenuOpen && (
            <div
              ref={userMenuRef}
              className="absolute top-full right-0 mt-2 bg-white border rounded-md shadow-lg p-4 w-56 z-50 flex flex-col gap-3"
            >
              <div className="font-bold text-lg border-b pb-2">{user.name}</div>
              <button
                className="text-left p-2 hover:bg-gray-100 rounded transition-colors"
                onClick={navigateToProfile}
              >
                Особистий кабінет
              </button>
              <button
                className="text-left p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                onClick={logout}
              >
                Вийти
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Mobile search bar */}
      <div className="md:hidden px-4 py-2 border-b bg-white">
        <SearchBar />
      </div>

      {/* Бургер меню */}
      <div
        ref={menuRef}
        className={`text-black fixed top-[60px] left-0 mt-1 bg-white border shadow-lg rounded-md 
                w-1/2 h-[405px] z-50 flex flex-col p-4 gap-3 transition-all duration-300 transform origin-top-left
                ${
                  open
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-95 pointer-events-none"
                }`}
      >
        <button
          className="p-2 border rounded text-left hover:bg-gray-100 transition-colors"
          onClick={navigateToProducts}
        >
          Каталог
        </button>
        <button className="p-2 border rounded text-left hover:bg-gray-100 transition-colors">
          Заглушка 1
        </button>
        <button className="p-2 border rounded text-left hover:bg-gray-100 transition-colors">
          Заглушка 2
        </button>
        <button className="p-2 border rounded text-left hover:bg-gray-100 transition-colors">
          Заглушка 3
        </button>
      </div>

      <AuthModal
        isOpen={showAuth}
        onClose={() => {
          setShowAuth(false);
          if (!user) {
            router.refresh();
          }
        }}
      />
    </>
  );
}
