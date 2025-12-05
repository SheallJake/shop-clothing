"use client";
import { useEffect, useState } from "react";
import ImageWithFallback from "@/components/imageWithFallback";
import PageTransition from "@/components/PageTransition";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import AuthModal from "@/components/AuthModal";
import Spinner from "@/components/Spinner";
import { useAuthModal } from "@/context/AuthModalContext";
import { toast } from "react-hot-toast";

export default function CartPage() {
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity } = useCart();
  const { openAuthModal, showAuthModal, closeAuthModal } = useAuthModal();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/session");
      const data = await res.json();
      setIsAuthenticated(!!data.user);
    } catch (error) {
      console.error("Error checking auth:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(itemId, newQuantity, true);
  };

  // Форматування ціни
  const formatPrice = (price) => {
    const numPrice = Number(price);
    if (isNaN(numPrice)) return "0";
    return Math.round(numPrice).toString();
  };

  // Обчислення загальної суми з перевіркою
  const total = cart.reduce((sum, item) => {
    const itemPrice =
      item.isDiscountActive && item.discountPrice
        ? item.discountPrice
        : item.price;
    const price = Number(itemPrice);
    const quantity = Number(item.quantity);
    if (isNaN(price) || isNaN(quantity)) return sum;
    return sum + price * quantity;
  }, 0);

  const handleCheckout = async () => {
    try {
      const res = await fetch("/api/session");
      const data = await res.json();
      if (!data.user) {
        sessionStorage.setItem("intendedDestination", "/order");
        openAuthModal("login");
      } else {
        router.push("/order");
      }
    } catch (error) {
      console.error("Error checking session:", error);
      toast.error("Помилка при перевірці авторизації");
    }
  };

  return (
    <PageTransition>
      <div className="container-main">
        {/* Заголовок и описание */}
        <div className="page-section">
          <h1 className="heading-1 mb-2">Кошик</h1>
          <p className="text-muted text-sm md:text-base">
            Перевірте товари перед оформленням замовлення.
          </p>
        </div>

        {/* Состояние загрузки */}
        {isLoading ? (
          <div className="loading-state">
            <Spinner size="md" />
          </div>
        ) : cart.length === 0 ? (
          // Порожній кошик
          <div className="empty-state">
            <p className="empty-message mb-4">Кошик порожній</p>
            <a href="/products" className="btn-primary inline-flex">
              Перейти до товарів
            </a>
          </div>
        ) : (
          // Основний контент кошика в стиле главной страницы
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-6">
            {/* Список товарів */}
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="product-card flex flex-col sm:flex-row gap-4 items-stretch"
                >
                  {/* Зображення */}
                  <div className="relative w-full sm:w-40 md:w-48 h-32 md:h-40 product-card-image">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name || "Product image"}
                      className="w-full h-full object-cover transition-transform duration-300"
                    />
                  </div>

                  {/* Інформація та дії */}
                  <div className="product-card-content flex-1 flex flex-col sm:flex-row justify-between gap-4 text-primary">
                    <div className="flex-1">
                      <h2 className="mb-1 text-base sm:text-lg md:text-xl font-semibold">
                        {item.name || "Без назви"}
                      </h2>
                      <p className="text-xs sm:text-sm text-muted">
                        {item.category || "Без категорії"}
                      </p>
                      <p className="text-sm sm:text-base mt-3">
                        {formatPrice(item.price)} грн ×{" "}
                        {formatPrice(item.quantity)} шт.
                      </p>
                    </div>

                    <div className="flex flex-col items-end justify-between gap-3">
                      <button
                        onClick={() => removeFromCart(item.id, true)}
                        className="text-xs sm:text-sm px-3 py-1 rounded-full bg-red-500 hover:bg-red-600 transition-colors text-white"
                      >
                        Видалити
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              item.id,
                              Number(item.quantity) - 1
                            )
                          }
                          className="product-card-action-button w-8 h-8 text-sm"
                        >
                          -
                        </button>
                        <span className="text-sm sm:text-base min-w-[2rem] text-center">
                          {formatPrice(item.quantity)}
                        </span>
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              item.id,
                              Number(item.quantity) + 1
                            )
                          }
                          className="product-card-action-button w-8 h-8 text-sm"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Підсумок замовлення с поддержкой тем */}
            <aside className="rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--text-primary)] p-4 md:p-6 shadow-card h-max space-y-4">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold mb-1 text-primary">
                  Підсумок замовлення
                </h2>
                <p className="text-xs sm:text-sm text-muted">
                  Загальна кількість товарів:{" "}
                  <span className="font-semibold text-primary">
                    {cart.reduce(
                      (sum, item) => sum + Number(item.quantity || 0),
                      0
                    )}
                  </span>
                </p>
              </div>

              <div className="border-t my-2 border-[var(--border)]" />

              <div className="flex items-center justify-between">
                <span className="text-sm sm:text-base text-secondary">
                  Проміжний підсумок
                </span>
                <span className="font-semibold text-base sm:text-lg text-primary">
                  {formatPrice(total)} грн
                </span>
              </div>

              <p className="text-xs sm:text-sm text-muted">
                Вартість доставки буде розрахована на наступному кроці
                оформлення замовлення.
              </p>

              <button
                className="btn-success w-full mt-2 py-3 text-sm sm:text-base rounded-full"
                onClick={handleCheckout}
              >
                {isAuthenticated
                  ? "Перейти до оформлення замовлення"
                  : "Увійти для оформлення"}
              </button>
            </aside>
          </div>
        )}
      </div>
      <AuthModal
        isOpen={showAuthModal}
        onClose={closeAuthModal}
        theme="light"
        initialMode="login"
      />
    </PageTransition>
  );
}
