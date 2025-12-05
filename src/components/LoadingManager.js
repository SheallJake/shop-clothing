"use client";

import { createContext, useContext, useState, useEffect } from "react";
import LoadingScreen from "./LoadingScreen";

const LoadingContext = createContext();

export function LoadingProvider({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Show loading screen briefly on initial page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Add error boundary
  useEffect(() => {
    let isHandlingError = false;

    const handleError = (event) => {
      // Предотвращаем рекурсивные вызовы
      if (isHandlingError) return;
      
      try {
        isHandlingError = true;

        const error = event.error || event.reason || event;
        const isScriptError =
          error?.message === "Script error." || error?.message === "Script error";

        const errorContext = {
          filename: event.filename || error?.fileName || "Unknown file",
          lineno: event.lineno || error?.lineNumber || "Unknown line",
          colno: event.colno || error?.columnNumber || "Unknown column",
          timestamp: new Date().toISOString(),
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "Unknown",
          url: typeof window !== "undefined" ? window.location.href : "Unknown",
        };

        const errorDetails = {
          message: isScriptError
            ? "Помилка завантаження скрипту. Перевірте підключення до інтернету та спробуйте оновити сторінку."
            : error?.message || event?.message || "Невідома помилка",
          stack: error?.stack || "Немає інформації про помилку",
          type: error?.type || event?.type || "Unknown error type",
          name: error?.name || event?.name || "Error",
          context: errorContext,
        };

        // Не логируем в консоль, чтобы избежать рекурсивных вызовов в Next.js
        setError(errorDetails);
        setIsLoading(false);
      } catch (err) {
        // Тихая обработка ошибок в обработчике ошибок
      } finally {
        isHandlingError = false;
      }
    };

    const handleUnhandledRejection = (event) => {
      // Предотвращаем рекурсивные вызовы
      if (isHandlingError) return;

      try {
        isHandlingError = true;

        // Создаем объект события, совместимый с handleError
        const errorEvent = {
          error: event.reason,
          reason: event.reason,
          message: event.reason?.message || "Unhandled promise rejection",
          type: "unhandledrejection",
        };
        handleError(errorEvent);
      } catch (err) {
        // Тихая обработка ошибок в обработчике ошибок
      } finally {
        isHandlingError = false;
      }
    };

    window.addEventListener("error", handleError, true);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError, true);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      );
    };
  }, []);

  const contextValue = {
    isLoading,
    setIsLoading,
    error,
  };

  return (
    <LoadingContext.Provider value={contextValue}>
      {isLoading ? <LoadingScreen /> : children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
}
