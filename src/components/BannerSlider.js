"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import ImageWithFallback from "@/components/ImageWithFallback";

const slides = [
  "/banners/banner1.jpg",
  "/banners/banner2.jpg",
  "/banners/banner3.jpg",
];

export default function BannerSlider() {
  const [index, setIndex] = useState(0);
  const timeoutRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const next = useCallback(() => {
    setIndex((prev) => (prev + 1) % slides.length);
  }, []);

  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true);
      return;
    }

    timeoutRef.current = setTimeout(next, 4000);
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [index, isInitialized, next]);

  const goToSlide = useCallback((i) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIndex(i);
  }, []);

  if (!isInitialized) {
    return null;
  }

  return (
    <div className="relative w-full h-96 overflow-hidden rounded-lg">
      <div
        className="flex transition-transform duration-700 h-full"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((src, i) => (
          <div key={i} className="min-w-full h-full relative">
            <ImageWithFallback
              src={src}
              alt={`Banner ${i + 1}`}
              className="absolute inset-0 w-full h-full object-cover"
              priority={i === 0}
            />
          </div>
        ))}
      </div>

      {/* Контролери */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`w-3 h-1 rounded-full ${
              index === i ? "bg-white" : "bg-gray-400"
            }`}
            onClick={() => goToSlide(i)}
          />
        ))}
      </div>
    </div>
  );
}
