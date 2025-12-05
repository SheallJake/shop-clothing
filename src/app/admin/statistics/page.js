"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  BiShoppingBag,
  BiUser,
  BiStar,
  BiBank,
  BiBarChart,
  BiTrendingUp,
  BiPackage,
  BiHeart,
} from "react-icons/bi";

const StatCard = ({ title, value, icon: Icon, trend }) => (
  <div className="bg-[var(--card-bg)] rounded-lg shadow-[0_0_2px_var(--glow-color)] p-6 hover:shadow-[0_0_8px_var(--glow-color)] transition-all duration-300">
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 rounded-full">
        <Icon className="w-6 h-6 text-[var(--foreground)]" />
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

export default function StatisticsPage() {
  const [statistics, setStatistics] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalUsers: 0,
    recentOrders: [],
    topProducts: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const hasShownToast = useRef(false);

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch("/api/session");
      if (!res.ok) throw new Error("Session check failed");
      const data = await res.json();

      if (!data.user || data.user.role.toLowerCase() !== "admin") {
        if (!hasShownToast.current) {
          hasShownToast.current = true;
          toast.error("Доступ заборонено");
          router.push("/");
        }
        return;
      }
    } catch (err) {
      console.error("Помилка перевірки сесії:", err);
      if (!hasShownToast.current) {
        hasShownToast.current = true;
        toast.error("Помилка перевірки сесії");
        router.push("/");
      }
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const fetchStatistics = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/statistics");

      if (response.status === 401) {
        if (!hasShownToast.current) {
          hasShownToast.current = true;
          toast.error("Доступ заборонено");
          router.push("/");
        }
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }
      const data = await response.json();
      setStatistics(data);
    } catch (err) {
      console.error("Error fetching statistics:", err);
      setError(err.message);
      if (err.message.includes("Unauthorized")) {
        if (!hasShownToast.current) {
          hasShownToast.current = true;
          toast.error("Доступ заборонено");
          router.push("/");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  if (isLoading) {
    return <div className="text-center py-4">Завантаження...</div>;
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-4">Помилка: {error}</div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--foreground)]">
        Статистика
      </h1>

      {/* Статистичні картки */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Всього замовлень"
          value={(statistics.totalOrders ?? 0).toString()}
          icon={BiShoppingBag}
          trend={statistics.totalOrdersTrend}
        />
        <StatCard
          title="Клієнтів"
          value={(statistics.totalUsers ?? 0).toString()}
          icon={BiUser}
          trend={statistics.totalUsersTrend}
        />
        <StatCard
          title="Середня оцінка"
          value={(statistics.averageRating ?? 0).toString()}
          icon={BiStar}
          trend={statistics.averageRatingTrend}
        />
        <StatCard
          title="Дохід"
          value={(statistics.totalRevenue ?? 0).toString()}
          icon={BiBank}
          trend={statistics.totalRevenueTrend}
        />
      </div>

      {/* Графіки та детальна статистика */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--card-bg)] rounded-lg shadow-[0_0_2px_var(--glow-color)] p-6">
          <h2 className="text-xl font-semibold mb-4 text-[var(--foreground)] flex items-center gap-2">
            <BiBarChart className="w-5 h-5 text-[var(--foreground)]" />
            Графік продажів
          </h2>
          <div className="h-64 flex items-center justify-center text-[var(--foreground)] opacity-70">
            <BiTrendingUp className="w-12 h-12 text-[var(--foreground)] opacity-50" />
          </div>
        </div>

        <div className="bg-[var(--card-bg)] rounded-lg shadow-[0_0_2px_var(--glow-color)] p-6">
          <h2 className="text-xl font-semibold mb-4 text-[var(--foreground)] flex items-center gap-2">
            <BiPackage className="w-5 h-5 text-[var(--foreground)]" />
            Популярні товари
          </h2>
          <div className="h-64 flex items-center justify-center text-[var(--foreground)] opacity-70">
            <BiHeart className="w-12 h-12 text-[var(--foreground)] opacity-50" />
          </div>
        </div>
      </div>
    </div>
  );
}
