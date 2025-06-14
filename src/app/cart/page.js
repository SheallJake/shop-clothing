"use client";
import { useEffect, useState } from "react";
import ImageWithFallback from "@/components/ImageWithFallback";
import PageTransition from "@/components/PageTransition";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import AuthModal from "@/components/AuthModal";
import Spinner from "@/components/Spinner";

export default function CartPage() {
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity } = useCart();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [promoCode, setPromoCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoError, setPromoError] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    checkAuth();
    // Load promo code from localStorage
    const savedPromoCode = localStorage.getItem("promoCode");
    const savedDiscount = localStorage.getItem("discountPercent");
    if (savedPromoCode) {
      setPromoCode(savedPromoCode);
    }
    if (savedDiscount) {
      setDiscountPercent(Number(savedDiscount));
    }
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

  const handleQuantityChange = (
    itemId,
    selectedSize,
    selectedColor,
    newQuantity
  ) => {
    if (newQuantity < 1) return;
    updateQuantity(itemId, selectedSize, selectedColor, newQuantity);
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

  const discountedTotal = Math.round(total * (1 - discountPercent / 100));

  const validatePromo = async () => {
    const res = await fetch("/api/promocode/validate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code: promoCode }),
    });
    const data = await res.json();

    if (data.valid) {
      setDiscountPercent(data.discount);
      setPromoError("");
      // Save to localStorage
      localStorage.setItem("promoCode", promoCode);
      localStorage.setItem("discountPercent", data.discount);
    } else {
      setPromoError("Промокод не дійсний");
      setDiscountPercent(0);
      // Clear from localStorage
      localStorage.removeItem("promoCode");
      localStorage.removeItem("discountPercent");
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    } else {
      router.push("/order");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="md" />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Кошик</h1>

        {cart.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <p className="text-base sm:text-lg mb-4">Кошик порожній</p>
            <a
              href="/products"
              className="btn bg-black text-white hover:bg-gray-800 px-4 py-2 rounded-lg text-sm sm:text-base"
            >
              Перейти до товарів
            </a>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4">
              {cart.map((item) => (
                <div
                  key={`${item.id}-${item.selectedSize}-${item.selectedColor}`}
                  className="card card-hover p-3 sm:p-4"
                >
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name || "Product image"}
                      className="w-full sm:w-32 h-32 object-cover rounded"
                    />

                    <div className="flex-1">
                      <h2 className="font-bold text-lg sm:text-xl mb-1">
                        {item.name || "Без назви"}
                      </h2>
                      <p className="text-sm text-[var(--muted)]">
                        {item.category || "Без категорії"}
                      </p>
                      {item.selectedSize && (
                        <p className="text-sm text-[var(--muted)]">
                          Розмір: {item.selectedSize}
                        </p>
                      )}
                      {item.selectedColor && (
                        <p className="text-sm text-[var(--muted)]">
                          Колір: {item.selectedColor}
                        </p>
                      )}
                      <p className="mt-1 text-sm sm:text-base">
                        {formatPrice(item.price)} грн ×{" "}
                        {formatPrice(item.quantity)} шт.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              item.id,
                              item.selectedSize,
                              item.selectedColor,
                              Number(item.quantity) - 1
                            )
                          }
                          className="btn w-8 h-8 flex items-center justify-center text-sm"
                        >
                          -
                        </button>
                        <span className="text-sm sm:text-base">
                          {formatPrice(item.quantity)}
                        </span>
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              item.id,
                              item.selectedSize,
                              item.selectedColor,
                              Number(item.quantity) + 1
                            )
                          }
                          className="btn w-8 h-8 flex items-center justify-center text-sm"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() =>
                          removeFromCart(
                            item.id,
                            item.selectedSize,
                            item.selectedColor
                          )
                        }
                        className="text-red-500 hover:text-red-700 text-sm sm:text-base"
                      >
                        Видалити
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg sm:text-xl font-bold">
                  Загальна сума:
                </span>
                <span className="text-lg sm:text-xl font-bold">
                  {formatPrice(discountedTotal)} грн
                </span>
              </div>
              {discountPercent > 0 && (
                <div className="text-green-600 text-sm">
                  Знижка: {discountPercent}%
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Введіть промокод"
                  className="input flex-1 text-sm sm:text-base"
                />
                <button
                  onClick={validatePromo}
                  className="btn text-sm sm:text-base whitespace-nowrap"
                >
                  Застосувати
                </button>
              </div>
              {promoError && (
                <div className="text-red-500 text-sm">{promoError}</div>
              )}
              <button
                className="btn w-full mt-4 bg-black text-white hover:bg-gray-800 text-sm sm:text-base py-3"
                onClick={handleCheckout}
              >
                {isAuthenticated
                  ? "Оформити замовлення"
                  : "Увійти для оформлення"}
              </button>
            </div>
          </>
        )}
      </div>
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        theme="light"
        initialMode="login"
      />
    </PageTransition>
  );
}
