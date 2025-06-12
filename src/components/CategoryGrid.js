"use client";
import { useEffect, useState } from "react";
import ImageWithFallback from "@/components/ImageWithFallback";
import { useRouter } from "next/navigation";

export default function CategoryGrid() {
  const [categories, setCategories] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then(setCategories);
  }, []);

  const handleCategoryClick = (categoryName) => {
    router.push(`/products?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 rounded-lg shadow-[0_0_2px_var(--glow-color)] p-4">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => handleCategoryClick(cat.name)}
          className="group bg-[var(--card-bg)] dark:bg-black rounded-lg p-2 shadow-[0_0_2px_var(--glow-color)] relative hover:shadow-[0_0_8px_var(--glow-color)] transition-all duration-300"
        >
          <div className="relative w-full">
            <div className="relative aspect-[4/3] overflow-hidden rounded">
              <ImageWithFallback
                src={`/categories/${cat.name.toLowerCase()}.jpg`}
                alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300" />
            </div>
            <div className="mt-2">
              <h3 className="text-sm font-normal text-[var(--foreground)] group-hover:text-[var(--foreground)]/70 transition-colors">
                {cat.name}
              </h3>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
