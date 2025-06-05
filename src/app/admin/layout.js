"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Package,
  ShoppingCart,
  MessageSquare,
  BarChart2,
  Tags,
  Menu,
  X,
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
    title: "Статистика",
    icon: <BarChart2 className="w-5 h-5" />,
    href: "/admin/statistics",
  },
];

export default function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar toggle */}
      <button
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md lg:hidden"
        onClick={toggleSidebar}
      >
        {isSidebarOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 w-64 bg-white shadow-lg`}
      >
        <div className="h-full px-3 py-4">
          <h1 className="text-2xl font-bold mb-8 px-3 text-gray-800">
            Адмін панель
          </h1>
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {item.icon}
                  <span className="ml-3">{item.title}</span>
                </Link>
              );
            })}
          </nav>
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
