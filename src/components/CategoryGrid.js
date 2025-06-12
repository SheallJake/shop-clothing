"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Shirt,
  Dress,
  Shoe,
  Watch,
  Bag,
  Glasses,
  Scissors,
  Gift,
  Heart,
  Star,
} from "lucide-react";

export default function CategoryGrid() {
  const [categories, setCategories] = useState([]);
  const router = useRouter();

  // Define gradient combinations
  const gradientCombinations = [
    "from-purple-500/40 to-green-500/40 dark:from-purple-500/40 dark:to-green-500/40",
    "from-blue-500/40 to-pink-500/40 dark:from-blue-500/40 dark:to-pink-500/40",
    "from-orange-500/40 to-purple-500/40 dark:from-orange-500/40 dark:to-purple-500/40",
    "from-green-500/40 to-blue-500/40 dark:from-green-500/40 dark:to-blue-500/40",
    "from-pink-500/40 to-orange-500/40 dark:from-pink-500/40 dark:to-orange-500/40",
  ];

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then(setCategories);
  }, []);

  const handleCategoryClick = (categoryName) => {
    router.push(`/products?category=${encodeURIComponent(categoryName)}`);
  };

  // Map category names to icons
  const getCategoryIcon = (categoryName) => {
    const iconMap = {
      "Чоловічий одяг": Shirt,
      "Жіночий одяг": Dress,
      Взуття: Shoe,
      Аксесуари: Watch,
      Сумки: Bag,
      Окуляри: Glasses,
      Краватки: Scissors,
      Подарунки: Gift,
      "Спеціальні пропозиції": Heart,
      Новинки: Star,
    };

    return iconMap[categoryName] || Shirt; // Default to Shirt icon if no match
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-4xl font-bold mb-2 text-center text-[var(--foreground)]">
          Категорії
        </h2>
        <p className="text-xl text-center text-zinc-600 dark:text-zinc-400 mb-8">
          оберіть категорію товарів
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 rounded-lg shadow-[0_0_2px_var(--glow-color)] p-4">
        {categories.map((cat, index) => {
          const Icon = getCategoryIcon(cat.name);
          const gradientClass =
            gradientCombinations[index % gradientCombinations.length];
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.name)}
              className={`group bg-gradient-to-br ${gradientClass} rounded-lg p-4 shadow-[0_0_2px_var(--glow-color)] relative hover:shadow-[0_0_8px_var(--glow-color)] transition-all duration-300 flex items-center justify-center gap-2`}
            >
              <Icon className="w-6 h-6 text-[var(--foreground)] group-hover:text-[var(--foreground)]/70 transition-colors" />
              <h3 className="text-sm font-normal text-[var(--foreground)] group-hover:text-[var(--foreground)]/70 transition-colors">
                {cat.name}
              </h3>
            </button>
          );
        })}
      </div>
    </div>
  );
}
