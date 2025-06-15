"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuthModal } from "@/context/AuthModalContext";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const { openAuthModal } = useAuthModal();

  // Check authentication and load cart data
  useEffect(() => {
    const initializeCart = async () => {
      try {
        const response = await fetch("/api/session");
        const { user } = await response.json();
        setIsAuthenticated(!!user);

        if (user) {
          // If user is authenticated, load cart from DB
          const serverResponse = await fetch("/api/cart");
          if (serverResponse.ok) {
            const serverCart = await serverResponse.json();
            // Transform server cart data to match our format
            const normalizedCart = serverCart.map((item) => ({
              id: item.product.id,
              name: item.product.name || "Без назви",
              image: (() => {
                if (!item.product.mainImage) return "/placeholder.svg";
                try {
                  const url = String(item.product.mainImage);
                  if (
                    url.startsWith("/") ||
                    url.startsWith("http://") ||
                    url.startsWith("https://")
                  ) {
                    return url;
                  }
                  return `/img/${url}`;
                } catch (error) {
                  console.error("Invalid image URL:", item.product.mainImage);
                  return "/placeholder.svg";
                }
              })(),
              price: Number(item.product.price) || 0,
              quantity: Number(item.quantity) || 1,
              category: item.product.category || "Без категорії",
              selectedSize: item.selectedSize || null,
              selectedColor: item.selectedColor || null,
            }));
            setCart(normalizedCart);
            // Sync localStorage with DB data
            localStorage.setItem("cart", JSON.stringify(normalizedCart));
          } else if (serverResponse.status === 401) {
            setIsAuthenticated(false);
            toast.error("Ваш сеанс закінчився. Будь ласка, увійдіть знову.");
            openAuthModal("login");
          }
        } else {
          // If user is not authenticated, load from localStorage
          const savedCart = localStorage.getItem("cart");
          if (savedCart) {
            const parsedCart = JSON.parse(savedCart);
            const normalizedCart = parsedCart.map((item) => ({
              id: item.id,
              name: item.name || "Без назви",
              image: (() => {
                if (!item.image) return "/placeholder.svg";
                try {
                  const url = String(item.image);
                  if (
                    url.startsWith("/") ||
                    url.startsWith("http://") ||
                    url.startsWith("https://")
                  ) {
                    return url;
                  }
                  return `/img/${url}`;
                } catch (error) {
                  console.error("Invalid image URL:", item.image);
                  return "/placeholder.svg";
                }
              })(),
              price: Number(item.price) || 0,
              quantity: Number(item.quantity) || 1,
              category: item.category || "Без категорії",
              selectedSize: item.selectedSize || null,
              selectedColor: item.selectedColor || null,
            }));
            setCart(normalizedCart);
          }
        }
      } catch (error) {
        console.error("Error initializing cart:", error);
        // If there's an error, try to load from localStorage as fallback
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          setCart(JSON.parse(savedCart));
        }
      } finally {
        setIsInitialized(true);
      }
    };

    initializeCart();
  }, [router, openAuthModal]);

  // Save to localStorage when cart changes
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem("cart", JSON.stringify(cart));
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
    }
  }, [cart, isInitialized]);

  const addToCart = async (product, showToast = false) => {
    try {
      const transformedProduct = {
        id: product.id,
        name: product.name || "Без назви",
        image: (() => {
          if (!product.mainImage) return "/placeholder.svg";
          try {
            const url = String(product.mainImage);
            if (
              url.startsWith("/") ||
              url.startsWith("http://") ||
              url.startsWith("https://")
            ) {
              return url;
            }
            return `/img/${url}`;
          } catch (error) {
            console.error("Invalid image URL:", product.mainImage);
            return "/placeholder.svg";
          }
        })(),
        price: Number(product.price) || 0,
        quantity: 1,
        category:
          typeof product.category === "object"
            ? product.category.name
            : product.category || "Без категорії",
        selectedSize: null,
        selectedColor: null,
      };

      // For authenticated users, update server state
      const res = await fetch("/api/session");
      const data = await res.json();

      if (data.user) {
        const response = await fetch("/api/cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId: product.id,
            quantity: 1,
            selectedSize: null,
            selectedColor: null,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to add to cart");
        }

        // Get updated cart after adding item
        const cartResponse = await fetch("/api/cart");
        if (!cartResponse.ok) {
          throw new Error("Failed to fetch updated cart");
        }

        const serverCart = await cartResponse.json();

        if (!Array.isArray(serverCart)) {
          console.error("Invalid cart data received:", serverCart);
          throw new Error("Invalid cart data received from server");
        }

        const normalizedCart = serverCart.map((item) => ({
          id: item.product.id,
          name: item.product.name || "Без назви",
          image: (() => {
            if (!item.product.mainImage) return "/placeholder.svg";
            try {
              const url = String(item.product.mainImage);
              if (
                url.startsWith("/") ||
                url.startsWith("http://") ||
                url.startsWith("https://")
              ) {
                return url;
              }
              return `/img/${url}`;
            } catch (error) {
              console.error("Invalid image URL:", item.product.mainImage);
              return "/placeholder.svg";
            }
          })(),
          price: Number(item.product.price) || 0,
          quantity: Number(item.quantity) || 1,
          category: item.product.category || "Без категорії",
          selectedSize: null,
          selectedColor: null,
        }));
        setCart(normalizedCart);
      } else {
        // For non-authenticated users, update local state only
        setCart((prevCart) => {
          const existingItem = prevCart.find((item) => item.id === product.id);

          if (existingItem) {
            return prevCart.map((item) =>
              item.id === product.id
                ? { ...item, quantity: Number(item.quantity) + 1 }
                : item
            );
          }

          return [...prevCart, transformedProduct];
        });
      }

      if (showToast) {
        toast.success("Товар додано до кошика");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      if (showToast) {
        toast.error(error.message || "Не вдалося додати до кошика");
      }
    }
  };

  const removeFromCart = async (productId, showToast = false) => {
    try {
      const res = await fetch("/api/session");
      const data = await res.json();

      if (data.user) {
        const response = await fetch(`/api/cart?productId=${productId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to remove from cart");
        }

        // Get updated cart after removing item
        const cartResponse = await fetch("/api/cart");
        if (!cartResponse.ok) {
          throw new Error("Failed to fetch updated cart");
        }

        const serverCart = await cartResponse.json();
        const normalizedCart = serverCart.map((item) => ({
          id: item.product.id,
          name: item.product.name || "Без назви",
          image: (() => {
            if (!item.product.mainImage) return "/placeholder.svg";
            try {
              const url = String(item.product.mainImage);
              if (
                url.startsWith("/") ||
                url.startsWith("http://") ||
                url.startsWith("https://")
              ) {
                return url;
              }
              return `/img/${url}`;
            } catch (error) {
              console.error("Invalid image URL:", item.product.mainImage);
              return "/placeholder.svg";
            }
          })(),
          price: Number(item.product.price) || 0,
          quantity: Number(item.quantity) || 1,
          category: item.product.category || "Без категорії",
          selectedSize: null,
          selectedColor: null,
        }));
        setCart(normalizedCart);
      } else {
        // For non-authenticated users, update local state only
        setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
      }

      if (showToast) {
        toast.success("Видалено з кошика");
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
      if (showToast) {
        toast.error(error.message || "Не вдалося видалити з кошика");
      }
    }
  };

  const updateQuantity = async (productId, newQuantity, showToast = false) => {
    try {
      const res = await fetch("/api/session");
      const data = await res.json();

      if (data.user) {
        const response = await fetch("/api/cart", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId: productId,
            quantity: newQuantity,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update quantity");
        }

        // Get updated cart after updating quantity
        const cartResponse = await fetch("/api/cart");
        if (!cartResponse.ok) {
          throw new Error("Failed to fetch updated cart");
        }

        const serverCart = await cartResponse.json();
        const normalizedCart = serverCart.map((item) => ({
          id: item.product.id,
          name: item.product.name || "Без назви",
          image: (() => {
            if (!item.product.mainImage) return "/placeholder.svg";
            try {
              const url = String(item.product.mainImage);
              if (
                url.startsWith("/") ||
                url.startsWith("http://") ||
                url.startsWith("https://")
              ) {
                return url;
              }
              return `/img/${url}`;
            } catch (error) {
              console.error("Invalid image URL:", item.product.mainImage);
              return "/placeholder.svg";
            }
          })(),
          price: Number(item.product.price) || 0,
          quantity: Number(item.quantity) || 1,
          category: item.product.category || "Без категорії",
          selectedSize: null,
          selectedColor: null,
        }));
        setCart(normalizedCart);
      } else {
        // For non-authenticated users, update local state only
        setCart((prevCart) =>
          prevCart.map((item) =>
            item.id === productId ? { ...item, quantity: newQuantity } : item
          )
        );
      }

      if (showToast) {
        toast.success("Кількість оновлено");
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      if (showToast) {
        toast.error(error.message || "Не вдалося оновити кількість");
      }
    }
  };

  const clearCart = async (showToast = true) => {
    try {
      if (isAuthenticated) {
        // For authenticated users, clear cart in DB first
        const serverResponse = await fetch("/api/cart/clear", {
          method: "DELETE",
        });

        if (!serverResponse.ok) {
          if (serverResponse.status === 401) {
            setIsAuthenticated(false);
            toast.error("Ваш сеанс закінчився. Будь ласка, увійдіть знову.");
            openAuthModal("login");
            return;
          }
          throw new Error("Не вдалося очистити кошик");
        }
      }

      // Clear local state and localStorage for all users
      setCart([]);
      localStorage.removeItem("cart");

      if (showToast) {
        toast.success("Кошик очищено");
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
      if (showToast) {
        toast.error(error.message || "Не вдалося очистити кошик");
      }
    }
  };

  if (!isInitialized) {
    return null;
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isAuthenticated,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart повинен використовуватися всередині CartProvider");
  }
  return context;
}
