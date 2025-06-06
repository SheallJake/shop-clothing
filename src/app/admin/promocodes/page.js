"use client";
import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Search, X } from "lucide-react";
import PageTransition from "@/components/PageTransition";

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
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {promoCode ? "Редагувати промокод" : "Новий промокод"}
          </h2>
          <button onClick={onCancel}>
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Код
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg text-black"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
              className="w-full px-3 py-2 border rounded-lg text-black"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Дата закінчення
            </label>
            <input
              type="date"
              value={formData.expirationDate}
              onChange={(e) =>
                setFormData({ ...formData, expirationDate: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg text-black"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ліміт використань
            </label>
            <input
              type="number"
              value={formData.usageLimit}
              onChange={(e) =>
                setFormData({ ...formData, usageLimit: e.target.value })
              }
              min="1"
              className="w-full px-3 py-2 border rounded-lg text-black"
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
              className="h-4 w-4 text-blue-600 rounded border-gray-300"
            />
            <label className="ml-2 text-sm text-gray-700">Активний</label>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Скасувати
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
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

  const fetchPromoCodes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/promocode/list`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }
      const data = await response.json();
      setPromoCodes(data.promos);
    } catch (err) {
      console.error("Error fetching promo codes:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPromoCodes();
  }, []);

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

      if (!response.ok) throw new Error("Failed to save promo code");

      fetchPromoCodes();
      setShowForm(false);
      setEditingPromoCode(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Ви впевнені, що хочете видалити цей промокод?")) return;

    try {
      const response = await fetch(`/api/admin/promocodes?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete promo code");

      fetchPromoCodes();
    } catch (err) {
      setError(err.message);
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
          <h1 className="text-2xl font-bold text-gray-800">
            Управління промокодами
          </h1>
          <button
            onClick={() => {
              setEditingPromoCode(null);
              setShowForm(true);
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>Додати промокод</span>
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Пошук промокодів..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-black"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Код
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Знижка
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Закінчується
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Використано
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дії
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center">
                    Завантаження...
                  </td>
                </tr>
              ) : filteredPromoCodes.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center">
                    Промокоди не знайдено
                  </td>
                </tr>
              ) : (
                filteredPromoCodes.map((promoCode) => (
                  <tr key={promoCode.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-black">
                      {promoCode.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-black">
                      {promoCode.discountPercent}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-black">
                      {new Date(promoCode.expirationDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-black">
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
                          className="text-blue-500 hover:text-blue-700"
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
