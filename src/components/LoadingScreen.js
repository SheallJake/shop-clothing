"use client";

import { motion } from "framer-motion";
import { useLoading } from "./LoadingManager";

export default function LoadingScreen() {
  const { error } = useLoading();

  if (error) {
    const isScriptError = error.message.includes("скрипту");

    return (
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--card-bg)]"
      >
        <div className="text-center p-4 max-w-md mx-auto">
          <div className="text-red-500 mb-4">
            <svg
              className="w-12 h-12 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <p className="text-[var(--foreground)] mb-2 font-medium">
            {error.name || "Помилка завантаження"}
          </p>
          <p className="text-sm text-[var(--foreground-muted)] mb-4">
            {error.message}
          </p>
          {isScriptError && (
            <div className="mb-4 p-3 bg-[var(--card-bg)] rounded-md border border-[var(--card-border)]">
              <p className="text-sm text-[var(--foreground-muted)]">
                Спробуйте:
              </p>
              <ul className="text-sm text-[var(--foreground-muted)] list-disc list-inside mt-2">
                <li>Перевірити підключення до інтернету</li>
                <li>Очистити кеш браузера</li>
                <li>Спробувати інший браузер</li>
              </ul>
            </div>
          )}
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[var(--primary)] text-white rounded-md hover:bg-[var(--primary-hover)] transition-colors"
          >
            Оновити сторінку
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--card-bg)]"
    >
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[var(--card-border)] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-[var(--foreground)]">Завантаження...</p>
      </div>
    </motion.div>
  );
}
