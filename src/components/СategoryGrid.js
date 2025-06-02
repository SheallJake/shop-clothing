'use client';
import { useEffect, useState } from 'react';
import ImageWithFallback from '@/components/ImageWithFallback';

export default function CategoryGrid() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(setCategories);
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
      {categories.map((cat) => (
        <div
          key={cat.id}
          className="text-center border border-dashed border-gray-400 rounded-lg p-2"
        >
          <ImageWithFallback
            src={`/categories/${cat.name.toLowerCase()}.jpg`}
            alt={cat.name}
            className="w-full h-40 object-cover rounded-md"
          />
          <p className="mt-2 font-semibold">{cat.name}</p>
        </div>
      ))}
    </div>
  );
}
