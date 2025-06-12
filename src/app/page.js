"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import BannerSlider from "@/components/BannerSlider";
import CategoryGrid from "@/components/CategoryGrid";
import { useAuthModal } from "@/context/AuthModalContext";
import ProductCard from "@/components/ProductCard";
import Spinner from "@/components/Spinner";
import { Card } from "@/components/CardSwap";
import CardSwap from "@/components/CardSwap";
import Image from "next/image";

export default function HomePage() {
  const searchParams = useSearchParams();
  const { openAuthModal } = useAuthModal();
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
      try {
        setLoadingDiscounted(true);
        setErrorDiscounted(null);
        const response = await fetch("/api/products/discounted");
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

  return (
    <div className="relative min-h-screen">
      <div className="relative space-y-8">
        {/* <div className="mx-auto w-full">
          <BannerSlider />
        </div> */}

        {/* CardSwap section */}
        <div className="relative w-full h-96 overflow-hidden rounded-lg border border-[var(--card-border)] shadow-[0_0_2px_var(--glow-color)] p-4">
          <div className="flex items-center justify-between gap-8 h-full">
            <div className="flex-1 flex items-center">
              <h2 className="text-5xl font-bold mb-4">
                Починай{" "}
                <span className="text-purple-600 dark:text-purple-400">
                  купувати
                </span>{" "}
                прямо зараз!
              </h2>
            </div>
            <div
              className="flex-1"
              style={{
                height: "600px",
                position: "relative",
                marginTop: "200px",
              }}
            >
              <CardSwap
                cardDistance={60}
                verticalDistance={70}
                delay={5000}
                pauseOnHover={false}
              >
                <Card className="overflow-hidden">
                  <div className="relative w-full h-full">
                    <Image
                      src="/banners/banner1.png"
                      alt="Banner 1"
                      fill
                      className="object-cover rounded-lg"
                      priority
                    />
                  </div>
                </Card>
                <Card className="overflow-hidden">
                  <div className="relative w-full h-full">
                    <Image
                      src="/banners/banner2.png"
                      alt="Banner 2"
                      fill
                      className="object-cover rounded-lg"
                      priority
                    />
                  </div>
                </Card>
                <Card className="overflow-hidden">
                  <div className="relative w-full h-full">
                    <Image
                      src="/banners/banner3.png"
                      alt="Banner 3"
                      fill
                      className="object-cover rounded-lg"
                      priority
                    />
                  </div>
                </Card>
              </CardSwap>
            </div>
          </div>
        </div>

        {/* Spacing */}
        <div className="h-16"></div>

        <div className="mx-auto w-full">
          <CategoryGrid />
        </div>

        {/* Spacing */}
        <div className="h-16"></div>

        {/* Discounted Products Section */}
        <div>
          <h2 className="text-4xl font-bold mb-2 text-center text-[var(--foreground)]">
            Товари зі знижкою
          </h2>
          <p className="text-xl text-center text-zinc-600 dark:text-zinc-400 mb-8">
            стильні речі за вигідними цінами
          </p>
          <div className="rounded-lg shadow-[0_0_2px_var(--glow-color)] bg-gradient-to-br from-purple-500/20  to-green-500/20 dark:from-purple-500/20 dark:to-green-500/20 p-6">
            {loadingDiscounted ? (
              <div className="flex justify-center py-16">
                <Spinner size="md" />
              </div>
            ) : errorDiscounted ? (
              <div className="text-center py-16">
                <p className="text-zinc-600 dark:text-zinc-400 mb-6 text-lg">
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
              <div className="text-center py-16">
                <p className="text-zinc-600 dark:text-zinc-400 text-lg">
                  Немає товарів зі знижкою
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
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
