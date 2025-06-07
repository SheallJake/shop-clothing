"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Package,
  ShoppingCart,
  MessageSquare,
  BarChart2,
  Tags,
  Menu,
  X,
  ArrowLeft,
  MessagesSquare,
} from "lucide-react";

const menuItems = [
  {
    title: "Товари",
    icon: <Package className="w-5 h-5" />,
    href: "/admin/products",
  },
  {
    title: "Категорії",
    icon: <Tags className="w-5 h-5" />,
    href: "/admin/categories",
  },
  {
    title: "Замовлення",
    icon: <ShoppingCart className="w-5 h-5" />,
    href: "/admin/orders",
  },
  {
    title: "Відгуки",
    icon: <MessageSquare className="w-5 h-5" />,
    href: "/admin/reviews",
  },
  {
    title: "Промокоди",
    icon: <Tags className="w-5 h-5" />,
    href: "/admin/promocodes",
  },
  {
    title: "Статистика",
    icon: <BarChart2 className="w-5 h-5" />,
    href: "/admin/statistics",
  },
  {
    title: "Чати",
    icon: <MessagesSquare className="w-5 h-5" />,
    href: "/admin/chat",
  },
];

export default function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const isNotAdminHome = pathname !== "/admin";

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Mobile sidebar toggle */}
      <button
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-[var(--card-bg)] shadow-[0_0_2px_var(--glow-color)] lg:hidden"
        onClick={toggleSidebar}
      >
        {isSidebarOpen ? (
          <X className="w-6 h-6 text-[var(--foreground)]" />
        ) : (
          <Menu className="w-6 h-6 text-[var(--foreground)]" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 w-64 bg-[var(--card-bg)] shadow-[0_0_2px_var(--glow-color)]`}
      >
        <div className="h-full px-3 py-4 flex flex-col">
          <div>
            <h1 className="text-2xl font-bold mb-8 px-3 text-[var(--foreground)]">
              Адмін панель
            </h1>
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center px-3 py-2 rounded-lg transition-all duration-300 ${
                      isActive
                        ? "bg-[var(--accent)] text-[var(--background)] shadow-[0_0_2px_var(--glow-color)]"
                        : "text-[var(--foreground)] hover:bg-[var(--hover-bg)] hover:scale-[1.02]"
                    }`}
                  >
                    {item.icon}
                    <span className="ml-3">{item.title}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Back button moved to bottom */}
          {isNotAdminHome && (
            <button
              onClick={() => router.push("/admin")}
              className="mt-auto mb-4 text-[var(--foreground)] p-3 rounded-lg bg-[var(--card-bg)] shadow-[0_0_2px_var(--glow-color)] flex items-center gap-2 hover:bg-[var(--hover-bg)] transition-all duration-300 hover:scale-[1.02]"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Назад до адмін-панелі</span>
            </button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main
        className={`transition-all ${
          isSidebarOpen ? "lg:ml-64" : ""
        } p-4 lg:p-8`}
      >
        {children}
      </main>
    </div>
  );
}
