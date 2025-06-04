"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import ImageWithFallback from "@/components/ImageWithFallback";

export default function CabinetPage() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const hasShownToast = useRef(false);

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch("/api/session");
      if (!res.ok) throw new Error("Session check failed");
      const data = await res.json();

      if (!data.user) {
        if (!hasShownToast.current) {
          hasShownToast.current = true;
          toast.error("Будь ласка, увійдіть до системи");
          router.push("/");
        }
        return;
      }

      setUser(data.user);

      // Fetch user's orders
      const ordersRes = await fetch("/api/orders/user");
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData);
      }
    } catch (err) {
      console.error("Помилка перевірки сесії:", err);
      if (!hasShownToast.current) {
        hasShownToast.current = true;
        toast.error("Помилка перевірки сесії");
        router.push("/");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Особистий кабінет</h1>

        <div className="bg-gray-900 rounded-lg shadow-md p-6 mb-6 border border-gray-800">
          <h2 className="text-xl font-semibold mb-4">Особиста інформація</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400">
                Ім'я
              </label>
              <p className="mt-1 text-lg">{user.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">
                Email
              </label>
              <p className="mt-1 text-lg">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900 rounded-lg shadow-md p-6 border border-gray-800">
            <h2 className="text-xl font-semibold mb-4">Мої замовлення</h2>
            {orders.length === 0 ? (
              <p className="text-gray-400">У вас поки немає замовлень</p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-gray-800 rounded p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm text-gray-400">
                          Замовлення #{order.id}
                        </p>
                        <p className="text-sm text-gray-400">
                          Статус: {order.status}
                        </p>
                      </div>
                      <p className="font-semibold">{order.totalPrice} грн</p>
                    </div>
                    <div className="space-y-2">
                      {order.orderItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-2">
                          <ImageWithFallback
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div>
                            <p className="text-sm">{item.product.name}</p>
                            <p className="text-xs text-gray-400">
                              {item.quantity} шт. × {item.pricePerUnit} грн
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gray-900 rounded-lg shadow-md p-6 border border-gray-800">
            <h2 className="text-xl font-semibold mb-4">Обране</h2>
            <p className="text-gray-400">У вас поки немає обраних товарів</p>
          </div>
        </div>
      </div>
    </div>
  );
}
