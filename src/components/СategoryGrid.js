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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 rounded-lg border border-white-500 p-4">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => handleCategoryClick(cat.name)}
          className="text-center border border-dashed border-gray-400 rounded-lg p-2 hover:border-black hover:shadow-md transition-all duration-200"
        >
          <ImageWithFallback
            src={`/categories/${cat.name.toLowerCase()}.jpg`}
            alt={cat.name}
            className="w-full h-40 object-cover rounded-md"
          />
          <p className="mt-2 font-semibold">{cat.name}</p>
        </button>
      ))}
    </div>
  );
}
