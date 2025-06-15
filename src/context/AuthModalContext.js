"use client";
import { createContext, useContext, useState, useCallback } from "react";

const AuthModalContext = createContext();

export function AuthModalProvider({ children }) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  const openAuthModal = useCallback((mode = "login") => {
    setAuthMode(mode);
    setShowAuthModal(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setShowAuthModal(false);
    sessionStorage.removeItem("intendedDestination");
  }, []);

  return (
    <AuthModalContext.Provider
      value={{
        showAuthModal,
        authMode,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error("useAuthModal must be used within an AuthModalProvider");
  }
  return context;
}
