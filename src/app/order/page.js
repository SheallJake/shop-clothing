"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import PageTransition from "@/components/PageTransition";
import ImageWithFallback from "@/components/ImageWithFallback";
import { toast } from "react-hot-toast";

export default function OrderPage() {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cities, setCities] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [isCityInputFocused, setIsCityInputFocused] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isLoadingWarehouses, setIsLoadingWarehouses] = useState(false);
  const [selectedCityName, setSelectedCityName] = useState("");

  useEffect(() => {
    checkAuth();
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

  // Load cities after authentication
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadCities = async () => {
      try {
        setIsLoadingCities(true);
        const res = await fetch(
          `/api/nova/cities?search=${encodeURIComponent(citySearch)}`
        );
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
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
    };

    const timeoutId = setTimeout(() => {
      loadCities();
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [isAuthenticated, citySearch]);

  // Load warehouses when city is selected
  useEffect(() => {
    if (!selectedCity) {
      setWarehouses([]);
      setSelectedWarehouse("");
      return;
    }

    const loadWarehouses = async () => {
      try {
        setIsLoadingWarehouses(true);
        const res = await fetch("/api/nova/warehouses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ cityRef: selectedCity }),
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
    };

    loadWarehouses();
  }, [selectedCity]);

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
        toast.success("Промокод успішно застосовано!");
      } else {
        toast.error("Недійсний промокод");
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
    return subtotal - discountAmount;
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

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    setPaymentError(null);

    if (!validateForm()) {
      return;
    }

    try {
      setIsProcessingPayment(true);

      const paymentRes = await fetch("/api/payment/monobank", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: calculateTotal(),
          deliveryInfo: {
            city: selectedCity,
            warehouse: selectedWarehouse,
          },
          items: cart,
          promoCode: promoCode || null,
        }),
      });

      const paymentData = await paymentRes.json();

      if (!paymentRes.ok) {
        throw new Error(
          paymentData.details?.error?.message ||
            paymentData.error ||
            "Failed to create payment"
        );
      }

      if (!paymentData.pageUrl) {
        throw new Error("Payment page URL is missing");
      }

      window.location.href = paymentData.pageUrl;
    } catch (error) {
      setPaymentError(error.message);
      toast.error(`Помилка при створенні платежу: ${error.message}`);
      setIsProcessingPayment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-black">
          Оформлення замовлення
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-black">
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
                    <h3 className="font-medium text-black">{item.name}</h3>
                    <p className="text-black">Кількість: {item.quantity}</p>
                    <p className="text-black">
                      Ціна: {item.price * item.quantity} грн
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-2">
              <div className="flex justify-between mb-2 text-black">
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
              <div className="flex justify-between font-bold text-lg text-black">
                <span>Загальна сума:</span>
                <span>{calculateTotal()} грн</span>
              </div>
            </div>
          </div>

          {/* Order Form */}
          <div className="space-y-6">
            {/* Delivery Information */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-black">
                Інформація про доставку
              </h2>
              <form className="space-y-4">
                <div className="my-4">
                  <label className="block text-sm font-medium mb-1 text-black">
                    Місто
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={citySearch}
                        onChange={(e) => setCitySearch(e.target.value)}
                        onFocus={() => setIsCityInputFocused(true)}
                        onBlur={() => {
                          setTimeout(() => setIsCityInputFocused(false), 200);
                        }}
                        placeholder={selectedCityName || "Введіть назву міста"}
                        className={`w-full p-2 border rounded-md text-black appearance-none bg-white transition-all duration-300 ease-in-out hover:border-gray-400 focus:border-gray-400 focus:outline-none ${
                          selectedCityName ? "border-green-500" : ""
                        }`}
                        disabled={isLoadingCities}
                      />
                      {cities.length > 0 &&
                        !isLoadingCities &&
                        isCityInputFocused &&
                        citySearch.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                            {cities.map((city) => (
                              <div
                                key={city.Ref}
                                className={`p-2 hover:bg-gray-100 cursor-pointer text-black ${
                                  city.Ref === selectedCity ? "bg-green-50" : ""
                                }`}
                                onClick={() => {
                                  setSelectedCity(city.Ref);
                                  setSelectedCityName(city.Description);
                                  setCitySearch("");
                                  setIsCityInputFocused(false);
                                }}
                              >
                                {city.Description}
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                    {isLoadingCities && (
                      <div className="flex-shrink-0">
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gray-900"></div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="my-4">
                  <label className="block text-sm font-medium mb-1 text-black">
                    Відділення
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedWarehouse}
                      onChange={(e) => setSelectedWarehouse(e.target.value)}
                      className="w-full p-2 border rounded-md text-black appearance-none bg-white transition-all duration-300 ease-in-out hover:border-gray-400 focus:border-gray-400 focus:outline-none"
                      disabled={!selectedCity || isLoadingWarehouses}
                      required
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 0.5rem center",
                        backgroundSize: "1.5em 1.5em",
                        paddingRight: "2.5rem",
                      }}
                    >
                      <option value="">Оберіть відділення</option>
                      {warehouses.map((warehouse) => (
                        <option key={warehouse.Ref} value={warehouse.Ref}>
                          {warehouse.Description}
                        </option>
                      ))}
                    </select>
                    {isLoadingWarehouses && (
                      <div className="flex-shrink-0">
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gray-900"></div>
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </div>

            {/* Promo Code */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-black">
                Промокод
              </h2>
              <form onSubmit={handlePromoCodeSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Введіть промокод"
                  className="flex-1 p-2 border rounded-md text-black"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
                >
                  Застосувати
                </button>
              </form>
            </div>

            {/* Submit Order */}
            <button
              onClick={handleOrderSubmit}
              disabled={isProcessingPayment}
              className={`w-full py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors ${
                isProcessingPayment ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isProcessingPayment ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
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
