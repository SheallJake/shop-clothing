"use client";

import { useState } from "react";
import {
  Package,
  ShoppingCart,
  MessageSquare,
  BarChart2,
  Tags,
  ChevronLeft,
  ChevronRight,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";

const SidebarItem = ({ title, icon: Icon, href, isCollapsed }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-200 relative overflow-hidden group hover:bg-gradient-to-r hover:from-zinc-300 hover:to-zinc-200 dark:hover:from-zinc-800 dark:hover:to-zinc-700`}
    >
      <motion.div
        className={`absolute inset-0 ${
          isActive
            ? "bg-gradient-to-r from-zinc-700 to-zinc-800"
            : "bg-[var(--card-bg)] opacity-0 group-hover:opacity-100"
        }`}
        initial={false}
        animate={{ opacity: isActive ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      />
      <Icon
        className={`w-6 h-6 relative z-10 transition-transform duration-300 ${
          isActive
            ? "text-white"
            : "text-[var(--foreground)] group-hover:scale-110"
        }`}
      />
      {!isCollapsed && (
        <motion.span
          className={`relative z-10 ${
            isActive ? "text-white" : "text-[var(--foreground)]"
          }`}
          initial={false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {title}
        </motion.span>
      )}
    </Link>
  );
};

export default function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();

  const menuItems = [
    {
      title: "Товари",
      icon: Package,
      href: "/admin/products",
    },
    {
      title: "Категорії",
      icon: Tags,
      href: "/admin/categories",
    },
    {
      title: "Замовлення",
      icon: ShoppingCart,
      href: "/admin/orders",
    },
    {
      title: "Відгуки",
      icon: MessageSquare,
      href: "/admin/reviews",
    },
    {
      title: "Статистика",
      icon: BarChart2,
      href: "/admin/statistics",
    },
    {
      title: "Чат",
      icon: MessageSquare,
      href: "/admin/chat",
    },
    {
      title: "Промокоди",
      icon: Tags,
      href: "/admin/promocodes",
    },
  ];

  return (
    <div
      className={`bg-[var(--background)] border-r border-[var(--border)] h-screen sticky top-0 transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="p-4 flex items-center justify-between">
        {!isCollapsed && (
          <h2
            onClick={() => router.push("/admin")}
            className="text-xl font-bold text-[var(--foreground)] cursor-pointer transition-all duration-200 flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gradient-to-r hover:from-zinc-300 hover:to-zinc-200 dark:hover:from-zinc-800 dark:hover:to-zinc-700"
          >
            <span>Адмін панель</span>
          </h2>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gradient-to-r hover:from-zinc-300 hover:to-zinc-200 dark:hover:from-zinc-800 dark:hover:to-zinc-700 transition-all duration-200"
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 text-[var(--foreground)]" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-[var(--foreground)]" />
          )}
        </button>
      </div>
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <SidebarItem key={item.href} {...item} isCollapsed={isCollapsed} />
        ))}
      </nav>
    </div>
  );
}
