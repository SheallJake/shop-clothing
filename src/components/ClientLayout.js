"use client";

import { AnimatePresence } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import AuthModal from "@/components/AuthModal";
import { useAuthModal } from "@/context/AuthModalContext";

export default function ClientLayout({ children }) {
  const { showAuthModal, authMode, closeAuthModal } = useAuthModal();

  return (
    <AnimatePresence mode="wait">
      <PageTransition key="content">
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
