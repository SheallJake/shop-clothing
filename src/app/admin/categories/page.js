"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Plus, Pencil, Trash2, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

const CategoryForm = ({ category, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: category?.name || "",
    description: category?.description || "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-[var(--card-bg)] rounded-lg p-6 max-w-md w-full shadow-[0_0_2px_var(--glow-color)]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            {category ? "Редагувати категорію" : "Нова категорію"}
          </h2>
          <button onClick={onCancel} className="text-[var(--foreground)]">
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Назва
            </label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-[var(--border)] bg-[var(--input-bg)] text-[var(--foreground)] shadow-sm focus:border-[var(--accent)] focus:ring-[var(--accent)]"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Опис
            </label>
            <textarea
              className="mt-1 block w-full rounded-md border-[var(--border)] bg-[var(--input-bg)] text-[var(--foreground)] shadow-sm focus:border-[var(--accent)] focus:ring-[var(--accent)]"
              rows="3"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-[var(--border)] rounded-md text-[var(--foreground)] hover:bg-[var(--hover-bg)]"
            >
              Скасувати
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[var(--accent)] text-[var(--background)] rounded-md hover:bg-[var(--accent-hover)]"
            >
              {category ? "Зберегти" : "Створити"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function CategoriesManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const router = useRouter();
  const hasShownToast = useRef(false);

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch("/api/session");
      if (!res.ok) throw new Error("Session check failed");
      const data = await res.json();

      if (!data.user || data.user.role !== "admin") {
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

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/admin/categories?query=${searchQuery}`
      );

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
      setCategories(data.categories);
    } catch (err) {
      console.error("Error fetching categories:", err);
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
    fetchCategories();
  }, [searchQuery]);

  const handleSubmit = async (formData) => {
    try {
      const method = editingCategory ? "PATCH" : "POST";
      const url =
        "/api/admin/categories" +
        (editingCategory ? `?id=${editingCategory.id}` : "");

      console.log("Submitting category data:", formData);

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Category submission error:", errorData);
        throw new Error(errorData.error || "Failed to save category");
      }

      const savedCategory = await response.json();
      console.log("Category saved successfully:", savedCategory);

      fetchCategories();
      setShowForm(false);
      setEditingCategory(null);
      toast.success(
        editingCategory ? "Категорію оновлено" : "Категорію створено"
      );
    } catch (err) {
      console.error("Error saving category:", err);
      setError(err.message);
      toast.error(err.message || "Помилка при збереженні категорії");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Ви впевнені, що хочете видалити цю категорію?")) return;

    try {
      const response = await fetch(`/api/admin/categories?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete category");
      }

      fetchCategories();
      toast.success("Категорію видалено");
    } catch (err) {
      console.error("Error deleting category:", err);
      setError(err.message);
      toast.error(err.message || "Помилка при видаленні категорії");
    }
  };

  if (error) {
    return (
      <div className="text-[var(--foreground)] text-center py-4">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Управління категоріями
        </h1>
        <button
          onClick={() => {
            setEditingCategory(null);
            setShowForm(true);
          }}
          className="bg-[var(--card-bg)] hover:bg-[var(--hover-bg)] text-[var(--background)] px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
        >
          <Plus className="w-5 h-5" />
          <span>Додати категорію</span>
        </button>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Пошук категорій..."
          className="w-full pl-10 pr-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--input-bg)] text-[var(--foreground)] placeholder-[var(--foreground)]/50"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--foreground)] opacity-50 w-5 h-5" />
      </div>

      <div className="bg-[var(--card-bg)] rounded-lg shadow-[0_0_2px_var(--glow-color)] overflow-hidden">
        <table className="min-w-full divide-y divide-[var(--border)]">
          <thead className="bg-[var(--card-bg)]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--foreground)] opacity-70 uppercase tracking-wider">
                Назва
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--foreground)] opacity-70 uppercase tracking-wider">
                Опис
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--foreground)] opacity-70 uppercase tracking-wider">
                Кількість товарів
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
                  colSpan="4"
                  className="px-6 py-4 text-center text-[var(--foreground)]"
                >
                  Завантаження...
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="px-6 py-4 text-center text-[var(--foreground)]"
                >
                  Категорії не знайдено
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id} className="hover:bg-[var(--hover-bg)]">
                  <td className="px-6 py-4 whitespace-nowrap text-[var(--foreground)]">
                    {category.name}
                  </td>
                  <td className="px-6 py-4 text-[var(--foreground)]">
                    {category.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[var(--foreground)]">
                    {category._count?.products || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[var(--foreground)]">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingCategory(category);
                          setShowForm(true);
                        }}
                        className="text-[var(--accent)] hover:text-[var(--accent-hover)]"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
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
        <CategoryForm
          category={editingCategory}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingCategory(null);
          }}
        />
      )}
    </div>
  );
}
