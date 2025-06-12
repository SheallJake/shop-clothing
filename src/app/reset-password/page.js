"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import PageTransition from "@/components/PageTransition";
import Spinner from "@/components/Spinner";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setIsValidToken(false);
      toast.error("Недійсне посилання для скидання паролю");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Паролі не співпадають");
      return;
    }

    if (password.length < 8) {
      toast.error("Пароль повинен містити щонайменше 8 символів");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Не вдалося скинути пароль");
      }

      toast.success("Пароль успішно змінено");
      router.push("/?auth=login");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidToken) {
    return (
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center bg-[var(--background)] py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full text-center">
            <h2 className="text-3xl font-extrabold text-[var(--foreground)] mb-4">
              Недійсне посилання
            </h2>
            <p className="text-[var(--foreground)] mb-4">
              Посилання для скидання паролю недійсне або закінчився термін його
              дії.
            </p>
            <button
              onClick={() => router.push("/forgot-password")}
              className="text-indigo-600 hover:text-indigo-500"
            >
              Запитати нове посилання
            </button>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-[var(--foreground)]">
              Встановлення нового паролю
            </h2>
            <p className="mt-2 text-center text-sm text-[var(--foreground)]">
              Введіть ваш новий пароль
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="password" className="sr-only">
                  Новий пароль
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-[var(--card-border)] placeholder-[var(--foreground)] text-[var(--foreground)] bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Новий пароль"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="sr-only">
                  Підтвердження паролю
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-[var(--card-border)] placeholder-[var(--foreground)] text-[var(--foreground)] bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Підтвердження паролю"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <Spinner size="sm" className="mr-3" />
                    Обробка...
                  </span>
                ) : (
                  "Змінити пароль"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageTransition>
  );
}
