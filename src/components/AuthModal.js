"use client";
import { useEffect, useState, useCallback } from "react";
import { IMaskInput } from "react-imask";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

// Constants
const ANIMATION_DURATION = 300; // Duration in milliseconds
const MIN_PASSWORD_LENGTH = 8;
const PHONE_MASK = "+38 (000) 000-00-00";

const ERROR_MESSAGES = {
  PASSWORD_LENGTH: "Пароль повинен містити щонайменше 8 символів.",
  PASSWORD_CHARS: "Пароль може містити лише латинські букви та цифри.",
  PASSWORD_LETTER: "Пароль повинен містити хоча б одну латинську букву.",
  PASSWORD_MISMATCH: "Паролі не співпадають",
  INVALID_EMAIL: "Будь ласка, введіть коректну email адресу",
  REQUIRED_FIELD: "Це поле обов'язкове",
  SERVER_ERROR: "Помилка сервера. Спробуйте пізніше.",
};

const initialFormState = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  phoneNumber: "",
};

export default function AuthModal({
  isOpen,
  onClose,
  theme,
  initialMode = "login",
}) {
  // Modal state
  const [modalState, setModalState] = useState({
    visible: false,
    shouldRender: false,
    formVisible: true,
    mode: initialMode,
  });

  // Form state
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [wasManuallyClosed, setWasManuallyClosed] = useState(true);
  const router = useRouter();

  // Reset form when mode changes
  useEffect(() => {
    setModalState((prev) => ({ ...prev, mode: initialMode }));
    setFormData(initialFormState);
    setErrors({});
  }, [initialMode]);

  // Improved animation effect
  useEffect(() => {
    let timeoutId;

    if (isOpen) {
      // Show modal
      setModalState((prev) => ({ ...prev, shouldRender: true }));
      // Force a reflow
      document.body.offsetHeight;
      // Start animation
      timeoutId = setTimeout(() => {
        setModalState((prev) => ({ ...prev, visible: true }));
      }, 50);
      document.body.style.overflow = "hidden";
    } else {
      // Hide modal
      setModalState((prev) => ({ ...prev, visible: false }));
      document.body.style.overflow = "";
      // Wait for animation to complete before unmounting
      timeoutId = setTimeout(() => {
        setModalState((prev) => ({ ...prev, shouldRender: false }));
      }, ANIMATION_DURATION);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isOpen]);

  // Form validation
  const validateForm = useCallback(() => {
    const newErrors = {};
    const { email, password, confirmPassword, name, phoneNumber } = formData;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (modalState.mode === "register") {
      if (!name.trim()) newErrors.name = ERROR_MESSAGES.REQUIRED_FIELD;
      if (!phoneNumber.trim())
        newErrors.phoneNumber = ERROR_MESSAGES.REQUIRED_FIELD;

      if (!confirmPassword) {
        newErrors.confirmPassword = ERROR_MESSAGES.REQUIRED_FIELD;
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = ERROR_MESSAGES.PASSWORD_MISMATCH;
      }
    }

    if (!email.trim()) {
      newErrors.email = ERROR_MESSAGES.REQUIRED_FIELD;
    } else if (!emailRegex.test(email)) {
      newErrors.email = ERROR_MESSAGES.INVALID_EMAIL;
    }

    if (!password) {
      newErrors.password = ERROR_MESSAGES.REQUIRED_FIELD;
    } else {
      const allowedRegex = /^[A-Za-z0-9]+$/;
      const containsLetter = /[A-Za-z]/.test(password);

      if (password.length < MIN_PASSWORD_LENGTH) {
        newErrors.password = ERROR_MESSAGES.PASSWORD_LENGTH;
      } else if (!allowedRegex.test(password)) {
        newErrors.password = ERROR_MESSAGES.PASSWORD_CHARS;
      } else if (!containsLetter) {
        newErrors.password = ERROR_MESSAGES.PASSWORD_LETTER;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, modalState.mode]);

  // Handle mode switch
  const handleModeSwitch = useCallback((newMode) => {
    setModalState((prev) => ({ ...prev, formVisible: false }));
    setTimeout(() => {
      setModalState((prev) => ({ ...prev, mode: newMode, formVisible: true }));
      setFormData(initialFormState);
      setErrors({});
    }, 200);
  }, []);

  // Handle input change
  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setErrors({});
      setIsLoading(true);

      try {
        if (modalState.mode === "login") {
          const loginResponse = await fetch("/api/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: formData.email,
              password: formData.password,
            }),
          });

          const data = await loginResponse.json();

          if (!loginResponse.ok) {
            setErrors({ email: data.error });
            return;
          }

          toast.success("Успішний вхід!");
          onClose();
          setWasManuallyClosed(false);
          window.location.reload();
        } else {
          const registerResponse = await fetch("/api/register", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: formData.name,
              email: formData.email,
              password: formData.password,
              phoneNumber: formData.phoneNumber,
            }),
          });

          const data = await registerResponse.json();

          if (!registerResponse.ok) {
            throw new Error(data.message || "Помилка реєстрації");
          }

          // Automatically log in after successful registration
          const loginResponse = await fetch("/api/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: formData.email,
              password: formData.password,
            }),
          });

          if (!loginResponse.ok) {
            throw new Error("Помилка автоматичного входу");
          }

          // Store success message in sessionStorage to show after reload
          sessionStorage.setItem("registrationSuccess", "true");
          onClose();
          setWasManuallyClosed(false);
          window.location.reload();
        }
      } catch (err) {
        toast.error(err.message || ERROR_MESSAGES.SERVER_ERROR);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    },
    [modalState.mode, formData, onClose]
  );

  // Add useEffect to show success message after reload
  useEffect(() => {
    const showSuccessMessage = sessionStorage.getItem("registrationSuccess");
    if (showSuccessMessage) {
      toast.success("Реєстрація успішна!");
      sessionStorage.removeItem("registrationSuccess");
    }
  }, []);

  if (!modalState.shouldRender) return null;

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 transition-opacity duration-${ANIMATION_DURATION} ease-in-out ${
          modalState.visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      ></div>

      <div
        className={`fixed bottom-0 left-1/2 translate-x-[-50%] z-50 bg-[var(--card-bg)] rounded-t-lg shadow-lg p-8 w-full max-w-lg h-[80vh] flex flex-col justify-center transition-all duration-${ANIMATION_DURATION} ease-in-out ${
          modalState.visible
            ? "translate-y-0 opacity-100"
            : "translate-y-full opacity-0"
        }`}
      >
        <div className="text-center text-[var(--foreground)] mb-6 pb-6">
          <p className="text-5xl font-semibold mb-2">Вітання!</p>
          <p className="text-lg">
            Ласкаво просимо до <span className="font-bold">Крамничка</span>
          </p>
        </div>

        <h2
          className="text-2xl font-bold mb-6 text-center text-[var(--foreground)] transition-opacity duration-300"
          style={{ opacity: modalState.formVisible ? 1 : 0 }}
        >
          {modalState.mode === "register" ? "Реєстрація" : "Авторизація"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className={`text-[var(--foreground)] flex flex-col gap-4 transition-opacity duration-300 ${
            modalState.formVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          {modalState.mode === "register" && (
            <>
              <div>
                <input
                  className={`border border-[var(--card-border)] rounded px-4 py-3 w-full bg-[var(--background)] ${
                    errors.name ? "border-red-500" : ""
                  }`}
                  placeholder="Ім'я"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  disabled={isLoading}
                  required
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <IMaskInput
                  mask={PHONE_MASK}
                  value={formData.phoneNumber}
                  onAccept={(value) => handleInputChange("phoneNumber", value)}
                  placeholder="Телефон"
                  type="tel"
                  className={`border border-[var(--card-border)] rounded px-4 py-3 w-full bg-[var(--background)] ${
                    errors.phoneNumber ? "border-red-500" : ""
                  }`}
                  disabled={isLoading}
                  required
                />
                {errors.phoneNumber && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.phoneNumber}
                  </p>
                )}
              </div>
            </>
          )}

          <div>
            <input
              className={`border border-[var(--card-border)] rounded px-4 py-3 w-full bg-[var(--background)] ${
                errors.email ? "border-red-500" : ""
              }`}
              placeholder="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              disabled={isLoading}
              required
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div className="relative">
            <input
              className={`border border-[var(--card-border)] rounded px-4 py-3 pr-10 w-full bg-[var(--background)] ${
                errors.password ? "border-red-500" : ""
              }`}
              placeholder="Пароль"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              disabled={isLoading}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--foreground)] text-sm"
              disabled={isLoading}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {modalState.mode === "register" && (
            <div className="relative">
              <input
                className={`border border-[var(--card-border)] rounded px-4 py-3 pr-10 w-full bg-[var(--background)] ${
                  errors.confirmPassword ? "border-red-500" : ""
                }`}
                placeholder="Підтвердження паролю"
                type={showPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                disabled={isLoading}
                required
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          )}

          {modalState.mode === "login" && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  window.location.href = "/forgot-password";
                }}
                className="text-sm text-[var(--primary)] hover:text-[var(--primary-hover)]"
              >
                Забули пароль?
              </button>
            </div>
          )}

          <button
            className={`${
              theme === "light"
                ? "bg-zinc-800 hover:bg-zinc-700"
                : "bg-white hover:bg-zinc-100"
            } ${
              theme === "light" ? "text-white" : "text-zinc-800"
            } py-3 rounded-md transition-all duration-300 shadow-[0_0_2px_var(--glow-color)] hover:shadow-[0_0_8px_var(--glow-color)] hover:scale-[1.02] active:scale-[0.98] ${
              isLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className={`animate-spin -ml-1 mr-3 h-5 w-5 ${
                    theme === "light" ? "text-white" : "text-zinc-800"
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Зачекайте...
              </span>
            ) : modalState.mode === "register" ? (
              "Зареєструватись"
            ) : (
              "Увійти"
            )}
          </button>
        </form>

        <button
          className={`mt-6 text-sm ${
            theme === "light"
              ? "text-zinc-800 hover:text-zinc-600"
              : "text-white hover:text-zinc-200"
          } transition-all duration-300 hover:scale-105 active:scale-95 ${
            isLoading ? "opacity-70 cursor-not-allowed" : ""
          }`}
          onClick={() =>
            handleModeSwitch(
              modalState.mode === "register" ? "login" : "register"
            )
          }
          disabled={isLoading}
        >
          {modalState.mode === "register"
            ? "Вже зареєстровані? Увійти"
            : "Ще не зареєстровані? Зареєструватись"}
        </button>
      </div>
    </>
  );
}
