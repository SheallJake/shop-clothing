"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import CategoryGrid from "@/components/CategoryGrid";
import { useAuthModal } from "@/context/AuthModalContext";
import ProductCard from "@/components/ProductCard";
import Spinner from "@/components/Spinner";
import { Card } from "@/components/CardSwap";
import CardSwap from "@/components/CardSwap";
import Image from "next/image";
import { useLoading } from "@/components/LoadingManager";

export default function HomePage() {
  const searchParams = useSearchParams();
  const { openAuthModal } = useAuthModal();
  const { isLoading } = useLoading();
  const [discountedProducts, setDiscountedProducts] = useState([]);
  const [loadingDiscounted, setLoadingDiscounted] = useState(true);
  const [errorDiscounted, setErrorDiscounted] = useState(null);

  useEffect(() => {
    const auth = searchParams.get("auth");
    if (auth === "login" || auth === "register") {
      const currentAuth = sessionStorage.getItem("currentAuth");
      if (currentAuth !== auth) {
        sessionStorage.setItem("currentAuth", auth);
        openAuthModal(auth);
      }
    }
  }, [searchParams, openAuthModal]);

  useEffect(() => {
    const fetchDiscountedProducts = async () => {
      const apiUrl = "/api/products/discounted";
      try {
        setLoadingDiscounted(true);
        setErrorDiscounted(null);

        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch discounted products");
        }

        setDiscountedProducts(data);
      } catch (error) {
        console.error("[HomePage] Discounted Products Error:", error);
        setErrorDiscounted(
          error.message ||
            "Не вдалося завантажити товари зі знижкою. Спробуйте оновити сторінку."
        );
      } finally {
        setLoadingDiscounted(false);
      }
    };

    fetchDiscountedProducts();
  }, []);

  const handleImageLoad = (imageUrl) => {
    console.log(`Image loaded: ${imageUrl}`);
  };

  return (
    <div className="relative min-h-screen">
      <div className="relative space-y-16 px-4 md:px-6 lg:px-8 md:pt-8 pt-0">
        {/* CardSwap section */}
        <div className="relative w-full h-auto md:h-96 overflow-hidden rounded-lg border border-[var(--card-border)] shadow-[0_0_2px_var(--glow-color)] p-4 bg-gradient-to-br from-white/10 to-white/5 dark:bg-black">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-8 h-full min-h-[400px] md:min-h-0">
            <div className="flex-1 flex items-center justify-center text-center md:text-left order-2 md:order-1 w-full">
              <h2 className="text-2xl md:text-5xl font-bold mb-4">
                Починай{" "}
                <span className="text-purple-600 dark:text-purple-400">
                  купувати
                </span>{" "}
                прямо зараз!
              </h2>
            </div>
            <div className="flex-1 relative h-[250px] md:h-[600px] mt-8 md:mt-[200px] order-1 md:order-2 w-full flex items-center justify-center">
              <CardSwap
                cardDistance={60}
                verticalDistance={70}
                delay={5000}
                pauseOnHover={false}
              >
                {[1, 2, 3].map((num) => (
                  <Card key={num} className="overflow-hidden">
                    <div className="relative w-full h-full">
                      <Image
                        src={`/banners/banner${num}.png`}
                        alt={`Banner ${num}`}
                        fill
                        className="object-cover rounded-lg"
                        priority
                        onLoad={() =>
                          handleImageLoad(`/banners/banner${num}.png`)
                        }
                        onError={() =>
                          handleImageLoad(`/banners/banner${num}.png`)
                        }
                      />
                    </div>
                  </Card>
                ))}
              </CardSwap>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full -mt-8 md:-mt-16">
          <CategoryGrid />
        </div>

        {/* Discounted Products Section */}
        <div className="mb-8 md:mb-16">
          <h2 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4 text-center text-[var(--foreground)]">
            Товари зі знижкою
          </h2>
          <p className="text-lg md:text-xl text-center text-zinc-600 dark:text-zinc-400 mb-8 md:mb-16">
            стильні речі за вигідними цінами
          </p>
          <div className="rounded-lg shadow-[0_0_2px_var(--glow-color)] bg-gradient-to-br from-purple-500/20 to-green-500/20 dark:from-purple-500/20 dark:to-green-500/20 p-4 md:p-8">
            {loadingDiscounted ? (
              <div className="flex justify-center py-8 md:py-16">
                <Spinner size="md" />
              </div>
            ) : errorDiscounted ? (
              <div className="text-center py-8 md:py-16">
                <p className="text-zinc-600 dark:text-zinc-400 mb-4 md:mb-6 text-base md:text-lg">
                  {errorDiscounted}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 underline transition-colors"
                >
                  Спробувати ще раз
                </button>
              </div>
            ) : discountedProducts.length === 0 ? (
              <div className="text-center py-8 md:py-16">
                <p className="text-zinc-600 dark:text-zinc-400 text-base md:text-lg">
                  Немає товарів зі знижкою
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                {discountedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="transform transition-transform hover:scale-105"
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
