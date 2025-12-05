"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import ImageWithFallback from "@/components/imageWithFallback";
import { BiPencil, BiCheck, BiX } from "react-icons/bi";
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

  const handleSaveProfile = async (e) => {
    if (e) {
      e.preventDefault();
    }
    try {
      // Валидация устанавливает ошибки сама и возвращает true/false
      if (!validateForm()) {
        // Если валидация не прошла, ошибки уже установлены validateForm()
        return;
      }
      
      // Валидация прошла успешно - выполняем запрос
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

      // Успешное обновление - очищаем ошибки только после успешного ответа
      setErrors({});
      setUser(data.user);
      setIsEditing(false);
      toast.success("Профіль успішно оновлено");
    } catch (err) {
      console.error("Помилка оновлення профілю:", err);
      toast.error(err.message || "Помилка при оновленні профілю");
      // В случае ошибки сети или другой ошибки, не трогаем ошибки валидации
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  if (loading) {
    return (
      <div className="loading-state">
        <p className="text-primary">Завантаження...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="empty-state">
        <p className="empty-message">Будь ласка, увійдіть до системи</p>
      </div>
    );
  }

  // Функция для получения классов бейджа статуса
  const getStatusBadgeClasses = (status) => {
    const statusLower = status?.toLowerCase() || "";
    if (statusLower.includes("pending") || statusLower.includes("очікує")) {
      return "badge-status badge-pending";
    }
    if (statusLower.includes("processing") || statusLower.includes("оброб")) {
      return "badge-status badge-processing";
    }
    if (statusLower.includes("shipped") || statusLower.includes("відправ")) {
      return "badge-status badge-shipped";
    }
    if (statusLower.includes("delivered") || statusLower.includes("достав")) {
      return "badge-status badge-delivered";
    }
    if (
      statusLower.includes("cancelled") ||
      statusLower.includes("скасова")
    ) {
      return "badge-status badge-cancelled";
    }
    return "badge-status";
  };

  return (
    <div className="container-main">
      {/* Заголовок сторінки */}
      <div className="page-section">
        <h1 className="heading-1 mb-2">Особистий кабінет</h1>
        <p className="text-muted text-sm md:text-base">
          Керуйте своїм профілем та переглядайте історію замовлень.
        </p>
      </div>

      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Profile Block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card shadow-card backdrop-blur-card rounded-3xl lg:col-span-2 relative"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6">
            <h2 className="heading-2">Профіль</h2>
            {!isEditing && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleEditClick}
                className="btn-primary w-full sm:w-auto"
              >
                <BiPencil size={16} />
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
                <label className="form-label">Ім'я</label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleInputChange}
                  className={`form-input ${errors.name ? "error" : ""}`}
                />
                {errors.name && (
                  <p className="form-error">{errors.name}</p>
                )}
              </div>
              <div>
                <label className="form-label">Телефон</label>
                <IMaskInput
                  mask={PHONE_MASK}
                  value={editForm.phoneNumber}
                  onAccept={(value) =>
                    handleInputChange({
                      target: { name: "phoneNumber", value },
                    })
                  }
                  className={`form-input ${
                    errors.phoneNumber ? "error" : ""
                  }`}
                />
                {errors.phoneNumber && (
                  <p className="form-error">{errors.phoneNumber}</p>
                )}
              </div>
              <div>
                <label className="form-label">Email</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="form-input bg-[var(--hover-bg)] text-muted"
                />
              </div>
              <div className="border-t pt-4 border-[var(--border)]">
                <h3
                  className="text-lg font-semibold mb-4"
                  style={{ color: "var(--text-primary)" }}
                >
                  Зміна паролю
                </h3>
                <div className="space-y-4">
                  <div>
                    <input
                      type="password"
                      name="currentPassword"
                      placeholder="Поточний пароль"
                      value={editForm.currentPassword}
                      onChange={handleInputChange}
                      className={`form-input ${
                        errors.currentPassword ? "error" : ""
                      }`}
                    />
                    {errors.currentPassword && (
                      <p className="form-error">
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
                      className={`form-input ${
                        errors.newPassword ? "error" : ""
                      }`}
                    />
                    {errors.newPassword && (
                      <p className="form-error">
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
                      className={`form-input ${
                        errors.confirmPassword ? "error" : ""
                      }`}
                    />
                    {errors.confirmPassword && (
                      <p className="form-error">
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
                  className="btn-success w-full sm:w-auto"
                >
                  <BiCheck size={16} />
                  Зберегти
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={handleCancelEdit}
                  className="btn-danger w-full sm:w-auto"
                >
                  <BiX size={16} />
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
              <p className="text-sm font-medium text-secondary mb-1">Ім'я:</p>
              <p className="text-primary">{user.name}</p>
              </div>
              <div>
              <p className="text-sm font-medium text-secondary mb-1">Email:</p>
              <p className="text-primary">{user.email}</p>
              </div>
              <div>
              <p className="text-sm font-medium text-secondary mb-1">
                Телефон:
              </p>
              <p className="text-primary">
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
          className="card shadow-card backdrop-blur-card rounded-3xl p-4 sm:p-6"
        >
          <h2 className="heading-2 mb-4">
            Мої замовлення
          </h2>
          {orders.length === 0 ? (
            <p className="text-muted">У вас поки немає замовлень</p>
          ) : (
            <div className="space-y-4 overflow-y-auto max-h-[50vh] sm:max-h-[70vh] pr-2">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="card-hover rounded-2xl border p-3 transition-all duration-200 shadow-card"
                  style={{
                    backgroundColor: "var(--hover-bg)",
                    borderColor: "var(--border)",
                  }}
                >
                  <div className="flex flex-col sm:flex-row justify-between mb-2 gap-2">
                    <div>
                      <p className="text-sm font-medium text-secondary">
                        #{order.id}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={getStatusBadgeClasses(order.status)}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                    <p className="font-semibold text-lg text-primary">
                      {order.totalPrice} грн
                    </p>
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
                          <p
                            className="text-sm truncate font-medium"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {item.product.name}
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: "var(--text-muted)" }}
                          >
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
