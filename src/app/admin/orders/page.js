"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

const ORDER_STATUSES = {
  Pending: "Pending",
  Processing: "Processing",
  Shipped: "Shipped",
  Delivered: "Delivered",
  Cancelled: "Cancelled",
  "Payment Failed": "Payment Failed",
};

const STATUS_COLORS = {
  Pending: "bg-transparent text-yellow-400",
  Processing: "bg-transparent text-blue-400",
  Shipped: "bg-transparent text-purple-400",
  Delivered: "bg-transparent text-green-400",
  Cancelled: "bg-transparent text-red-400",
  "Payment Failed": "bg-transparent text-red-400",
};

const STATUS_LABELS = {
  Pending: "В обробці",
  Processing: "Відправлено",
  Shipped: "В дорозі",
  Delivered: "Доставлено",
  Cancelled: "Скасовано",
  "Payment Failed": "Помилка оплати",
};

export default function OrdersManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const hasShownToast = useRef(false);

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch("/api/session");
      if (!res.ok) throw new Error("Session check failed");
      const data = await res.json();

      if (!data.user || data.user.role.toLowerCase() !== "admin") {
        if (!hasShownToast.current) {
          hasShownToast.current = true;
          toast.error("Доступ заборонено");
          router.push("/");
        }
        return;
      }
    } catch (err) {
      console.error("Помилка перевірки сесії:", err);
      if (!hasShownToast.current) {
        hasShownToast.current = true;
        toast.error("Помилка перевірки сесії");
        router.push("/");
      }
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams();
      if (searchQuery) queryParams.append("query", searchQuery);
      if (statusFilter) queryParams.append("status", statusFilter);

      const response = await fetch(`/api/admin/orders?${queryParams}`);

      if (response.status === 401) {
        if (!hasShownToast.current) {
          hasShownToast.current = true;
          toast.error("Доступ заборонено");
          router.push("/");
        }
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }
      const data = await response.json();
      setOrders(data.orders);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.message);
      if (err.message.includes("Unauthorized")) {
        if (!hasShownToast.current) {
          hasShownToast.current = true;
          toast.error("Доступ заборонено");
          router.push("/");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [searchQuery, statusFilter]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await fetch(`/api/admin/orders?id=${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update order status");
      }

      fetchOrders();
      toast.success("Статус замовлення оновлено");
    } catch (err) {
      console.error("Error updating order status:", err);
      setError(err.message);
      toast.error(err.message || "Помилка при оновленні статусу замовлення");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Ви впевнені, що хочете видалити це замовлення?")) return;

    try {
      const response = await fetch(`/api/admin/orders?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete order");
      }

      fetchOrders();
      toast.success("Замовлення видалено");
    } catch (err) {
      console.error("Error deleting order:", err);
      setError(err.message);
      toast.error(err.message || "Помилка при видаленні замовлення");
    }
  };

  const calculateTotal = (orderItems) => {
    return orderItems.reduce(
      (sum, item) => sum + item.quantity * item.product.price,
      0
    );
  };

  if (error) {
    toast.error(error);
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[var(--foreground)]">
          Управління замовленнями
        </h1>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Пошук замовлень за email або ім'ям клієнта..."
            className="w-full pl-10 pr-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--input-bg)] text-[var(--foreground)]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--foreground)] opacity-50 w-5 h-5" />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-[var(--border)] rounded-lg px-4 py-2 bg-[var(--input-bg)] text-[var(--foreground)]"
        >
          <option value="">Всі статуси</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value} className={STATUS_COLORS[value]}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-[var(--card-bg)] rounded-lg shadow-[0_0_2px_var(--glow-color)] overflow-x-auto">
        <table className="min-w-full divide-y divide-[var(--border)]">
          <thead className="bg-[var(--card-bg)]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--foreground)] opacity-70 uppercase tracking-wider">
                ID замовлення
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--foreground)] opacity-70 uppercase tracking-wider">
                Клієнт
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--foreground)] opacity-70 uppercase tracking-wider">
                Товари
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--foreground)] opacity-70 uppercase tracking-wider">
                Сума
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--foreground)] opacity-70 uppercase tracking-wider">
                Статус
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--foreground)] opacity-70 uppercase tracking-wider">
                Дії
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {isLoading ? (
              <tr>
                <td
                  colSpan="6"
                  className="px-6 py-4 text-center text-[var(--foreground)]"
                >
                  Завантаження...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="px-6 py-4 text-center text-[var(--foreground)]"
                >
                  Замовлення не знайдено
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-[var(--foreground)]">
                    #{order.id}
                  </td>
                  <td className="px-6 py-4 text-[var(--foreground)]">
                    <div>
                      <div className="font-medium">{order.user.name}</div>
                      <div className="text-sm opacity-70">
                        {order.user.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[var(--foreground)]">
                    <ul className="list-disc list-inside">
                      {order.orderItems.map((item, index) => (
                        <li key={index} className="text-sm">
                          {item.product.name} x{item.quantity}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[var(--foreground)]">
                    {calculateTotal(order.orderItems)} грн
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap ${STATUS_COLORS[order.status]}`}
                  >
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(order.id, e.target.value)
                      }
                      className={`border border-[var(--border)] rounded-lg px-3 py-1 text-sm font-medium bg-[var(--input-bg)] ${STATUS_COLORS[order.status]}`}
                    >
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <option
                          key={value}
                          value={value}
                          className={STATUS_COLORS[value]}
                        >
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleDelete(order.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
