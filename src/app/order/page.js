"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import PageTransition from "@/components/PageTransition";
import ImageWithFallback from "@/components/imageWithFallback";
import { toast } from "react-hot-toast";
import { useTheme } from "@/context/ThemeContext";
import Spinner from "@/components/Spinner";
import { useAuthModal } from "@/context/AuthModalContext";

export default function OrderPage() {
  const router = useRouter();
  const { cart, clearCart, addToCart } = useCart();
  const { theme } = useTheme();
  const { openAuthModal } = useAuthModal();
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
  const [paymentError, setPaymentError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cityInputRef = useRef(null);
  const cityListRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const lastSearchRef = useRef("");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/session");
        const data = await res.json();
        if (!data.user) {
          openAuthModal("login");
          return;
        }
        setIsAuthenticated(true);

        // Restore cart items from sessionStorage if they exist
        const savedCart = sessionStorage.getItem("cart");
        if (savedCart) {
          try {
            const cartItems = JSON.parse(savedCart);
            // Update cart context with saved items
            cartItems.forEach((item) => {
              addToCart(item);
            });
            // Clear saved cart from sessionStorage
            sessionStorage.removeItem("cart");
          } catch (error) {
            console.error("Error restoring cart items:", error);
          }
        }

      } catch (error) {
        console.error("Error checking auth:", error);
        toast.error("Помилка при перевірці авторизації");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [openAuthModal]);

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

  const calculateTotal = () => {
    return Math.round(
      cart.reduce((sum, item) => {
        const itemPrice =
          item.isDiscountActive && item.discountPrice
            ? item.discountPrice
            : item.price;
        return sum + itemPrice * item.quantity;
      }, 0)
    );
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
    if (!validateForm()) return;

    setIsSubmitting(true);
    setPaymentError(null);

    try {
      const total = calculateTotal();
      const response = await fetch("/api/payment/monobank", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: total,
          deliveryInfo: {
            city: selectedCityName,
            warehouse: selectedWarehouse,
          },
          items: cart.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            pricePerUnit:
              item.isDiscountActive && item.discountPrice
                ? item.discountPrice
                : item.price,
            name: item.name,
            image: item.image,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create payment");
      }

      const data = await response.json();
      window.location.href = data.pageUrl;
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentError(error.message);
      toast.error("Помилка при створенні платежу");
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
      <PageTransition>
        <div className="loading-state">
          <Spinner size="md" />
        </div>
      </PageTransition>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <PageTransition>
      <div className="container-main">
        {/* Заголовок и описание */}
        <div className="page-section">
          <h1 className="heading-1 mb-2">Оформлення замовлення</h1>
          <p className="text-muted text-sm md:text-base">
            Перевірте товари в кошику та заповніть інформацію для доставки.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)] gap-6">
          {/* Order Summary */}
          <div className="card shadow-card backdrop-blur-card rounded-3xl">
            <h2 className="heading-2 mb-4">Ваше замовлення</h2>
            <div className="space-y-4">
              {cart.map((item) => {
                const unitPrice =
                  item.isDiscountActive && item.discountPrice
                    ? item.discountPrice
                    : item.price;

                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-4 border-b last:border-b-0 pb-4 last:pb-0 border-[var(--border)]"
                  >
                    <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden product-card-image">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-primary truncate">
                        {item.name}
                      </h3>
                      <p className="text-sm text-muted">
                        Кількість: {item.quantity}
                      </p>
                      <p className="text-sm text-primary mt-1">
                        {formatPrice(unitPrice)} грн × {item.quantity} ={" "}
                        <span className="font-semibold">
                          {formatPrice(unitPrice * item.quantity)} грн
                        </span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-sm text-secondary">
                <span>Проміжний підсумок</span>
                <span className="font-medium text-primary">
                  {formatPrice(
                    cart.reduce((sum, item) => {
                      const unitPrice =
                        item.isDiscountActive && item.discountPrice
                          ? item.discountPrice
                          : item.price;
                      return sum + unitPrice * item.quantity;
                    }, 0)
                  )}{" "}
                  грн
                </span>
              </div>
              <p className="text-xs text-muted">
                Вартість доставки буде розрахована при підтвердженні замовлення.
              </p>
              <div className="border-t border-[var(--border)] pt-3 mt-3 flex justify-between items-center">
                <span className="font-semibold text-base sm:text-lg text-primary">
                  Загальна сума
                </span>
                <span className="font-bold text-base sm:text-xl text-primary">
                  {formatPrice(calculateTotal())} грн
                </span>
              </div>
            </div>
          </div>

          {/* Order Form */}
          <div className="space-y-6">
            {/* Delivery Information */}
            <div className="card shadow-card backdrop-blur-card rounded-3xl">
              <h2 className="heading-2 mb-4">Інформація про доставку</h2>
              <form className="space-y-4">
                <div>
                  <label className="form-label">Місто</label>
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
                      className="form-input"
                    />
                    {showCityList && citySearch.length > 0 && (
                      <div
                        ref={cityListRef}
                        className="search-dropdown"
                      >
                        {isLoadingCities ? (
                          <div className="p-4 text-center">
                            <Spinner size="sm" />
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
                                className="search-result-item"
                              >
                                {city.Description}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 text-center text-primary">
                            Місто не знайдено
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Warehouse Selection */}
                <div className="space-y-2">
                  <label htmlFor="warehouse" className="form-label">
                    Відділення
                  </label>
                  <div className="relative">
                    <select
                      id="warehouse"
                      value={selectedWarehouse}
                      onChange={(e) => setSelectedWarehouse(e.target.value)}
                      disabled={isLoadingWarehouses || !selectedCity}
                      className="form-input"
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

            {/* Submit Order */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`btn-success w-full py-3 text-sm sm:text-base rounded-full ${
                isSubmitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <Spinner size="sm" />
                  <span>Обробка платежу...</span>
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
