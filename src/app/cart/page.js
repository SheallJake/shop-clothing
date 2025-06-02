"use client";
import { useEffect, useState } from "react";
import ImageWithFallback from "@/components/ImageWithFallback";
import PageTransition from "@/components/PageTransition";
import { toast } from "react-hot-toast";

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/session");
      const data = await res.json();
      setIsAuthenticated(!!data.user);

      if (data.user) {
        // Load cart from database for authenticated users
        const cartRes = await fetch("/api/cart");
        const cartData = await cartRes.json();
        setCart(
          cartData.map((item) => ({
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            image: item.product.image,
            quantity: item.quantity,
            category: item.product.category?.name || "Без категорії",
          }))
        );
      } else {
        // Load cart from localStorage for guests
        const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
        // Ensure category is a string for guest cart items
        const processedCart = storedCart.map((item) => ({
          ...item,
          category:
            typeof item.category === "object"
              ? item.category.name
              : item.category,
        }));
        setCart(processedCart);
      }
    } catch (error) {
      console.error("Error loading cart:", error);
      // Fallback to localStorage if there's an error
      const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
      const processedCart = storedCart.map((item) => ({
        ...item,
        category:
          typeof item.category === "object"
            ? item.category.name
            : item.category,
      }));
      setCart(processedCart);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      if (isAuthenticated) {
        // Remove from database for authenticated users
        const res = await fetch(`/api/cart?productId=${productId}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          throw new Error("Failed to remove item from cart");
        }
      }

      // Update local state
      const updatedCart = cart.filter((item) => item.id !== productId);
      setCart(updatedCart);

      // Update localStorage for guests
      if (!isAuthenticated) {
        localStorage.setItem("cart", JSON.stringify(updatedCart));
      }

      toast.success("Товар видалено з кошика");
    } catch (error) {
      console.error("Error removing from cart:", error);
      toast.error("Помилка при видаленні товару");
    }
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (isLoading) {
    return (
      <PageTransition>
        <div className="max-w-5xl mx-auto p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 border p-4 rounded">
                  <div className="w-32 h-32 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Кошик</h1>

        {cart.length === 0 ? (
          <p className="text-lg">Кошик порожній.</p>
        ) : (
          <>
            <div className="flex flex-col gap-4">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4 border p-4 rounded">
                  <ImageWithFallback
                    src={item.image}
                    alt={item.name}
                    className="w-32 h-32 object-cover rounded"
                  />
                  <div className="flex flex-col justify-between flex-1">
                    <div>
                      <h2 className="font-bold text-xl">{item.name}</h2>
                      <p className="text-sm text-gray-500">
                        {item.category || "Без категорії"}
                      </p>
                      <p className="mt-1">
                        {item.price} грн × {item.quantity} шт.
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 self-start mt-2"
                    >
                      Видалити
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-xl font-bold">Сума: {total} грн</div>

            <button className="mt-4 bg-black text-white py-3 rounded hover:bg-gray-800">
              Оформити замовлення
            </button>
          </>
        )}
      </div>
    </PageTransition>
  );
}
