"use client";

import Image from "next/image";
import { useRef, useEffect, useState } from "react";

export default function Banner({ 
  variant = "green",
  colors = null 
}) {
  const bannerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const animationFrameRef = useRef(null);
  
  // Default color schemes
  const defaultColors = {
    green: {
      textColor: "text-[#2F4F19]",
      buttonBg: "bg-[#C5E09B]",
      gradient: "bg-gradient-to-br from-[#A8D174] via-[#B8E184] to-[#C8F194]",
      gradientStart: "rgba(168, 209, 116, 0.8)",
      gradientMid: "rgba(168, 209, 116, 0.4)",
      circleColor1: "rgba(197, 224, 155, 0.8)",
      circleColor2: "rgba(168, 209, 116, 0.8)",
    },
    gray: {
      textColor: "text-white",
      buttonBg: "bg-[#A8A8A8]",
      gradient: "bg-gradient-to-br from-[#8B8B8B] via-[#9B9B9B] to-[#ABABAB]",
      gradientStart: "rgba(139, 139, 139, 0.8)",
      gradientMid: "rgba(139, 139, 139, 0.4)",
      circleColor1: "rgba(171, 171, 171, 0.8)",
      circleColor2: "rgba(139, 139, 139, 0.8)",
    },
    blue: {
      textColor: "text-[#1E3A5F]",
      buttonBg: "bg-[#A3C7E8]",
      gradient: "bg-gradient-to-br from-[#5B9BD5] via-[#7AB5E8] to-[#9ACFFF]",
      gradientStart: "rgba(91, 155, 213, 0.8)",
      gradientMid: "rgba(91, 155, 213, 0.4)",
      circleColor1: "rgba(163, 199, 232, 0.8)",
      circleColor2: "rgba(91, 155, 213, 0.8)",
    },
    orange: {
      textColor: "text-[#5C2E0D]",
      buttonBg: "bg-[#FFD4A3]",
      gradient: "bg-gradient-to-br from-[#FF9A56] via-[#FFB380] to-[#FFCC99]",
      gradientStart: "rgba(255, 154, 86, 0.8)",
      gradientMid: "rgba(255, 154, 86, 0.4)",
      circleColor1: "rgba(255, 212, 163, 0.8)",
      circleColor2: "rgba(255, 154, 86, 0.8)",
    },
  };

  // Use custom colors if provided, otherwise use defaults
  const activeColors = colors || defaultColors[variant];
  
  const textColor = activeColors.textColor;
  const buttonBg = activeColors.buttonBg;
  const animatedGradient = activeColors.gradient;
  
  const gradientColors = {
    start: activeColors.gradientStart,
    mid: activeColors.gradientMid,
  };

  // Функция для обновления позиции градиента
  const updateGradientPosition = () => {
    if (bannerRef.current && isHovered) {
      const rect = bannerRef.current.getBoundingClientRect();
      const x = ((rect.left + rect.width / 2) / window.innerWidth) * 100;
      const y = ((rect.top + rect.height / 2) / window.innerHeight) * 100;

      const event = new CustomEvent("bannerHover", {
        detail: {
          x,
          y,
          color: gradientColors,
        },
      });
      window.dispatchEvent(event);
    }
  };

  // Отслеживание позиции баннера при скролле и изменениях
  useEffect(() => {
    if (!isHovered) return;

    const updatePosition = () => {
      updateGradientPosition();
      animationFrameRef.current = requestAnimationFrame(updatePosition);
    };

    animationFrameRef.current = requestAnimationFrame(updatePosition);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isHovered, gradientColors]);

  // Очистка при размонтировании компонента
  useEffect(() => {
    return () => {
      // Отменяем анимацию
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      // Отправляем событие для скрытия подсветки
      const event = new CustomEvent("bannerLeave");
      window.dispatchEvent(event);
    };
  }, []);

  const handleMouseEnter = () => {
    setIsHovered(true);
    updateGradientPosition();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    const event = new CustomEvent("bannerLeave");
    window.dispatchEvent(event);
  };

  return (
    <div
      ref={bannerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`banner-gradient group relative rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 flex flex-col md:flex-row items-center justify-between overflow-hidden min-h-[250px] sm:min-h-[280px] md:min-h-[300px] transition-all duration-500 hover:shadow-2xl md:hover:scale-[1.02] active:scale-[0.98] cursor-pointer max-w-full ${animatedGradient}`}
    >
      {/* Animated shine overlay on hover - только на десктопе */}
      <div
        className="absolute inset-0 opacity-0 md:group-hover:opacity-100 transition-opacity duration-500 hidden md:block"
        style={{
          background:
            "linear-gradient(110deg, transparent 20%, rgba(255, 255, 255, 0.4) 50%, rgba(255, 255, 255, 0.6) 55%, transparent 80%)",
          backgroundSize: "200% 100%",
          animation: "shine 2.5s ease-in-out infinite",
        }}
      />

      {/* Animated circles with stronger glow */}
      <div className="absolute top-0 left-0 w-24 h-24 sm:w-32 sm:h-32 rounded-full opacity-20 sm:opacity-30 blur-xl sm:blur-2xl"
        style={{
          background: `radial-gradient(circle, ${activeColors.circleColor1}, transparent)`,
        }}
      />
      <div className="absolute bottom-0 right-0 w-32 h-32 sm:w-48 sm:h-48 rounded-full opacity-20 sm:opacity-30 blur-2xl sm:blur-3xl"
        style={{
          background: `radial-gradient(circle, ${activeColors.circleColor2}, transparent)`,
        }}
      />
      
      {/* Additional highlight on top */}
      <div 
        className="absolute top-0 left-1/4 w-full h-24 sm:h-32 opacity-15 sm:opacity-20 blur-2xl sm:blur-3xl"
        style={{
          background: "linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, transparent 100%)",
        }}
      />

      <div className="flex-1 z-10 relative w-full md:w-auto">
        <p className={`${textColor} mb-1 sm:mb-2 text-base sm:text-lg transition-all duration-300 md:group-hover:translate-x-1`}>
          Nike
        </p>
        <h2 className={`${textColor} mb-2 sm:mb-3 text-xl sm:text-2xl md:text-3xl font-bold transition-all duration-300 md:group-hover:translate-x-1 leading-tight`}>
          The Iconic White Classic
        </h2>
        <p className={`${textColor} text-xs sm:text-sm opacity-80 mb-4 sm:mb-6 max-w-md transition-all duration-300 md:group-hover:translate-x-1 leading-relaxed`}>
          Timeless. Clean. Perfect for any look — from casual to streetwear.
          Step up your style with the sneakers that never go out of fashion.
        </p>
        <button
          className={`${buttonBg} ${textColor} px-4 sm:px-6 py-2 sm:py-3 rounded-full uppercase text-xs sm:text-sm font-semibold hover:opacity-90 active:opacity-75 transition-all duration-300 md:hover:scale-105 hover:shadow-lg w-full sm:w-auto`}
        >
          20% OFF | buy now
        </button>
      </div>
      <div className="w-full md:w-80 h-48 sm:h-56 md:h-80 relative mt-4 md:mt-0 z-10 transition-transform duration-500 md:group-hover:scale-110 md:group-hover:rotate-3">
        <Image
          alt="Nike shoe"
          className="object-contain"
          src="/design-assets/ae0ede938e8107a59fc29c7400ae8defd39a13b9.png"
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 320px"
          priority
        />
      </div>

      <style jsx>{`
        @keyframes shine {
          0% {
            background-position: -200% 0;
          }
          50% {
            background-position: 0% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
}

