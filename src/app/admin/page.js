"use client";

import {
  Package,
  ShoppingCart,
  MessageSquare,
  BarChart2,
  Tags,
} from "lucide-react";
import Link from "next/link";
import PageTransition from "@/components/PageTransition";

const DashboardCard = ({ title, icon: Icon, href, description }) => (
  <Link
    href={href}
    className="bg-[var(--card-bg)] p-6 rounded-lg shadow-[0_0_2px_var(--glow-color)] hover:shadow-[0_0_8px_var(--glow-color)] transition-all duration-300 hover:scale-[1.02]"
  >
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-xl font-semibold text-[var(--foreground)]">
        {title}
      </h3>
      <Icon className="w-8 h-8 text-[var(--accent)]" />
    </div>
    <p className="text-[var(--foreground)] opacity-70">{description}</p>
  </Link>
);

export default function AdminDashboard() {
  const dashboardItems = [
    {
      title: "Управління товарами",
      icon: Package,
      href: "/admin/products",
      description: "Додавання, редагування та видалення товарів",
    },
    {
      title: "Категорії",
      icon: Tags,
      href: "/admin/categories",
      description: "Управління категоріями товарів",
    },
    {
      title: "Замовлення",
      icon: ShoppingCart,
      href: "/admin/orders",
      description: "Перегляд та обробка замовлень",
    },
    {
      title: "Відгуки",
      icon: MessageSquare,
      href: "/admin/reviews",
      description: "Модерація відгуків користувачів",
    },
    {
      title: "Статистика",
      icon: BarChart2,
      href: "/admin/statistics",
      description: "Аналітика та звіти",
    },
    {
      title: "Чат",
      icon: MessageSquare,
      href: "/admin/chat",
      description: "Перегляд та обробка чатів",
    },
    {
      title: "Промокоди",
      icon: Tags,
      href: "/admin/promocodes",
      description: "Управління промокодами",
    },
  ];

  return (
    <PageTransition>
      <div>
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-8">
          Ласкаво просимо до панелі адміністратора
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardItems.map((item) => (
            <DashboardCard key={item.href} {...item} />
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
