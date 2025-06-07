"use client";

import { ShoppingCart, Users, Star, Banknote } from "lucide-react";

const StatCard = ({ title, value, icon: Icon, trend }) => (
  <div className="bg-[var(--card-bg)] rounded-lg shadow-[0_0_2px_var(--glow-color)] p-6 hover:shadow-[0_0_8px_var(--glow-color)] transition-all duration-300">
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-[var(--accent)] bg-opacity-10 rounded-full">
        <Icon className="w-6 h-6 text-[var(--accent)]" />
      </div>
      {trend && (
        <span
          className={`text-sm ${trend > 0 ? "text-green-500" : "text-red-500"}`}
        >
          {trend > 0 ? "+" : ""}
          {trend}%
        </span>
      )}
    </div>
    <h3 className="text-[var(--foreground)] opacity-70 text-sm mb-2">
      {title}
    </h3>
    <p className="text-2xl font-bold text-[var(--foreground)]">{value}</p>
  </div>
);

export default function Statistics() {
  // Тут буде логіка для отримання статистичних даних
  const stats = {
    totalOrders: {
      value: "156",
      trend: 12,
    },
    totalCustomers: {
      value: "2,451",
      trend: 8,
    },
    averageRating: {
      value: "4.8",
      trend: 2,
    },
    revenue: {
      value: "₴125,000",
      trend: 15,
    },
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--foreground)]">
        Статистика
      </h1>

      {/* Статистичні картки */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Всього замовлень"
          value={stats.totalOrders.value}
          icon={ShoppingCart}
          trend={stats.totalOrders.trend}
        />
        <StatCard
          title="Клієнтів"
          value={stats.totalCustomers.value}
          icon={Users}
          trend={stats.totalCustomers.trend}
        />
        <StatCard
          title="Середня оцінка"
          value={stats.averageRating.value}
          icon={Star}
          trend={stats.averageRating.trend}
        />
        <StatCard
          title="Дохід"
          value={stats.revenue.value}
          icon={Banknote}
          trend={stats.revenue.trend}
        />
      </div>

      {/* Графіки та детальна статистика */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--card-bg)] rounded-lg shadow-[0_0_2px_var(--glow-color)] p-6">
          <h2 className="text-xl font-semibold mb-4 text-[var(--foreground)]">
            Графік продажів
          </h2>
          <div className="h-64 flex items-center justify-center text-[var(--foreground)] opacity-70">
            Тут буде графік продажів
          </div>
        </div>

        <div className="bg-[var(--card-bg)] rounded-lg shadow-[0_0_2px_var(--glow-color)] p-6">
          <h2 className="text-xl font-semibold mb-4 text-[var(--foreground)]">
            Популярні товари
          </h2>
          <div className="h-64 flex items-center justify-center text-[var(--foreground)] opacity-70">
            Тут буде список популярних товарів
          </div>
        </div>
      </div>
    </div>
  );
}
