"use client";

import { motion } from "framer-motion";
import { useLoading } from "./LoadingManager";
import { useEffect, useState } from "react";

export default function LoadingScreen() {
  const { loadingStates } = useLoading();
  const [initialTotal, setInitialTotal] = useState(0);
  const [currentTotal, setCurrentTotal] = useState(0);

  useEffect(() => {
    const total = loadingStates.images.size + loadingStates.api.size;
    if (initialTotal === 0 && total > 0) {
      setInitialTotal(total);
    }
    setCurrentTotal(total);
  }, [loadingStates, initialTotal]);

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
