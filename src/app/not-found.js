"use client";

import Link from "next/link";
import PageTransition from "@/components/PageTransition";

export default function NotFound() {
  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-7xl md:text-9xl font-bold text-gray-800">
              404
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mt-4 mb-6">
              Сторінку не знайдено
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Вибачте, але сторінку, яку ви шукаєте, не знайдено. Можливо, вона
              була переміщена або видалена.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                На головну
              </Link>
              <Link
                href="/products"
                className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                До каталогу
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
