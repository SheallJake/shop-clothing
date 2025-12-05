"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function MainLayout({ children }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  // Для админ-панели рендерим только Header, без Footer (AdminLayout обрабатывает остальное)
  if (isAdminRoute) {
    return (
      <div className="overflow-x-hidden w-full">
        <Header />
        {children}
      </div>
    );
  }

  // Для остальных страниц применяем зеленый дизайн
  return (
    <div className="overflow-x-hidden w-full">
      {/* Header */}
      <Header />

      {/* Main content with padding to account for fixed header */}
      <main className="flex-1 relative z-0 pt-[57px] md:pt-[120px] overflow-x-hidden">
        {children}
      </main>

      {/* Footer */}
      <div className="relative z-0">
        <Footer />
      </div>
    </div>
  );
}




