"use client";

import AdminSidebar from "@/components/AdminSidebar";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header рендерится в MainLayout, не дублируем здесь */}
      
      {/* Main content with sidebar - padding-top для учета fixed хедера */}
      <div className="flex pt-[57px] md:pt-[120px]">
        <AdminSidebar />
        <motion.main
          key={pathname}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="flex-1 p-4 lg:p-8 overflow-auto"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
