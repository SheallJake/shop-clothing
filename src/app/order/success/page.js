"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageTransition from "@/components/PageTransition";
import { useCart } from "@/context/CartContext";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

export default function OrderSuccessPage() {
  const router = useRouter();
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [orderStatus, setOrderStatus] = useState(null);

  useEffect(() => {
    const checkOrderStatus = async () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const orderId = searchParams.get("orderId");

        if (!orderId) {
          toast.error("Не вдалося знайти інформацію про замовлення");
          router.push("/cabinet");
          return;
        }

        const response = await fetch(`/api/orders/${orderId}`);
        if (!response.ok) {
          throw new Error("Не вдалося отримати статус замовлення");
        }

        const data = await response.json();
        setOrderStatus(data.order?.payment?.paymentStatus);

        if (data.order?.payment?.paymentStatus === "Failed") {
          toast.error("Помилка при оплаті замовлення");
        } else if (!data.order?.payment?.paymentStatus) {
          toast.error("Статус оплати невідомий");
        }
      } catch (error) {
        console.error("Error checking order status:", error);
        toast.error("Помилка при перевірці статусу замовлення");
      } finally {
        setIsCheckingStatus(false);
      }
    };

    checkOrderStatus();

    const timeout = setTimeout(() => {
      router.push("/cabinet");
    }, 5000);

    return () => clearTimeout(timeout);
  }, [router]);

  const getStatusMessage = () => {
    if (isCheckingStatus) {
      return "Перевірка статусу замовлення...";
    }

    switch (orderStatus) {
      case "Paid":
        return "Ваше замовлення успішно оплачено!";
      case "Failed":
        return "Помилка при оплаті замовлення";
      default:
        return "Статус замовлення невідомий";
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  const iconVariants = {
    hidden: { scale: 0 },
    visible: {
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 10,
      },
    },
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="text-center p-8 rounded-2xl max-w-md w-full mx-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
              orderStatus === "Paid"
                ? "bg-zinc-100 dark:bg-zinc-800"
                : "bg-zinc-100 dark:bg-zinc-800"
            }`}
            variants={iconVariants}
          >
            <svg
              className={`w-10 h-10 ${
                orderStatus === "Paid"
                  ? "text-zinc-600 dark:text-zinc-300"
                  : "text-zinc-600 dark:text-zinc-300"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {orderStatus === "Paid" ? (
                <motion.path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                />
              ) : (
                <motion.path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                />
              )}
            </svg>
          </motion.div>

          <motion.h1
            className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-4"
            variants={itemVariants}
          >
            {orderStatus === "Paid"
              ? "Дякуємо за замовлення!"
              : "Статус замовлення"}
          </motion.h1>

          <motion.p
            className="text-lg text-zinc-600 dark:text-zinc-400 mb-6"
            variants={itemVariants}
          >
            {getStatusMessage()}
          </motion.p>

          <motion.div
            className="flex items-center justify-center space-x-2 text-sm text-zinc-500 dark:text-zinc-500"
            variants={itemVariants}
          >
            <motion.div
              className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-600"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <span>Перенаправлення на сторінку замовлень...</span>
          </motion.div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
