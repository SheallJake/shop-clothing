"use client";

import ProductCard from "@/components/ProductCard";
import Spinner from "@/components/Spinner";
import Banner from "@/components/Banner";
import CategoryButton from "@/components/CategoryButton";
import FAQ from "@/components/FAQ";
import { useState, useEffect, useRef } from "react";

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState("sneakers");
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // Массив баннеров с разными вариантами
  const banners = [
    { variant: "green" },  // Зелёный - стандартный цвет 1
    { variant: "blue" },   // Синий - свежий и современный
    { variant: "orange" }, // Оранжевый - тёплый и энергичный
    { variant: "gray" },   // Серый - минималистичный
  ];

  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayRef = useRef(null);
  const resumeAutoPlayTimeoutRef = useRef(null);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const bannerHeightRef = useRef(null);
  const [bannerHeight, setBannerHeight] = useState(null);

  // Определение мобильного устройства
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Измерение высоты баннера для правильного расчета контейнера
  useEffect(() => {
    if (!isMobile) {
      let heightTimeout = null;
      
      const updateHeight = () => {
        // Очищаем предыдущий timeout, если он существует
        if (heightTimeout) {
          clearTimeout(heightTimeout);
        }
        
        // Небольшая задержка для того, чтобы DOM успел обновиться
        heightTimeout = setTimeout(() => {
          if (bannerHeightRef.current) {
            const height = bannerHeightRef.current.offsetHeight;
            if (height && height > 0) {
              setBannerHeight(height);
            }
          }
          heightTimeout = null;
        }, 100);
      };
      
      updateHeight();
      window.addEventListener('resize', updateHeight);
      
      return () => {
        window.removeEventListener('resize', updateHeight);
        if (heightTimeout) {
          clearTimeout(heightTimeout);
        }
      };
    } else {
      setBannerHeight(null);
    }
  }, [currentBannerIndex, isMobile]);
  const handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  // Автоматическая прокрутка баннеров
  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayRef.current = setInterval(() => {
        setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
      }, 5000); // Прокрутка каждые 5 секунд
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, banners.length]);

  // Очистка timeout при размонтировании компонента
  useEffect(() => {
    return () => {
      if (resumeAutoPlayTimeoutRef.current) {
        clearTimeout(resumeAutoPlayTimeoutRef.current);
      }
    };
  }, []);

  // Навигация по баннерам
  const handlePrevBanner = () => {
    setIsAutoPlaying(false);
    setCurrentBannerIndex((prev) => (prev - 1 + banners.length) % banners.length);
    
    // Очищаем предыдущий timeout, если он существует
    if (resumeAutoPlayTimeoutRef.current) {
      clearTimeout(resumeAutoPlayTimeoutRef.current);
    }
    
    // Возобновить автопрокрутку через 10 секунд
    resumeAutoPlayTimeoutRef.current = setTimeout(() => {
      setIsAutoPlaying(true);
      resumeAutoPlayTimeoutRef.current = null;
    }, 10000);
  };

  const handleNextBanner = () => {
    setIsAutoPlaying(false);
    setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    
    // Очищаем предыдущий timeout, если он существует
    if (resumeAutoPlayTimeoutRef.current) {
      clearTimeout(resumeAutoPlayTimeoutRef.current);
    }
    
    // Возобновить автопрокрутку через 10 секунд
    resumeAutoPlayTimeoutRef.current = setTimeout(() => {
      setIsAutoPlaying(true);
      resumeAutoPlayTimeoutRef.current = null;
    }, 10000);
  };

  // Остановка автопрокрутки при наведении мыши
  const handleBannerMouseEnter = () => {
    setIsAutoPlaying(false);
  };

  const handleBannerMouseLeave = () => {
    setIsAutoPlaying(true);
  };

  // Обработка свайпов для мобильных устройств
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNextBanner();
    }
    if (isRightSwipe) {
      handlePrevBanner();
    }
  };

  useEffect(() => {
    async function fetchNewArrivals() {
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        const response = await fetch(`${baseUrl}/api/products/discounted`, {
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();
        setNewArrivals(data.slice(0, 3)); // Берем только первые 3 товара
      } catch (error) {
        console.error("[HomePage] Products Error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchNewArrivals();
  }, []);


  const categories = [
    { id: "sneakers", label: "Кросівки" },
    { id: "jackets", label: "Куртки" },
    { id: "tshirts", label: "Футболки" },
    { id: "forman", label: "Для чоловіків" },
  ];

  return (
    <div className="relative overflow-x-hidden">
      <div className="relative max-w-[1400px] mx-auto px-4 py-4 md:px-8 md:py-8">
          {/* Banners Carousel - Full Width */}
          <div 
            className="hero-carousel-wrapper"
            onMouseEnter={handleBannerMouseEnter}
            onMouseLeave={handleBannerMouseLeave}
            style={{ overflow: 'visible' }}
          >
            <div className="hero-carousel-inner" style={{ overflow: 'visible' }}>
              {/* Левая стрелка */}
              <button
                onClick={handlePrevBanner}
                className="absolute left-2 md:left-[15%] z-20 p-2 md:p-4 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white dark:hover:bg-zinc-700 active:bg-white/80 dark:active:bg-zinc-800/80 transition-all hover:scale-110 active:scale-95 touch-manipulation group"
                aria-label="Предыдущий баннер"
              >
                <svg
                  className="w-4 h-4 md:w-6 md:h-6 text-zinc-900 dark:text-white group-hover:-translate-x-0.5 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              {/* Контейнер баннеров */}
              <div className="hero-carousel-content" style={{ overflow: 'visible' }}>
                <div className="relative w-full overflow-visible pb-4 md:pb-0">
                  {/* Мобильная версия: только один активный баннер с поддержкой свайпов */}
                  <div 
                    className="block md:hidden w-full transition-all duration-700 ease-in-out touch-pan-y"
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                  >
                    <Banner variant={banners[currentBannerIndex].variant} />
                  </div>
                  
                  {/* Десктопная версия: несколько баннеров */}
                  <div className="hidden md:block relative w-full overflow-visible" style={{ minHeight: bannerHeight ? `${bannerHeight}px` : 'auto' }}>
                    {/* Скрытый спейсер для высоты - должен быть в нормальном потоке для правильного расчета высоты */}
                    <div 
                      ref={bannerHeightRef}
                      className="opacity-0 pointer-events-none select-none w-1/2" 
                      aria-hidden="true"
                      style={{ visibility: 'hidden', height: 'auto', marginBottom: 0 }}
                    >
                      <Banner variant={banners[currentBannerIndex].variant} />
                    </div>
                    
                    {/* Баннеры с абсолютным позиционированием */}
                    {[-1, 0, 1, 2, 3].map((offset) => {
                      const bannerIndex =
                        (currentBannerIndex + offset + banners.length) %
                        banners.length;
                      const isActive = offset === 0 || offset === 1;
                      const position = offset * 50; // Процентная позиция
                      
                      // Определяем z-index: активные баннеры выше
                      const zIndex = isActive ? 10 : 5;

                      return (
                        <div
                          key={offset}
                          className={`absolute top-0 w-1/2 transition-all duration-700 ease-in-out ${
                            !isActive ? "pointer-events-none" : ""
                          }`}
                          style={{
                            left: `calc(${position}% + ${offset * 12}px)`,
                            filter: !isActive ? "blur(3px) brightness(0.7)" : "blur(0)",
                            opacity: !isActive ? 0.5 : 1,
                            transform: !isActive ? "scale(0.92)" : "scale(1)",
                            zIndex: zIndex,
                          }}
                          tabIndex={isActive ? 0 : -1}
                        >
                          <Banner variant={banners[bannerIndex].variant} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Правая стрелка */}
              <button
                onClick={handleNextBanner}
                className="absolute right-2 md:right-[15%] z-20 p-2 md:p-4 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white dark:hover:bg-zinc-700 active:bg-white/80 dark:active:bg-zinc-800/80 transition-all hover:scale-110 active:scale-95 touch-manipulation group"
                aria-label="Следующий баннер"
              >
                <svg
                  className="w-4 h-4 md:w-6 md:h-6 text-zinc-900 dark:text-white group-hover:translate-x-0.5 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>

            {/* Индикаторы */}
            <div className="hero-carousel-indicators">
              {banners.map((_, index) => {
                // На мобильных показываем активным только текущий баннер
                const isActive = isMobile
                  ? index === currentBannerIndex
                  : index === currentBannerIndex || index === (currentBannerIndex + 1) % banners.length;
                
                return (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentBannerIndex(index);
                      setIsAutoPlaying(false);
                      
                      // Очищаем предыдущий timeout, если он существует
                      if (resumeAutoPlayTimeoutRef.current) {
                        clearTimeout(resumeAutoPlayTimeoutRef.current);
                      }
                      
                      // Возобновить автопрокрутку через 10 секунд
                      resumeAutoPlayTimeoutRef.current = setTimeout(() => {
                        setIsAutoPlaying(true);
                        resumeAutoPlayTimeoutRef.current = null;
                      }, 10000);
                    }}
                    className={`h-2 rounded-full transition-all duration-300 touch-manipulation ${
                      isActive
                        ? "w-8 bg-zinc-900 dark:bg-white"
                        : "w-2 bg-zinc-400 dark:bg-zinc-600 hover:bg-zinc-600 dark:hover:bg-zinc-400 active:bg-zinc-500 dark:active:bg-zinc-500"
                    }`}
                    aria-label={`Перейти к баннеру ${index + 1}`}
                  />
                );
              })}
            </div>
          </div>

          {/* Categories Section */}
          <div className="page-section">
            <div className="section-header">
              <h2 className="section-title">Категорії</h2>
              <button className="section-action-link">
                Переглянути всі
              </button>
            </div>
            <div className="flex gap-2 md:gap-4 flex-wrap">
              {categories.map((category) => (
                <CategoryButton
                  key={category.id}
                  label={category.label}
                  isActive={activeCategory === category.id}
                  onClick={() => setActiveCategory(category.id)}
                />
              ))}
            </div>
          </div>

          {/* New Arrivals Section */}
          <div className="page-section">
            <div className="section-header">
              <h2 className="section-title">Нові надходження</h2>
              <button className="section-action-link">
                Переглянути всі
              </button>
            </div>
            {loading ? (
              <div className="flex justify-center py-16">
                <Spinner size="md" />
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <p className="text-zinc-900 dark:text-white text-lg mb-4">
                  Не вдалося завантажити товари
                </p>
                <button
                  onClick={handleReload}
                  className="bg-zinc-800 dark:bg-zinc-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-zinc-700 dark:hover:bg-zinc-500 transition-colors uppercase"
                >
                  Спробувати знову
                </button>
              </div>
            ) : newArrivals.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-zinc-900 dark:text-white text-lg">Немає доступних товарів</p>
              </div>
            ) : (
              <div className="section-grid">
                {newArrivals.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>

      {/* Second Banner */}
      <div className="full-width-banner">
        <Banner variant="green" />
      </div>

      {/* FAQ Section */}
      <FAQ />
      </div>
    </div>
  );
}


