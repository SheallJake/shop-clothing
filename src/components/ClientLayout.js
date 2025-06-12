"use client";

import { AnimatePresence } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import AuthModal from "@/components/AuthModal";
import { useAuthModal } from "@/context/AuthModalContext";
import { useTheme } from "@/context/ThemeContext";
import Aurora from "@/components/Aurora";

export default function ClientLayout({ children }) {
  const { showAuthModal, authMode, closeAuthModal } = useAuthModal();
  const { theme } = useTheme();

  const auroraColors =
    theme === "light"
      ? ["#F2E9F0", "#F2E5D5", "#F2F0F0"] // Light theme: Alice Blue to Light Cyan
      : ["#4B0082", "#00CED1", "#4B0082"]; // Dark theme: Indigo to Dark Turquoise

  return (
    <AnimatePresence mode="wait">
      <PageTransition key="content">
        {/* <div style={{ transition: "none" }}>
          <Aurora
            colorStops={auroraColors}
            blend={0.5}
            amplitude={1.0}
            speed={0.5}
          />
        </div> */}
        {children}
        <AuthModal
          isOpen={showAuthModal}
          onClose={closeAuthModal}
          initialMode={authMode}
        />
      </PageTransition>
    </AnimatePresence>
  );
}
