"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import PageTransition from "@/components/PageTransition";
import Spinner from "@/components/Spinner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Не вдалося обробити запит");
      }

      toast.success(
        "Якщо обліковий запис існує, ви отримаєте лист для скидання паролю"
      );
      setEmail("");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-[var(--foreground)]">
              Скидання паролю
            </h2>
            <p className="mt-2 text-center text-sm text-[var(--foreground)]">
              Введіть вашу email адресу, і ми надішлемо вам посилання для
              скидання паролю
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="sr-only">
                Email адреса
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-[var(--card-border)] placeholder-[var(--foreground)] text-[var(--foreground)] bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email адреса"
              />
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
                  "Надіслати посилання"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageTransition>
  );
}
