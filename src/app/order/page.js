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
  const [deliveryInfo, setDeliveryInfo] = useState({
    address: "",
    city: "",
    region: "",
    postalCode: "",
  });
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

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

  const handleDeliveryInfoChange = (e) => {
    const { name, value } = e.target;
    setDeliveryInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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

    if (
      !deliveryInfo.address ||
      !deliveryInfo.city ||
      !deliveryInfo.region ||
      !deliveryInfo.postalCode
    ) {
      toast.error("Будь ласка, заповніть всі поля доставки");
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

      // Create payment first
      const paymentRes = await fetch("/api/payment/monobank", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: calculateTotal(),
          deliveryInfo,
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

      // Redirect to Monobank payment page
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
                  <div className="w-20 h-20 relative">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover rounded-md"
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
                <div>
                  <label className="block text-sm font-medium mb-1 text-black">
                    Адреса
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={deliveryInfo.address}
                    onChange={handleDeliveryInfoChange}
                    className="w-full p-2 border rounded-md text-black"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-black">
                      Місто
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={deliveryInfo.city}
                      onChange={handleDeliveryInfoChange}
                      className="w-full p-2 border rounded-md text-black"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-black">
                      Область
                    </label>
                    <input
                      type="text"
                      name="region"
                      value={deliveryInfo.region}
                      onChange={handleDeliveryInfoChange}
                      className="w-full p-2 border rounded-md text-black"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-black">
                    Поштовий індекс
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={deliveryInfo.postalCode}
                    onChange={handleDeliveryInfoChange}
                    className="w-full p-2 border rounded-md text-black"
                    required
                  />
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
