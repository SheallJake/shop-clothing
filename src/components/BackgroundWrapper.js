"use client";

import { usePathname } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { useState, useEffect } from "react";

export default function BackgroundWrapper({ children }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");
  const { theme } = useTheme();
  const [gradientPosition, setGradientPosition] = useState({ x: 50, y: 50 });
  const [gradientColor, setGradientColor] = useState(null);
  const [isGradientVisible, setIsGradientVisible] = useState(false);
  const [prevGradient, setPrevGradient] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Сброс состояния подсветки при изменении страницы
  useEffect(() => {
    setIsGradientVisible(false);
    setPrevGradient(null);
    setIsTransitioning(false);
  }, [pathname]);

  // Listen to custom events from Banner components
  useEffect(() => {
    const handleBannerHover = (e) => {
      const newColor = e.detail.color;
      const newPosition = { x: e.detail.x, y: e.detail.y };
      
      // Проверяем, изменился ли цвет (смена баннера)
      const colorChanged = gradientColor && (
        gradientColor.start !== newColor.start || 
        gradientColor.mid !== newColor.mid
      );
      
      // Сохраняем предыдущее состояние только при смене цвета
      if (colorChanged && isGradientVisible) {
        setPrevGradient({
          position: gradientPosition,
          color: gradientColor,
        });
        setIsTransitioning(true);
        
        // Убираем предыдущий градиент после завершения перехода
        setTimeout(() => {
          setPrevGradient(null);
          setIsTransitioning(false);
        }, 800);
      }
      
      // Обновляем позицию и цвет
      setGradientPosition(newPosition);
      setGradientColor(newColor);
      setIsGradientVisible(true);
    };

    const handleBannerLeave = () => {
      setIsGradientVisible(false);
      setPrevGradient(null);
      setIsTransitioning(false);
    };

    window.addEventListener("bannerHover", handleBannerHover);
    window.addEventListener("bannerLeave", handleBannerLeave);

    return () => {
      window.removeEventListener("bannerHover", handleBannerHover);
      window.removeEventListener("bannerLeave", handleBannerLeave);
    };
  }, [gradientColor, gradientPosition, isGradientVisible]);

  if (isAdminRoute) {
    return <div className="flex flex-col min-h-screen relative overflow-x-hidden w-full">{children}</div>;
  }

  const isDark = theme === "dark";
  const baseGradient = isDark
    ? "from-zinc-900 via-zinc-800 to-zinc-900"
    : "from-white via-zinc-50 to-zinc-100";
  
  const baseBg = isDark ? "bg-zinc-900" : "bg-white";

  return (
    <div className={`flex flex-col min-h-screen relative overflow-x-hidden w-full max-w-full ${baseBg}`}>
      {/* Base gradient background */}
      <div
        className={`fixed inset-0 bg-gradient-radial ${baseGradient} pointer-events-none z-0 transition-all duration-500`}
      />

      {/* Previous gradient - fading out during transition */}
      {prevGradient && prevGradient.color && (
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            background: `radial-gradient(circle 800px at ${prevGradient.position.x}% ${prevGradient.position.y}%, ${prevGradient.color.start} 0%, ${prevGradient.color.mid} 40%, transparent 70%)`,
            opacity: isTransitioning ? 0 : 0.7,
            transition: "opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
            willChange: "opacity",
          }}
        />
      )}
      
      {/* Current gradient - fading in */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: gradientColor
            ? `radial-gradient(circle 800px at ${gradientPosition.x}% ${gradientPosition.y}%, ${gradientColor.start} 0%, ${gradientColor.mid} 40%, transparent 70%)`
            : "transparent",
          opacity: isGradientVisible ? 0.7 : 0,
          transition: "opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
          willChange: "transform, opacity",
        }}
      />
      
      {/* Additional soft overlay for ambient glow */}
      {gradientColor && (
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            background: `radial-gradient(circle 1000px at ${gradientPosition.x}% ${gradientPosition.y}%, ${gradientColor.start} 0%, transparent 50%)`,
            opacity: isGradientVisible ? 0.25 : 0,
            transition: "opacity 1s cubic-bezier(0.4, 0, 0.2, 1)",
            willChange: "transform, opacity",
            filter: "blur(40px)",
          }}
        />
      )}

      {children}
    </div>
  );
}


