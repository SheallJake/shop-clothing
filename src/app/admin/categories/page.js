"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Plus, Pencil, Trash2, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", duration: 0.3 }}
        className="bg-[var(--card-bg)] rounded-lg p-6 max-w-md w-full shadow-[0_0_2px_var(--glow-color)]"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            {category ? "Редагувати категорію" : "Нова категорія"}
          </h2>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCancel}
            className="text-[var(--foreground)] hover:text-[var(--accent)] transition-colors"
          >
            <X className="w-6 h-6" />
          </motion.button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Назва
            </label>
            <motion.input
              whileFocus={{ scale: 1.01 }}
              type="text"
              required
              className="mt-1 block w-full rounded-md border-[var(--border)] bg-[var(--input-bg)] text-[var(--foreground)] shadow-sm focus:border-[var(--accent)] focus:ring-[var(--accent)] transition-all duration-200"
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
            <motion.textarea
              whileFocus={{ scale: 1.01 }}
              className="mt-1 block w-full rounded-md border-[var(--border)] bg-[var(--input-bg)] text-[var(--foreground)] shadow-sm focus:border-[var(--accent)] focus:ring-[var(--accent)] transition-all duration-200"
              rows="3"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>
          <div className="flex justify-end space-x-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--hover)] rounded-md transition-colors"
            >
              Скасувати
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] rounded-md transition-colors"
            >
              {category ? "Зберегти" : "Створити"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const MoveProductsModal = ({
  category,
  categories,
  onMove,
  onCancel,
  onCategoriesUpdate,
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [newCategoryData, setNewCategoryData] = useState({
    name: "",
    description: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedCategoryId) {
      onMove(selectedCategoryId);
    }
  };

  const handleCreateNewCategory = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCategoryData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create category");
      }

      const newCategory = await response.json();

      // Оновлюємо список категорій
      await onCategoriesUpdate();

      // Автоматично переміщуємо товари в нову категорію
      await onMove(newCategory.id);

      setShowNewCategoryForm(false);
      setNewCategoryData({ name: "", description: "" });
      toast.success("Нову категорію створено та товари переміщено");
    } catch (err) {
      console.error("Error creating category:", err);
      toast.error(err.message || "Помилка при створенні категорії");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", duration: 0.3 }}
        className="bg-[var(--card-bg)] rounded-lg p-6 max-w-md w-full shadow-[0_0_2px_var(--glow-color)]"
      >
        <div className="flex justify-between items-center mb-4">
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl font-semibold text-[var(--foreground)]"
          >
            {showNewCategoryForm
              ? "Створити нову категорію"
              : "Перемістити товари"}
          </motion.h2>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCancel}
            className="text-[var(--foreground)] hover:text-[var(--accent)] transition-colors"
          >
            <X className="w-6 h-6" />
          </motion.button>
        </div>

        <AnimatePresence mode="wait">
          {!showNewCategoryForm ? (
            <motion.form
              key="move-form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)]">
                  Виберіть нову категорію для товарів
                </label>
                <motion.select
                  whileFocus={{ scale: 1.01 }}
                  required
                  className="mt-1 block w-full rounded-md border-[var(--border)] bg-[var(--input-bg)] text-[var(--foreground)] shadow-sm focus:border-[var(--accent)] focus:ring-[var(--accent)] transition-all duration-200"
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                >
                  <option value="">Виберіть категорію</option>
                  {categories
                    .filter((c) => c.id !== category.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </motion.select>
              </div>

              <div className="flex items-center justify-between">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setShowNewCategoryForm(true)}
                  className="text-sm text-white hover:text-[var(--accent)] transition-colors"
                >
                  + Створити нову категорію
                </motion.button>
              </div>

              <div className="flex justify-end space-x-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--hover)] rounded-md transition-colors"
                >
                  Скасувати
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={!selectedCategoryId}
                  className="px-4 py-2 text-sm font-medium text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Перемістити
                </motion.button>
              </div>
            </motion.form>
          ) : (
            <motion.form
              key="create-form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleCreateNewCategory}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)]">
                  Назва нової категорії
                </label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-[var(--border)] bg-[var(--input-bg)] text-[var(--foreground)] shadow-sm focus:border-[var(--accent)] focus:ring-[var(--accent)] transition-all duration-200"
                  value={newCategoryData.name}
                  onChange={(e) =>
                    setNewCategoryData({
                      ...newCategoryData,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)]">
                  Опис
                </label>
                <motion.textarea
                  whileFocus={{ scale: 1.01 }}
                  className="mt-1 block w-full rounded-md border-[var(--border)] bg-[var(--input-bg)] text-[var(--foreground)] shadow-sm focus:border-[var(--accent)] focus:ring-[var(--accent)] transition-all duration-200"
                  rows="3"
                  value={newCategoryData.description}
                  onChange={(e) =>
                    setNewCategoryData({
                      ...newCategoryData,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex justify-end space-x-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setShowNewCategoryForm(false)}
                  className="px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--hover)] rounded-md transition-colors"
                >
                  Назад
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] rounded-md transition-colors"
                >
                  Створити та перемістити товари
                </motion.button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default function CategoriesManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showMoveProductsModal, setShowMoveProductsModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
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
      const url = selectedCategory
        ? `/api/admin/categories?id=${selectedCategory.id}`
        : "/api/admin/categories";
      const method = selectedCategory ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save category");
      }

      fetchCategories();
      setShowForm(false);
      setSelectedCategory(null);
      toast.success(
        selectedCategory ? "Категорію оновлено" : "Категорію створено"
      );
    } catch (err) {
      console.error("Error saving category:", err);
      setError(err.message);
      toast.error(err.message || "Помилка при збереженні категорії");
    }
  };

  const handleDelete = async (category) => {
    try {
      const response = await fetch(`/api/admin/categories?id=${category.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        if (
          response.status === 400 &&
          data.error.includes("associated products")
        ) {
          setCategoryToDelete(category);
          setShowMoveProductsModal(true);
          return;
        }
        throw new Error(data.error || "Failed to delete category");
      }

      fetchCategories();
      toast.success("Категорію видалено");
    } catch (err) {
      console.error("Error deleting category:", err);
      setError(err.message);
      toast.error(err.message || "Помилка при видаленні категорії");
    }
  };

  const handleMoveProducts = async (newCategoryId) => {
    try {
      const response = await fetch(`/api/admin/categories/move-products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fromCategoryId: categoryToDelete.id,
          toCategoryId: parseInt(newCategoryId),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to move products");
      }

      // After moving products, delete the category
      await handleDelete(categoryToDelete);

      setShowMoveProductsModal(false);
      setCategoryToDelete(null);
      toast.success("Товари переміщено та категорію видалено");
    } catch (err) {
      console.error("Error moving products:", err);
      setError(err.message);
      toast.error(err.message || "Помилка при переміщенні товарів");
    }
  };

  if (error) {
    toast.error(error);
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[var(--foreground)]">
          Управління категоріями
        </h1>
        <button
          onClick={() => {
            setSelectedCategory(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-[var(--background)] rounded-md hover:bg-[var(--accent-hover)] transition-colors"
        >
          <Plus className="w-5 h-5" />
          Додати категорію
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-3">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setSelectedCategory(category);
                          setShowForm(true);
                        }}
                        className="text-[var(--background)] hover:text-[var(--accent)] transition-colors"
                      >
                        <Pencil className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(category)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {showForm && (
          <CategoryForm
            category={selectedCategory}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setSelectedCategory(null);
            }}
          />
        )}

        {showMoveProductsModal && categoryToDelete && (
          <MoveProductsModal
            category={categoryToDelete}
            categories={categories}
            onMove={handleMoveProducts}
            onCancel={() => {
              setShowMoveProductsModal(false);
              setCategoryToDelete(null);
            }}
            onCategoriesUpdate={fetchCategories}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
