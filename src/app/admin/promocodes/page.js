"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Plus, Pencil, Trash2, Search, X } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

const PromoCodeForm = ({ promoCode, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    code: promoCode?.code || "",
    discountPercent: promoCode?.discountPercent || "",
    expirationDate: promoCode?.expirationDate
      ? new Date(promoCode.expirationDate).toISOString().split("T")[0]
      : "",
    usageLimit: promoCode?.usageLimit || "",
    isActive: promoCode?.isActive ?? true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      discountPercent: parseFloat(formData.discountPercent),
      usageLimit: parseInt(formData.usageLimit),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-[var(--card-bg)] rounded-lg p-6 max-w-md w-full shadow-[0_0_2px_var(--glow-color)]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            {promoCode ? "Редагувати промокод" : "Новий промокод"}
          </h2>
          <button onClick={onCancel} className="text-[var(--foreground)]">
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
              Код
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value })
              }
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--input-bg)] text-[var(--foreground)]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
              Знижка (%)
            </label>
            <input
              type="number"
              value={formData.discountPercent}
              onChange={(e) =>
                setFormData({ ...formData, discountPercent: e.target.value })
              }
              min="0"
              max="100"
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--input-bg)] text-[var(--foreground)]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
              Дата закінчення
            </label>
            <input
              type="date"
              value={formData.expirationDate}
              onChange={(e) =>
                setFormData({ ...formData, expirationDate: e.target.value })
              }
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--input-bg)] text-[var(--foreground)]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
              Ліміт використань
            </label>
            <input
              type="number"
              value={formData.usageLimit}
              onChange={(e) =>
                setFormData({ ...formData, usageLimit: e.target.value })
              }
              min="1"
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--input-bg)] text-[var(--foreground)]"
              required
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="h-4 w-4 text-[var(--accent)] rounded border-[var(--border)]"
            />
            <label className="ml-2 text-sm text-[var(--foreground)]">
              Активний
            </label>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-[var(--foreground)] hover:bg-[var(--hover-bg)] rounded-lg"
            >
              Скасувати
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[var(--accent)] text-[var(--background)] rounded-lg hover:bg-[var(--accent-hover)]"
            >
              {promoCode ? "Зберегти" : "Створити"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function PromoCodesManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [promoCodes, setPromoCodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPromoCode, setEditingPromoCode] = useState(null);
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

  const fetchPromoCodes = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams();
      if (searchQuery) queryParams.append("query", searchQuery);

      const response = await fetch(`/api/admin/promocodes?${queryParams}`);

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
      setPromoCodes(data);
    } catch (err) {
      console.error("Error fetching promo codes:", err);
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
    fetchPromoCodes();
  }, [searchQuery]);

  const handleSubmit = async (formData) => {
    try {
      const method = editingPromoCode ? "PATCH" : "POST";
      const url =
        "/api/admin/promocodes" +
        (editingPromoCode ? `?id=${editingPromoCode.id}` : "");

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Не вдалося зберегти промокод");

      fetchPromoCodes();
      setShowForm(false);
      setEditingPromoCode(null);
      toast.success("Промокод збережено");
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Помилка при збереженні промокоду");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Ви впевнені, що хочете видалити цей промокод?")) return;

    try {
      const response = await fetch(`/api/admin/promocodes?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Не вдалося видалити промокод");

      fetchPromoCodes();
      toast.success("Промокод видалено");
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Помилка при видаленні промокоду");
    }
  };

  const filteredPromoCodes = promoCodes.filter((promo) =>
    promo.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (error) {
    return <div className="text-red-500 text-center py-4">Error: {error}</div>;
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Управління промокодами
          </h1>
          <button
            onClick={() => {
              setEditingPromoCode(null);
              setShowForm(true);
            }}
            className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--background)] px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>Додати промокод</span>
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Пошук промокодів..."
            className="w-full pl-10 pr-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--input-bg)] text-[var(--foreground)]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--foreground)] opacity-50 w-5 h-5" />
        </div>

        <div className="bg-[var(--card-bg)] rounded-lg shadow-[0_0_2px_var(--glow-color)] overflow-x-auto">
          <table className="min-w-full divide-y divide-[var(--border)]">
            <thead className="bg-[var(--card-bg)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--foreground)] opacity-70 uppercase tracking-wider">
                  Код
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--foreground)] opacity-70 uppercase tracking-wider">
                  Знижка
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--foreground)] opacity-70 uppercase tracking-wider">
                  Закінчується
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--foreground)] opacity-70 uppercase tracking-wider">
                  Використано
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
              ) : filteredPromoCodes.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center text-[var(--foreground)]"
                  >
                    Промокоди не знайдено
                  </td>
                </tr>
              ) : (
                filteredPromoCodes.map((promoCode) => (
                  <tr key={promoCode.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-[var(--foreground)]">
                      {promoCode.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[var(--foreground)]">
                      {promoCode.discountPercent}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[var(--foreground)]">
                      {new Date(promoCode.expirationDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[var(--foreground)]">
                      {promoCode.usedCount} / {promoCode.usageLimit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          promoCode.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {promoCode.isActive ? "Активний" : "Неактивний"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingPromoCode(promoCode);
                            setShowForm(true);
                          }}
                          className="text-[var(--accent)] hover:text-[var(--accent-hover)]"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(promoCode.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {showForm && (
          <PromoCodeForm
            promoCode={editingPromoCode}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingPromoCode(null);
            }}
          />
        )}
      </div>
    </PageTransition>
  );
}
