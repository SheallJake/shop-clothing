"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import ImageWithFallback from "@/components/imageWithFallback";
import { Pencil, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { IMaskInput } from "react-imask";

// Constants
const PHONE_MASK = "+38 (000) 000-00-00";
const MIN_PASSWORD_LENGTH = 8;

export default function CabinetPage() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    phoneNumber: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
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
      setEditForm({
        name: data.user.name,
        phoneNumber: data.user.phoneNumber || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

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

  const handleEditClick = () => {
    setIsEditing(true);
    setErrors({});
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      name: user.name,
      phoneNumber: user.phoneNumber || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    if (!editForm.name.trim()) newErrors.name = "Ім'я обов'язкове";
    if (
      editForm.phoneNumber &&
      !/^\+38 \(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(editForm.phoneNumber)
    )
      newErrors.phoneNumber = "Невірний формат номеру телефону";

    // Password validation
    if (
      editForm.newPassword ||
      editForm.confirmPassword ||
      editForm.currentPassword
    ) {
      if (!editForm.currentPassword) {
        newErrors.currentPassword = "Введіть поточний пароль";
      }
      if (!editForm.newPassword) {
        newErrors.newPassword = "Введіть новий пароль";
      } else if (editForm.newPassword.length < MIN_PASSWORD_LENGTH) {
        newErrors.newPassword = "Пароль повинен містити мінімум 8 символів";
      } else if (!/^[A-Za-z0-9]+$/.test(editForm.newPassword)) {
        newErrors.newPassword =
          "Пароль може містити лише латинські букви та цифри";
      } else if (!/[A-Za-z]/.test(editForm.newPassword)) {
        newErrors.newPassword =
          "Пароль повинен містити хоча б одну латинську букву";
      }
      if (!editForm.confirmPassword) {
        newErrors.confirmPassword = "Підтвердіть новий пароль";
      } else if (editForm.newPassword !== editForm.confirmPassword) {
        newErrors.confirmPassword = "Паролі не співпадають";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    try {
      setErrors({});
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors);
          return;
        }
        throw new Error(data.error || "Не вдалося оновити профіль");
      }

      setUser(data.user);
      setIsEditing(false);
      toast.success("Профіль успішно оновлено");
    } catch (err) {
      console.error("Помилка оновлення профілю:", err);
      toast.error(err.message || "Помилка при оновленні профілю");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  if (loading) {
    return <div className="text-center py-4">Завантаження...</div>;
  }

  if (!user) {
    return (
      <div className="text-center py-4">Будь ласка, увійдіть до системи</div>
    );
  }

  return (
    <div className="flex justify-center items-start py-4 px-2 sm:py-6 sm:px-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Profile Block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-2 bg-white dark:bg-zinc-800 rounded-lg shadow p-4 sm:p-6 border border-zinc-200 dark:border-zinc-700 relative"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
              Особистий кабінет
            </h1>
            {!isEditing && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleEditClick}
                className="w-full sm:w-auto px-4 py-2 bg-zinc-800 hover:bg-zinc-900 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Pencil size={16} />
                Редагувати
              </motion.button>
            )}
          </div>

          {isEditing ? (
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSaveProfile}
              className="space-y-4"
            >
              <div>
                <label className="text-sm font-medium">Ім'я</label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    errors.name ? "border-red-500" : "border-zinc-300"
                  } bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white`}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Телефон</label>
                <IMaskInput
                  mask={PHONE_MASK}
                  value={editForm.phoneNumber}
                  onAccept={(value) =>
                    handleInputChange({
                      target: { name: "phoneNumber", value },
                    })
                  }
                  className={`w-full px-3 py-2 rounded-lg border ${
                    errors.phoneNumber ? "border-red-500" : "border-zinc-300"
                  } bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white`}
                />
                {errors.phoneNumber && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.phoneNumber}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                />
              </div>
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">Зміна паролю</h3>
                <div className="space-y-4">
                  <div>
                    <input
                      type="password"
                      name="currentPassword"
                      placeholder="Поточний пароль"
                      value={editForm.currentPassword}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        errors.currentPassword
                          ? "border-red-500"
                          : "border-zinc-300"
                      } bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white`}
                    />
                    {errors.currentPassword && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.currentPassword}
                      </p>
                    )}
                  </div>
                  <div>
                    <input
                      type="password"
                      name="newPassword"
                      placeholder="Новий пароль"
                      value={editForm.newPassword}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        errors.newPassword
                          ? "border-red-500"
                          : "border-zinc-300"
                      } bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white`}
                    />
                    {errors.newPassword && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.newPassword}
                      </p>
                    )}
                  </div>
                  <div>
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="Підтвердження паролю"
                      value={editForm.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        errors.confirmPassword
                          ? "border-red-500"
                          : "border-zinc-300"
                      } bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white`}
                    />
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <Check size={16} />
                  Зберегти
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={handleCancelEdit}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <X size={16} />
                  Скасувати
                </motion.button>
              </div>
            </motion.form>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div>
                <label className="font-medium text-zinc-700 dark:text-zinc-300">
                  Ім'я:
                </label>
                <p className="text-zinc-900 dark:text-white">{user.name}</p>
              </div>
              <div>
                <label className="font-medium text-zinc-700 dark:text-zinc-300">
                  Email:
                </label>
                <p className="text-zinc-900 dark:text-white">{user.email}</p>
              </div>
              <div>
                <label className="font-medium text-zinc-700 dark:text-zinc-300">
                  Телефон:
                </label>
                <p className="text-zinc-900 dark:text-white">
                  {user.phoneNumber || "Не вказано"}
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Orders Block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-zinc-800 rounded-lg shadow p-4 sm:p-6 border border-zinc-200 dark:border-zinc-700"
        >
          <h2 className="text-lg sm:text-xl font-bold mb-4 text-zinc-900 dark:text-white">
            Мої замовлення
          </h2>
          {orders.length === 0 ? (
            <p className="text-zinc-500">У вас поки немає замовлень</p>
          ) : (
            <div className="space-y-4 overflow-y-auto max-h-[50vh] sm:max-h-[70vh] pr-2">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="border p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900"
                >
                  <div className="flex flex-col sm:flex-row justify-between mb-2 gap-2">
                    <div>
                      <p className="text-sm text-zinc-500">#{order.id}</p>
                      <p className="text-sm text-zinc-500">
                        Статус: {order.status}
                      </p>
                    </div>
                    <p className="font-semibold">{order.totalPrice} грн</p>
                  </div>
                  <div className="space-y-2">
                    {order.orderItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-2">
                        <ImageWithFallback
                          src={item.product.mainImage}
                          alt={item.product.name}
                          className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">
                            {item.product.name}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {item.quantity} шт × {item.pricePerUnit} грн
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
