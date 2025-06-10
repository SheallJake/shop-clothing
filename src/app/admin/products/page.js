"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Plus, Pencil, Trash2, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

const ProductForm = ({ product, onSubmit, onCancel, categories }) => {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || "",
    stockQuantity: product?.stockQuantity || "",
    categoryId: product?.categoryId || "",
    color: product?.color || [],
    size: product?.size || "",
    brand: product?.brand || "",
    mainImage: product?.mainImage || "",
    galleryImages: product?.galleryImages || [],
    discountPrice: product?.discountPrice || "",
    isDiscountActive: product?.isDiscountActive || false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleColorChange = (e) => {
    const colors = e.target.value.split(",").map((color) => color.trim());
    setFormData({ ...formData, color: colors });
  };

  const handleGalleryImagesChange = (e) => {
    const images = e.target.value.split(",").map((img) => img.trim());
    setFormData({ ...formData, galleryImages: images });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-[var(--card-bg)] rounded-lg p-6 max-w-md w-full shadow-[0_0_2px_var(--glow-color)]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            {product ? "Редагувати товар" : "Новий товар"}
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)]">
                Ціна
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                className="mt-1 block w-full rounded-md border-[var(--border)] bg-[var(--input-bg)] text-[var(--foreground)] shadow-sm focus:border-[var(--accent)] focus:ring-[var(--accent)]"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)]">
                Кількість
              </label>
              <input
                type="number"
                required
                min="0"
                className="mt-1 block w-full rounded-md border-[var(--border)] bg-[var(--input-bg)] text-[var(--foreground)] shadow-sm focus:border-[var(--accent)] focus:ring-[var(--accent)]"
                value={formData.stockQuantity}
                onChange={(e) =>
                  setFormData({ ...formData, stockQuantity: e.target.value })
                }
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Кольори (через кому)
            </label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-[var(--border)] bg-[var(--input-bg)] text-[var(--foreground)] shadow-sm focus:border-[var(--accent)] focus:ring-[var(--accent)]"
              value={formData.color.join(", ")}
              onChange={handleColorChange}
              placeholder="Наприклад: червоний, синій, зелений"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Розмір
            </label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-[var(--border)] bg-[var(--input-bg)] text-[var(--foreground)] shadow-sm focus:border-[var(--accent)] focus:ring-[var(--accent)]"
              value={formData.size}
              onChange={(e) =>
                setFormData({ ...formData, size: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Бренд
            </label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-[var(--border)] bg-[var(--input-bg)] text-[var(--foreground)] shadow-sm focus:border-[var(--accent)] focus:ring-[var(--accent)]"
              value={formData.brand}
              onChange={(e) =>
                setFormData({ ...formData, brand: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Головне зображення (URL)
            </label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-[var(--border)] bg-[var(--input-bg)] text-[var(--foreground)] shadow-sm focus:border-[var(--accent)] focus:ring-[var(--accent)]"
              value={formData.mainImage}
              onChange={(e) =>
                setFormData({ ...formData, mainImage: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Галерея зображень (URL через кому)
            </label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-[var(--border)] bg-[var(--input-bg)] text-[var(--foreground)] shadow-sm focus:border-[var(--accent)] focus:ring-[var(--accent)]"
              value={formData.galleryImages.join(", ")}
              onChange={handleGalleryImagesChange}
              placeholder="Наприклад: url1, url2, url3"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)]">
                Ціна зі знижкою
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="mt-1 block w-full rounded-md border-[var(--border)] bg-[var(--input-bg)] text-[var(--foreground)] shadow-sm focus:border-[var(--accent)] focus:ring-[var(--accent)]"
                value={formData.discountPrice}
                onChange={(e) =>
                  setFormData({ ...formData, discountPrice: e.target.value })
                }
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-[var(--accent)] rounded border-[var(--border)]"
                checked={formData.isDiscountActive}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    isDiscountActive: e.target.checked,
                  })
                }
              />
              <label className="ml-2 text-sm text-[var(--foreground)]">
                Активна знижка
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Категорія
            </label>
            <select
              required
              className="mt-1 block w-full rounded-md border-[var(--border)] bg-[var(--input-bg)] text-[var(--foreground)] shadow-sm focus:border-[var(--accent)] focus:ring-[var(--accent)]"
              value={formData.categoryId}
              onChange={(e) =>
                setFormData({ ...formData, categoryId: e.target.value })
              }
            >
              <option value="">Виберіть категорію</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
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
              {product ? "Зберегти" : "Створити"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function ProductsManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const router = useRouter();
  const hasShownToast = useRef(false);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/categories");
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      const data = await response.json();
      setCategories(data.categories);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

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

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/products?query=${searchQuery}`);

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
      setProducts(data.products);
    } catch (err) {
      console.error("Error fetching products:", err);
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
    fetchProducts();
  }, [searchQuery]);

  const handleSubmit = async (formData) => {
    try {
      const method = editingProduct ? "PATCH" : "POST";
      const url =
        "/api/admin/products" +
        (editingProduct ? `?id=${editingProduct.id}` : "");

      console.log("Submitting product data:", formData);

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          ...(editingProduct && { id: editingProduct.id }),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Product submission error:", errorData);
        throw new Error(errorData.error || "Failed to save product");
      }

      const savedProduct = await response.json();
      console.log("Product saved successfully:", savedProduct);

      fetchProducts();
      setShowForm(false);
      setEditingProduct(null);
      toast.success(editingProduct ? "Товар оновлено" : "Товар створено");
    } catch (err) {
      console.error("Error saving product:", err);
      setError(err.message);
      toast.error(err.message || "Помилка при збереженні товару");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Ви впевнені, що хочете видалити цей товар?")) return;

    try {
      const response = await fetch(`/api/admin/products?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete product");

      fetchProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  if (error) {
    return <div className="text-red-500 text-center py-4">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Управління товарами
        </h1>
        <button
          onClick={() => {
            setEditingProduct(null);
            setShowForm(true);
          }}
          className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--background)] px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>Додати товар</span>
        </button>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Пошук товарів..."
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
                Назва
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--foreground)] opacity-70 uppercase tracking-wider">
                Категорія
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--foreground)] opacity-70 uppercase tracking-wider">
                Ціна
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--foreground)] opacity-70 uppercase tracking-wider">
                Кількість
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--foreground)] opacity-70 uppercase tracking-wider">
                Бренд
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--foreground)] opacity-70 uppercase tracking-wider">
                Знижка
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
                  colSpan="7"
                  className="px-6 py-4 text-center text-[var(--foreground)]"
                >
                  Завантаження...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="px-6 py-4 text-center text-[var(--foreground)]"
                >
                  Товари не знайдено
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-[var(--foreground)]">
                    <div className="flex items-center">
                      {product.mainImage && (
                        <img
                          src={product.mainImage}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded-md mr-3"
                        />
                      )}
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm opacity-70">
                          {product.color?.join(", ")}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[var(--foreground)]">
                    {product.category?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[var(--foreground)]">
                    <div>
                      <div>{product.price} грн</div>
                      {product.isDiscountActive && product.discountPrice && (
                        <div className="text-sm text-red-500">
                          {product.discountPrice} грн
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[var(--foreground)]">
                    {product.stockQuantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[var(--foreground)]">
                    {product.brand}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.isDiscountActive ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Активна
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        Неактивна
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingProduct(product);
                          setShowForm(true);
                        }}
                        className="text-[var(--accent)] hover:text-[var(--accent-hover)]"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
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
        <ProductForm
          product={editingProduct}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
          categories={categories}
        />
      )}
    </div>
  );
}
