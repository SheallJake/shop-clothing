"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import PageTransition from "@/components/PageTransition";
import { useCart } from "@/context/CartContext";

export default function OrderSuccessPage() {
  const router = useRouter();
  const { clearCart } = useCart();

  useEffect(() => {
    // Clear the cart immediately
    clearCart();

    // Redirect to orders page after 5 seconds
    const timeout = setTimeout(() => {
      router.push("/cabinet");
    }, 5000);

    return () => clearTimeout(timeout);
  }, [router, clearCart]);

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-black mb-2">
            Дякуємо за замовлення!
          </h1>
          <p className="text-gray-600 mb-4">
            Ваше замовлення успішно оформлено та оплачено.
          </p>
          <p className="text-sm text-gray-500">
            Ви будете перенаправлені на сторінку замовлень через 5 секунд...
          </p>
        </div>
      </div>
    </PageTransition>
  );
}
