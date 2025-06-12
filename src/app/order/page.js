"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import PageTransition from "@/components/PageTransition";
import ImageWithFallback from "@/components/ImageWithFallback";
import { toast } from "react-hot-toast";
import { useTheme } from "@/context/ThemeContext";
import Spinner from "@/components/Spinner";

export default function OrderPage() {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cities, setCities] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [showCityList, setShowCityList] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isLoadingWarehouses, setIsLoadingWarehouses] = useState(false);
  const [selectedCityName, setSelectedCityName] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cityInputRef = useRef(null);
  const cityListRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const lastSearchRef = useRef("");

  useEffect(() => {
    checkAuth();
    // Load promo code from localStorage
    const savedPromoCode = localStorage.getItem("promoCode");
    const savedDiscount = localStorage.getItem("discountPercent");
    if (savedPromoCode) {
      setPromoCode(savedPromoCode);
    }
    if (savedDiscount) {
      setDiscount(Number(savedDiscount));
    }
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/session");
      const data = await res.json();
      setIsAuthenticated(!!data.user);
      if (!data.user) {
        router.push("/login");
      }
    } catch (error) {
      console.error("Error checking auth:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCities = useCallback(async (search) => {
    if (search === lastSearchRef.current) return;
    lastSearchRef.current = search;

    setIsLoadingCities(true);
    try {
      const response = await fetch(
        `/api/nova/cities?search=${encodeURIComponent(search)}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (!data || !data.data) {
        throw new Error("Invalid response format");
      }
      setCities(data.data);
    } catch (error) {
      console.error("Error loading cities:", error);
      toast.error("Помилка при завантаженні міст");
      setCities([]);
    } finally {
      setIsLoadingCities(false);
    }
  }, []);

  const handleCityInputChange = useCallback(
    (e) => {
      const value = e.target.value;
      setCitySearch(value);
      setShowCityList(true);

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        if (value.length > 0) {
          loadCities(value);
        } else {
          setCities([]);
        }
      }, 300);
    },
    [loadCities]
  );

  const loadWarehouses = useCallback(async (cityRef) => {
    if (!cityRef) return;

    setIsLoadingWarehouses(true);
    try {
      const res = await fetch("/api/nova/warehouses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cityRef }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      if (!data || !data.data) {
        throw new Error("Invalid response format");
      }

      setWarehouses(data.data);
    } catch (error) {
      console.error("Error loading warehouses:", error);
      toast.error("Помилка при завантаженні відділень");
      setWarehouses([]);
    } finally {
      setIsLoadingWarehouses(false);
    }
  }, []);

  const handleCitySelect = useCallback(
    (city) => {
      setSelectedCity(city.Ref);
      setSelectedCityName(city.Description);
      setCitySearch(city.Description);
      setShowCityList(false);
      lastSearchRef.current = city.Description;

      // Reset warehouse selection when city changes
      setSelectedWarehouse("");
      setWarehouses([]);

      // Load warehouses for the selected city
      loadWarehouses(city.Ref);
    },
    [loadWarehouses]
  );

  const handleCityInputKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (citySearch.trim()) {
          const exactMatch = cities.find(
            (city) =>
              city.Description.toLowerCase() === citySearch.toLowerCase()
          );
          if (exactMatch) {
            handleCitySelect(exactMatch);
          } else {
            toast.error("Будь ласка, виберіть місто зі списку");
          }
        }
      }
    },
    [citySearch, cities, handleCitySelect]
  );

  const handleCityInputFocus = useCallback(() => {
    setShowCityList(true);
    if (citySearch.length > 0) {
      loadCities(citySearch);
    }
  }, [citySearch, loadCities]);

  const handleCityInputBlur = useCallback(() => {
    setTimeout(() => {
      setShowCityList(false);
    }, 200);
  }, []);

  // Очистка таймаута при размонтировании
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handlePromoCodeSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/promo/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: promoCode }),
      });
      const data = await res.json();
      if (data.valid) {
        setDiscount(data.discountPercent);
        // Save to localStorage
        localStorage.setItem("promoCode", promoCode);
        localStorage.setItem("discountPercent", data.discountPercent);
        toast.success("Промокод успішно застосовано!");
      } else {
        toast.error("Недійсний промокод");
        // Clear from localStorage
        localStorage.removeItem("promoCode");
        localStorage.removeItem("discountPercent");
        setDiscount(0);
      }
    } catch (error) {
      toast.error("Помилка при перевірці промокоду");
    }
  };

  const calculateTotal = () => {
    const subtotal = cart.reduce((sum, item) => {
      const itemPrice =
        item.isDiscountActive && item.discountPrice
          ? item.discountPrice
          : item.price;
      return sum + itemPrice * item.quantity;
    }, 0);
    const discountAmount = (subtotal * discount) / 100;
    return Math.round(subtotal - discountAmount);
  };

  // Форматування ціни
  const formatPrice = (price) => {
    const numPrice = Number(price);
    if (isNaN(numPrice)) return "0";
    return Math.round(numPrice).toString();
  };

  const validateForm = () => {
    if (cart.length === 0) {
      toast.error("Ваш кошик порожній");
      return false;
    }

    if (!selectedCity || !selectedWarehouse) {
      toast.error("Будь ласка, оберіть місто та відділення Нової Пошти");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCity || !selectedWarehouse) {
      toast.error("Будь ласка, виберіть місто та відділення");
      return;
    }

    if (!cart || cart.length === 0) {
      toast.error("Корзина порожня");
      return;
    }

    setIsSubmitting(true);
    try {
      // Логуємо початкові дані корзини
      console.log("Cart data:", cart);

      // Перевіряємо кожен товар
      const orderItems = cart.map((item) => {
        console.log("Processing item:", item);

        // Перевіряємо наявність всіх необхідних полів
        if (!item.id) {
          console.error("Missing product ID:", item);
          throw new Error("Відсутній ID товару");
        }
        if (!item.quantity || item.quantity <= 0) {
          console.error("Invalid quantity:", item);
          throw new Error("Невірна кількість товару");
        }
        if (!item.price && !item.discountPrice) {
          console.error("Missing price:", item);
          throw new Error("Відсутня ціна товару");
        }

        const pricePerUnit = item.isDiscountActive
          ? item.discountPrice
          : item.price;
        console.log("Calculated price per unit:", pricePerUnit);

        return {
          productId: item.id,
          quantity: item.quantity,
          pricePerUnit: pricePerUnit,
          name: item.name || "Товар",
          image: item.image || "",
        };
      });

      // Логуємо підготовлені дані для відправки
      const requestData = {
        items: orderItems,
        amount: calculateTotal(),
        deliveryInfo: {
          city: selectedCityName,
          cityRef: selectedCity,
          warehouse: selectedWarehouse,
        },
        promoCode: promoCode,
      };
      console.log("Request data:", requestData);

      const response = await fetch("/api/payment/monobank", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const responseData = await response.json();
      console.log("Response data:", responseData);

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to create payment");
      }

      if (responseData.pageUrl) {
        window.location.href = responseData.pageUrl;
      } else {
        throw new Error("Payment URL is missing");
      }
    } catch (error) {
      console.error("Payment error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      toast.error(error.message || "Помилка при створенні платежу");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Додамо функцію для перевірки даних товару
  const validateCartItem = (item) => {
    const isValid =
      item &&
      typeof item.id === "string" &&
      typeof item.quantity === "number" &&
      item.quantity > 0 &&
      (typeof item.price === "number" ||
        typeof item.discountPrice === "number");

    if (!isValid) {
      console.error("Invalid cart item:", item);
    }

    return isValid;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="md" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-[var(--foreground)]">
          Оформлення замовлення
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-[var(--card-bg)] p-6 rounded-lg shadow-md border border-[var(--card-border)]">
            <h2 className="text-xl font-semibold mb-4 text-[var(--foreground)]">
              Ваше замовлення
            </h2>
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="w-20 h-20">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="rounded-md"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-[var(--foreground)]">
                      {item.name}
                    </h3>
                    <p className="text-[var(--foreground)]">
                      Кількість: {item.quantity}
                    </p>
                    <p className="text-[var(--foreground)]">
                      Ціна: {item.price * item.quantity} грн
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-2">
              <div className="flex justify-between mb-2 text-[var(--foreground)]">
                <span>Проміжний підсумок:</span>
                <span>
                  {cart.reduce(
                    (sum, item) => sum + item.price * item.quantity,
                    0
                  )}{" "}
                  грн
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between mb-2 text-green-600">
                  <span>Знижка:</span>
                  <span>-{discount}%</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg text-[var(--foreground)]">
                <span>Загальна сума:</span>
                <span>{formatPrice(calculateTotal())} грн</span>
              </div>
            </div>
          </div>

          {/* Order Form */}
          <div className="space-y-6">
            {/* Delivery Information */}
            <div className="bg-[var(--card-bg)] p-6 rounded-lg shadow-md border border-[var(--card-border)]">
              <h2 className="text-xl font-semibold mb-4 text-[var(--foreground)]">
                Інформація про доставку
              </h2>
              <form className="space-y-4">
                <div className="my-4">
                  <label className="block text-sm font-medium mb-1 text-[var(--foreground)]">
                    Місто
                  </label>
                  <div className="relative">
                    <input
                      ref={cityInputRef}
                      type="text"
                      value={citySearch}
                      onChange={handleCityInputChange}
                      onKeyDown={handleCityInputKeyDown}
                      onFocus={handleCityInputFocus}
                      onBlur={handleCityInputBlur}
                      placeholder="Введіть місто"
                      className="w-full px-4 py-2 rounded-md bg-[var(--input-bg)] border border-[var(--card-border)] focus:outline-none focus:border-[var(--accent)]"
                    />
                    {showCityList && citySearch.length > 0 && (
                      <div
                        ref={cityListRef}
                        className="absolute top-full left-0 right-0 mt-1 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-md shadow-lg z-50 max-h-60 overflow-y-auto"
                      >
                        {isLoadingCities ? (
                          <div className="p-4 text-center">
                            <Spinner size="sm" className="mx-auto" />
                          </div>
                        ) : cities.length > 0 ? (
                          <div className="py-2">
                            {cities.map((city) => (
                              <button
                                key={city.Ref}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  handleCitySelect(city);
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-[var(--hover-bg)] transition-colors"
                              >
                                {city.Description}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 text-center text-[var(--foreground)]">
                            Місто не знайдено
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Warehouse Selection */}
                <div className="space-y-2">
                  <label
                    htmlFor="warehouse"
                    className="block text-sm font-medium text-[var(--foreground)]"
                  >
                    Відділення
                  </label>
                  <div className="relative">
                    <select
                      id="warehouse"
                      value={selectedWarehouse}
                      onChange={(e) => setSelectedWarehouse(e.target.value)}
                      disabled={isLoadingWarehouses || !selectedCity}
                      className="w-full px-4 py-2 rounded-md bg-[var(--input-bg)] border border-[var(--card-border)] focus:outline-none focus:border-[var(--accent)] disabled:opacity-50"
                    >
                      <option value="">Виберіть відділення</option>
                      {warehouses.map((warehouse) => (
                        <option key={warehouse.Ref} value={warehouse.Ref}>
                          {warehouse.Description}
                        </option>
                      ))}
                    </select>
                    {isLoadingWarehouses && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Spinner size="sm" />
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </div>

            {/* Promo Code */}
            <div className="bg-[var(--card-bg)] p-6 rounded-lg shadow-md border border-[var(--card-border)]">
              <h2 className="text-xl font-semibold mb-4 text-[var(--foreground)]">
                Промокод
              </h2>
              <form onSubmit={handlePromoCodeSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Введіть промокод"
                  className="flex-1 p-2 border rounded-md text-[var(--foreground)] bg-[var(--input-bg)] border-[var(--border)]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[var(--accent)] text-white rounded-md hover:bg-[var(--accent-hover)]"
                >
                  Застосувати
                </button>
              </form>
            </div>

            {/* Submit Order */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`w-full py-3 bg-[var(--accent)] text-white rounded-md hover:bg-[var(--accent-hover)] transition-colors ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <Spinner size="sm" className="mr-2" />
                  Обробка платежу...
                </div>
              ) : (
                "Оплатити замовлення"
              )}
            </button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
