"use client";

import { ShoppingCart, Users, Star, Banknote } from "lucide-react";

const StatCard = ({ title, value, icon: Icon, trend }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-blue-100 rounded-full">
        <Icon className="w-6 h-6 text-blue-600" />
      </div>
      {trend && (
        <span
          className={`text-sm ${trend > 0 ? "text-green-600" : "text-red-600"}`}
        >
          {trend > 0 ? "+" : ""}
          {trend}%
        </span>
      )}
    </div>
    <h3 className="text-gray-600 text-sm mb-2">{title}</h3>
    <p className="text-2xl font-bold text-gray-800">{value}</p>
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
      <h1 className="text-2xl font-bold text-gray-800">Статистика</h1>

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

      {/* Тут можна додати графіки та більш детальну статистику */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Графік продажів</h2>
          <div className="h-64 flex items-center justify-center text-gray-500">
            Тут буде графік продажів
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Популярні товари</h2>
          <div className="h-64 flex items-center justify-center text-gray-500">
            Тут буде список популярних товарів
          </div>
        </div>
      </div>
    </div>
  );
}
