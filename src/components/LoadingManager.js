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
    const handleError = (event) => {
      const error = event.error || event.reason || event;
      const isScriptError =
        error?.message === "Script error." || error?.message === "Script error";

      const errorContext = {
        filename: event.filename || error?.fileName || "Unknown file",
        lineno: event.lineno || error?.lineNumber || "Unknown line",
        colno: event.colno || error?.columnNumber || "Unknown column",
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
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

      console.error("[LoadingManager] Loading error:", errorDetails);
      console.error("[LoadingManager] Error context:", errorContext);

      setError(errorDetails);
      setIsLoading(false);
    };

    const handleUnhandledRejection = (event) => {
      console.error(
        "[LoadingManager] Unhandled promise rejection:",
        event.reason
      );
      handleError(event);
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
