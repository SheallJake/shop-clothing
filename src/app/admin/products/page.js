"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  BiPlus,
  BiPencil,
  BiTrash,
  BiSearch,
  BiX,
} from "react-icons/bi";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

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

  const [errors, setErrors] = useState({});
  const [modalState, setModalState] = useState({
    visible: true,
    shouldRender: true,
  });
  const [uploading, setUploading] = useState(false);

  const isValidUrl = (url) => {
    if (!url) return false;

    // Перевірка на локальний шлях до зображення
    if (url.startsWith("/img/")) return true;

    try {
      const urlObj = new URL(url);
      // Перевірка, чи це зображення (опціонально)
      const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
      const hasImageExtension = imageExtensions.some((ext) =>
        urlObj.pathname.toLowerCase().endsWith(ext)
      );

      // Якщо це не локальний шлях, перевіряємо розширення
      if (!url.startsWith("/") && !hasImageExtension) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Назва товару обов'язкова";
    } else if (formData.name.length > 100) {
      newErrors.name = "Назва товару не може перевищувати 100 символів";
    }

    // Description validation
    if (formData.description && formData.description.length > 1000) {
      newErrors.description = "Опис не може перевищувати 1000 символів";
    }

    // Price validation
    if (!formData.price || isNaN(formData.price) || formData.price <= 0) {
      newErrors.price = "Введіть коректну ціну";
    }

    // Stock quantity validation
    if (
      !formData.stockQuantity ||
      isNaN(formData.stockQuantity) ||
      formData.stockQuantity < 0
    ) {
      newErrors.stockQuantity = "Введіть коректну кількість товару";
    }

    // Category validation
    if (!formData.categoryId) {
      newErrors.categoryId = "Виберіть категорію";
    }

    // Color validation
    if (formData.color.length === 0) {
      newErrors.color = "Вкажіть хоча б один колір";
    }

    // Size validation
    if (!formData.size) {
      newErrors.size = "Вкажіть розмір";
    }

    // Brand validation
    if (!formData.brand) {
      newErrors.brand = "Вкажіть бренд";
    }

    // Main image validation
    if (!formData.mainImage) {
      newErrors.mainImage = "Додайте головне зображення";
    } else if (!isValidUrl(formData.mainImage)) {
      newErrors.mainImage =
        "Введіть коректний URL зображення або завантажте файл";
    }

    // Gallery images validation
    if (formData.galleryImages.length > 0) {
      const invalidUrls = formData.galleryImages.filter(
        (url) => !isValidUrl(url)
      );
      if (invalidUrls.length > 0) {
        newErrors.galleryImages = "Всі URL зображень мають бути коректними";
      }
    }

    // Discount price validation
    if (formData.isDiscountActive) {
      if (
        !formData.discountPrice ||
        isNaN(formData.discountPrice) ||
        formData.discountPrice <= 0
      ) {
        newErrors.discountPrice = "Введіть коректну ціну зі знижкою";
      } else if (
        parseFloat(formData.discountPrice) >= parseFloat(formData.price)
      ) {
        newErrors.discountPrice =
          "Ціна зі знижкою має бути меншою за звичайну ціну";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleColorChange = (e) => {
    const colors = e.target.value
      .split(",")
      .map((color) => color.trim())
      .filter(Boolean);
    setFormData({ ...formData, color: colors });
  };

  const handleFileUpload = async (file, isMainImage = false) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      const data = await response.json();

      if (isMainImage) {
        setFormData((prev) => ({ ...prev, mainImage: data.path }));
      } else {
        setFormData((prev) => ({
          ...prev,
          galleryImages: [...prev.galleryImages, data.path],
        }));
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file, true);
    }
  };

  const handleGalleryImagesChange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => handleFileUpload(file, false));
  };

  const removeGalleryImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, i) => i !== index),
    }));
  };

  const handleClose = () => {
    setModalState((prev) => ({ ...prev, visible: false }));
    setTimeout(() => {
      onCancel();
    }, 300); // Match with ANIMATION_DURATION
  };

  if (!modalState.shouldRender) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: modalState.visible ? 1 : 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center !p-0 !m-0 !pt-0"
      >
        <motion.div
          initial={{ opacity: 0, y: 5, scale: 0.98 }}
          animate={{
            opacity: modalState.visible ? 1 : 0,
            y: modalState.visible ? 0 : 5,
            scale: modalState.visible ? 1 : 0.98,
          }}
          exit={{ opacity: 0, y: 5, scale: 0.98 }}
          transition={{
            duration: 0.3,
            type: "spring",
            stiffness: 500,
            damping: 25,
            mass: 0.8,
          }}
          className="bg-[var(--card-bg)] rounded-lg p-6 max-w-md w-full shadow-[0_0_2px_var(--glow-color)] mt-24"
        >
          <div className="flex justify-between items-center mb-4">
            <motion.h2
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -5 }}
              transition={{ duration: 0.1 }}
              className="text-xl font-semibold text-[var(--foreground)]"
            >
              {product ? "Редагувати товар" : "Новий товар"}
            </motion.h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClose}
                className="text-[var(--foreground)]"
              >
                <BiX className="w-6 h-6" />
              </motion.button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 3 }}
              transition={{ duration: 0.1, delay: 0.05 }}
            >
              <label className="block text-sm font-medium text-[var(--foreground)]">
                Назва
              </label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                type="text"
                required
                className={`mt-1 block w-full rounded-md border-[var(--border)] bg-[var(--input-bg)] text-[var(--foreground)] shadow-sm focus:border-[var(--accent)] focus:ring-[var(--accent)] ${
                  errors.name ? "border-red-500" : ""
                }`}
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              {errors.name && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-sm text-red-500"
                >
                  {errors.name}
                </motion.p>
              )}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 3 }}
              transition={{ duration: 0.1, delay: 0.1 }}
            >
              <label className="block text-sm font-medium text-[var(--foreground)]">
                Опис
              </label>
              <textarea
                className={`mt-1 block w-full rounded-md border-[var(--border)] bg-[var(--input-bg)] text-[var(--foreground)] shadow-sm focus:border-[var(--accent)] focus:ring-[var(--accent)] ${
                  errors.description ? "border-red-500" : ""
                }`}
                rows="3"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.description}
                </p>
              )}
            </motion.div>
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 3 }}
                transition={{ duration: 0.1, delay: 0.2 }}
              >
                <label className="block text-sm font-medium text-[var(--foreground)]">
                  Ціна
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  className={`mt-1 block w-full rounded-md border-[var(--border)] bg-[var(--input-bg)] text-[var(--foreground)] shadow-sm focus:border-[var(--accent)] focus:ring-[var(--accent)] ${
                    errors.price ? "border-red-500" : ""
                  }`}
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-500">{errors.price}</p>
                )}
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 3 }}
                transition={{ duration: 0.1, delay: 0.3 }}
              >
                <label className="block text-sm font-medium text-[var(--foreground)]">
                  Кількість
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  className={`mt-1 block w-full rounded-md border-[var(--border)] bg-[var(--input-bg)] text-[var(--foreground)] shadow-sm focus:border-[var(--accent)] focus:ring-[var(--accent)] ${
                    errors.stockQuantity ? "border-red-500" : ""
                  }`}
                  value={formData.stockQuantity}
                  onChange={(e) =>
                    setFormData({ ...formData, stockQuantity: e.target.value })
                  }
                />
                {errors.stockQuantity && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.stockQuantity}
                  </p>
                )}
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 3 }}
              transition={{ duration: 0.1, delay: 0.4 }}
            >
              <label className="block text-sm font-medium text-[var(--foreground)]">
                Кольори (через кому)
              </label>
              <input
                type="text"
                className={`mt-1 block w-full rounded-md border-[var(--border)] bg-[var(--input-bg)] text-[var(--foreground)] shadow-sm focus:border-[var(--accent)] focus:ring-[var(--accent)] ${
                  errors.color ? "border-red-500" : ""
                }`}
                value={formData.color.join(", ")}
                onChange={handleColorChange}
                placeholder="Наприклад: червоний, синій, зелений"
              />
              {errors.color && (
                <p className="mt-1 text-sm text-red-500">{errors.color}</p>
              )}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 3 }}
              transition={{ duration: 0.1, delay: 0.5 }}
            >
              <label className="block text-sm font-medium text-[var(--foreground)]">
                Розмір
              </label>
              <input
                type="text"
                className={`mt-1 block w-full rounded-md border-[var(--border)] bg-[var(--input-bg)] text-[var(--foreground)] shadow-sm focus:border-[var(--accent)] focus:ring-[var(--accent)] ${
                  errors.size ? "border-red-500" : ""
                }`}
                value={formData.size}
                onChange={(e) =>
                  setFormData({ ...formData, size: e.target.value })
                }
              />
              {errors.size && (
                <p className="mt-1 text-sm text-red-500">{errors.size}</p>
              )}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 3 }}
              transition={{ duration: 0.1, delay: 0.6 }}
            >
              <label className="block text-sm font-medium text-[var(--foreground)]">
                Бренд
              </label>
              <input
                type="text"
                className={`mt-1 block w-full rounded-md border-[var(--border)] bg-[var(--input-bg)] text-[var(--foreground)] shadow-sm focus:border-[var(--accent)] focus:ring-[var(--accent)] ${
                  errors.brand ? "border-red-500" : ""
                }`}
                value={formData.brand}
                onChange={(e) =>
                  setFormData({ ...formData, brand: e.target.value })
                }
              />
              {errors.brand && (
                <p className="mt-1 text-sm text-red-500">{errors.brand}</p>
              )}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 3 }}
              transition={{ duration: 0.1, delay: 0.7 }}
            >
              <label className="block text-sm font-medium text-[var(--foreground)]">
                Головне зображення
              </label>
              <div className="mt-1 flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleMainImageChange}
                  className="block w-full text-sm text-[var(--foreground)] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[var(--accent)] file:text-[var(--background)] hover:file:bg-[var(--accent-hover)]"
                />
                {formData.mainImage && (
                  <img
                    src={formData.mainImage}
                    alt="Main product"
                    className="w-16 h-16 object-cover rounded-md"
                  />
                )}
              </div>
              {errors.mainImage && (
                <p className="mt-1 text-sm text-red-500">{errors.mainImage}</p>
              )}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 3 }}
              transition={{ duration: 0.1, delay: 0.8 }}
            >
              <label className="block text-sm font-medium text-[var(--foreground)]">
                Галерея зображень
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleGalleryImagesChange}
                className="mt-1 block w-full text-sm text-[var(--foreground)] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[var(--accent)] file:text-[var(--background)] hover:file:bg-[var(--accent-hover)]"
              />
              <div className="mt-2 grid grid-cols-4 gap-2">
                {formData.galleryImages.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Gallery ${index + 1}`}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <BiX className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              {errors.galleryImages && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.galleryImages}
                </p>
              )}
            </motion.div>
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 3 }}
                transition={{ duration: 0.1, delay: 0.9 }}
              >
                <label className="block text-sm font-medium text-[var(--foreground)]">
                  Ціна зі знижкою
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={`mt-1 block w-full rounded-md border-[var(--border)] bg-[var(--input-bg)] text-[var(--foreground)] shadow-sm focus:border-[var(--accent)] focus:ring-[var(--accent)] ${
                    errors.discountPrice ? "border-red-500" : ""
                  }`}
                  value={formData.discountPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, discountPrice: e.target.value })
                  }
                />
                {errors.discountPrice && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.discountPrice}
                  </p>
                )}
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 3 }}
                transition={{ duration: 0.1, delay: 1 }}
                className="flex items-center"
              >
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
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 3 }}
              transition={{ duration: 0.1, delay: 1.1 }}
            >
              <label className="block text-sm font-medium text-[var(--foreground)]">
                Категорія
              </label>
              <select
                required
                className={`mt-1 block w-full rounded-md border-[var(--border)] bg-[var(--input-bg)] text-[var(--foreground)] shadow-sm focus:border-[var(--accent)] focus:ring-[var(--accent)] ${
                  errors.categoryId ? "border-red-500" : ""
                }`}
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
              {errors.categoryId && (
                <p className="mt-1 text-sm text-red-500">{errors.categoryId}</p>
              )}
            </motion.div>
            <div className="flex justify-end space-x-2 pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-[var(--border)] rounded-md text-[var(--foreground)] hover:bg-[var(--hover-bg)]"
              >
                Скасувати
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="px-4 py-2 bg-[var(--accent)] text-[var(--background)] rounded-md hover:bg-[var(--accent-hover)]"
              >
                {product ? "Зберегти" : "Створити"}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
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
        throw new Error(errorData.error || "Не вдалося зберегти товар");
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

      if (!response.ok) throw new Error("Не вдалося видалити товар");

      fetchProducts();
      toast.success("Товар видалено");
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Помилка при видаленні товару");
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
          Управління товарами
        </h1>
        <button
          onClick={() => {
            setEditingProduct(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-[var(--background)] rounded-md hover:bg-[var(--accent-hover)] transition-colors"
        >
          <BiPlus className="w-5 h-5" />
          Додати товар
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
        <BiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--foreground)] opacity-50 w-5 h-5" />
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
                    <div className="flex space-x-3">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setEditingProduct(product);
                          setShowForm(true);
                        }}
                        className="text-[var(--background)] hover:text-[var(--accent)] transition-colors"
                      >
                        <BiPencil className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(product.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <BiTrash className="w-5 h-5" />
                      </motion.button>
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
