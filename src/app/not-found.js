"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="container-main flex-center min-h-[60vh]">
      <div className="card shadow-card backdrop-blur-card rounded-3xl max-w-xl w-full text-center py-8 px-6 md:px-10">
        {/* Иллюстрация */}
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 mx-auto mb-6 rounded-2xl overflow-hidden border border-[var(--border)] shadow-card-hover">
          <Image
            src="/404.gif"
            alt="404 Animation"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Текст */}
        <h1 className="heading-1 text-5xl sm:text-6xl mb-2">404</h1>
        <h2 className="heading-2 mb-3">Сторінку не знайдено</h2>
        <p className="text-muted text-sm md:text-base mb-8">
          Вибачте, але сторінку, яку ви шукаєте, не знайдено. Можливо, вона була
          переміщена або видалена.
        </p>

        {/* Действия */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="#"
            onClick={(e) => {
              e.preventDefault();
              router.back();
            }}
            className="flex-1 sm:flex-none"
          >
            <button className="btn-secondary w-full">
              Повернутися назад
            </button>
          </Link>
          <Link href="/" className="flex-1 sm:flex-none">
            <button className="btn-primary w-full">
              На головну
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
