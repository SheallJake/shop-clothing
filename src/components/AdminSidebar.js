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
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const SidebarItem = ({ title, icon: Icon, href, isCollapsed }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-300 ${
        isActive
          ? "bg-[var(--accent)] text-white border-l-4 border-white"
          : "hover:bg-[var(--card-bg)] text-[var(--foreground)]"
      }`}
    >
      <Icon className="w-6 h-6" />
      {!isCollapsed && <span>{title}</span>}
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
            className="text-xl font-bold text-[var(--foreground)] cursor-pointer hover:text-[var(--accent)] transition-colors"
          >
            Адмін панель
          </h2>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-[var(--card-bg)] transition-colors"
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
