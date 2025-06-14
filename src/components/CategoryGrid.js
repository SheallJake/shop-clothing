"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CategoryGrid() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Define gradient combinations
  const gradientCombinations = [
    "from-purple-600 to-green-600 dark:from-purple-600 dark:to-green-600",
    "from-blue-600 to-pink-600 dark:from-blue-600 dark:to-pink-600",
    "from-orange-600 to-purple-600 dark:from-orange-600 dark:to-purple-600",
    "from-green-600 to-blue-600 dark:from-green-600 dark:to-blue-600",
    "from-pink-600 to-orange-600 dark:from-pink-600 dark:to-orange-600",
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      const apiUrl = "/api/categories";
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch categories");
        }

        setCategories(data);
      } catch (error) {
        console.error("[CategoryGrid] Error:", error);
        setError(
          error.message ||
            "Не вдалося завантажити категорії. Спробуйте оновити сторінку."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryName) => {
    router.push(`/products?category=${encodeURIComponent(categoryName)}`);
  };

  if (isLoading) {
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
          {[...Array(10)].map((_, index) => (
            <div
              key={index}
              className="bg-black rounded-lg p-4 shadow-[0_0_2px_var(--glow-color)] animate-pulse h-24"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-4xl font-bold mb-2 text-center text-[var(--foreground)]">
            Категорії
          </h2>
          <p className="text-xl text-center text-red-500 mb-8">
            Помилка завантаження категорій
          </p>
        </div>
      </div>
    );
  }

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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 rounded-lg shadow-[0_0_2px_var(--glow-color)] p-4">
        {categories.map((cat, index) => {
          const gradientClass =
            gradientCombinations[index % gradientCombinations.length];
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.name)}
              className={`group bg-gradient-to-br ${gradientClass} rounded-lg p-8 shadow-[0_0_2px_var(--glow-color)] relative hover:shadow-[0_0_8px_var(--glow-color)] transition-all duration-300 flex items-center justify-center bg-black min-h-[200px]`}
            >
              <h3 className="text-xl font-medium text-white group-hover:text-white/70 transition-colors">
                {cat.name}
              </h3>
            </button>
          );
        })}
      </div>
    </div>
  );
}
