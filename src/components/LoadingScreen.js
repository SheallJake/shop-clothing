"use client";

import { motion } from "framer-motion";
import { useLoading } from "./LoadingManager";

export default function LoadingScreen() {
  const { loadingStates } = useLoading();
  const totalItems = loadingStates.images.size + loadingStates.api.size;
  const progress =
    totalItems > 0 ? Math.round((totalItems / (totalItems + 1)) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
    >
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-gray-300">Завантаження...</p>
        {totalItems > 0 && (
          <div className="mt-2 w-48 h-2 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-600"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}
