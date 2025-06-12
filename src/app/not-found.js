"use client";

import { useTheme } from "@/context/ThemeContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function NotFound() {
  const { theme } = useTheme();
  const router = useRouter();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 animate-fadeIn">
      <div
        className="card p-8 max-w-md w-full mx-auto text-center border border-[var(--border)] animate-slideUp"
        style={{ backgroundImage: "var(--background)" }}
      >
        <div className="relative w-64 h-64 mx-auto mb-6 rounded-xl overflow-hidden border-2 border-[var(--border)] hover:scale-105 transition-transform duration-300 animate-float">
          <Image
            src="/404.gif"
            alt="404 Animation"
            fill
            className="object-cover"
            priority
          />
        </div>
        <h1 className="text-9xl font-bold mb-4 text-[var(--foreground)] animate-bounce">
          404
        </h1>
        <h2 className="text-2xl font-semibold mb-4 text-[var(--foreground)] animate-slideIn">
          Сторінку не знайдено
        </h2>
        <p className="text-[var(--muted)] mb-8 animate-fadeIn">
          Вибачте, але сторінку, яку ви шукаєте, не знайдено. Можливо, вона була
          переміщена або видалена.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="#"
            onClick={(e) => {
              e.preventDefault();
              router.back();
            }}
            className="flex-1 sm:flex-none"
          >
            <button className="btn w-full bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] transform hover:scale-105 transition-all duration-300 hover:shadow-lg">
              Повернутися назад
            </button>
          </Link>
          <Link href="/" className="flex-1 sm:flex-none">
            <button className="btn w-full bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--secondary-hover)] transform hover:scale-105 transition-all duration-300 hover:shadow-lg">
              На головну
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
