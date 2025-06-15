import Link from "next/link";
import prisma from "@/lib/prisma";

export default async function CategoryGrid() {
  // Define gradient combinations
  const gradientCombinations = [
    "from-purple-600 to-green-600 dark:from-purple-600 dark:to-green-600",
    "from-blue-600 to-pink-600 dark:from-blue-600 dark:to-pink-600",
    "from-orange-600 to-purple-600 dark:from-orange-600 dark:to-purple-600",
    "from-green-600 to-blue-600 dark:from-green-600 dark:to-blue-600",
    "from-pink-600 to-orange-600 dark:from-pink-600 dark:to-orange-600",
  ];

  // Fetch categories directly from the database
  const categories = await prisma.category.findMany();

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
            <Link
              key={cat.id}
              href={`/products?category=${encodeURIComponent(cat.name)}`}
              className={`group bg-gradient-to-br ${gradientClass} rounded-lg p-8 shadow-[0_0_2px_var(--glow-color)] relative hover:shadow-[0_0_8px_var(--glow-color)] transition-all duration-300 flex items-center justify-center bg-black min-h-[200px]`}
            >
              <h3 className="text-xl font-medium text-white group-hover:text-white/70 transition-colors">
                {cat.name}
              </h3>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
