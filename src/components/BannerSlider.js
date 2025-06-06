"use client";
import { useState, useEffect, useRef } from "react";
import ImageWithFallback from "@/components/ImageWithFallback";

const slides = [
  "/banners/banner1.jpg",
  "/banners/banner2.jpg",
  "/banners/banner3.jpg",
];

export default function BannerSlider() {
  const [index, setIndex] = useState(0);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const next = () => setIndex((prev) => (prev + 1) % slides.length);
    timeoutRef.current = setTimeout(next, 4000);
    return () => clearTimeout(timeoutRef.current);
  }, [index]);

  const goToSlide = (i) => {
    clearTimeout(timeoutRef.current);
    setIndex(i);
  };

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
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
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
