"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

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
              image: item.product.image || "/placeholder.svg",
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
            toast.error("Your session has expired. Please log in again.");
            router.push("/login");
          }
        } else {
          // If user is not authenticated, load from localStorage
          const savedCart = localStorage.getItem("cart");
          if (savedCart) {
            const parsedCart = JSON.parse(savedCart);
            const normalizedCart = parsedCart.map((item) => ({
              id: item.id,
              name: item.name || "Без назви",
              image: item.image || "/placeholder.svg",
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
  }, [router]);

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
        image: product.image || "/placeholder.svg",
        price: Number(product.price) || 0,
        quantity: 1,
        category:
          typeof product.category === "object"
            ? product.category.name
            : product.category || "Без категорії",
        selectedSize: product.selectedSize || null,
        selectedColor: product.selectedColor || null,
      };

      if (isAuthenticated) {
        // For authenticated users, add to DB first
        const serverResponse = await fetch("/api/cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId: product.id,
            quantity: 1,
            selectedSize: product.selectedSize,
            selectedColor: product.selectedColor,
          }),
        });

        if (!serverResponse.ok) {
          if (serverResponse.status === 401) {
            setIsAuthenticated(false);
            toast.error("Your session has expired. Please log in again.");
            router.push("/login");
            return;
          }
          throw new Error("Failed to add to cart");
        }

        // Reload cart from DB to ensure consistency
        const cartResponse = await fetch("/api/cart");
        const serverCart = await cartResponse.json();
        const normalizedCart = serverCart.map((item) => ({
          id: item.product.id,
          name: item.product.name || "Без назви",
          image: item.product.image || "/placeholder.svg",
          price: Number(item.product.price) || 0,
          quantity: Number(item.quantity) || 1,
          category: item.product.category || "Без категорії",
          selectedSize: item.selectedSize || null,
          selectedColor: item.selectedColor || null,
        }));
        setCart(normalizedCart);
      } else {
        // For non-authenticated users, update local state only
        setCart((prevCart) => {
          const existingItem = prevCart.find(
            (item) =>
              item.id === product.id &&
              item.selectedSize === product.selectedSize &&
              item.selectedColor === product.selectedColor
          );

          if (existingItem) {
            return prevCart.map((item) =>
              item.id === product.id &&
              item.selectedSize === product.selectedSize &&
              item.selectedColor === product.selectedColor
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
        toast.error(error.message || "Failed to add to cart");
      }
    }
  };

  const removeFromCart = async (
    productId,
    selectedSize,
    selectedColor,
    showToast = true
  ) => {
    try {
      if (isAuthenticated) {
        // For authenticated users, remove from DB first
        const serverResponse = await fetch(
          `/api/cart?productId=${productId}&selectedSize=${selectedSize}&selectedColor=${selectedColor}`,
          {
            method: "DELETE",
          }
        );

        if (!serverResponse.ok) {
          if (serverResponse.status === 401) {
            setIsAuthenticated(false);
            toast.error("Your session has expired. Please log in again.");
            router.push("/login");
            return;
          }
          throw new Error("Failed to remove from cart");
        }

        // Reload cart from DB
        const cartResponse = await fetch("/api/cart");
        const serverCart = await cartResponse.json();
        const normalizedCart = serverCart.map((item) => ({
          id: item.product.id,
          name: item.product.name || "Без назви",
          image: item.product.image || "/placeholder.svg",
          price: Number(item.product.price) || 0,
          quantity: Number(item.quantity) || 1,
          category: item.product.category || "Без категорії",
          selectedSize: item.selectedSize || null,
          selectedColor: item.selectedColor || null,
        }));
        setCart(normalizedCart);
      } else {
        // For non-authenticated users, update local state only
        setCart((prevCart) =>
          prevCart.filter(
            (item) =>
              !(
                item.id === productId &&
                item.selectedSize === selectedSize &&
                item.selectedColor === selectedColor
              )
          )
        );
      }

      if (showToast) {
        toast.success("Removed from cart");
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
      if (showToast) {
        toast.error(error.message || "Failed to remove from cart");
      }
    }
  };

  const updateQuantity = async (
    productId,
    selectedSize,
    selectedColor,
    quantity,
    showToast = true
  ) => {
    try {
      const newQuantity = Number(quantity);
      if (isNaN(newQuantity) || newQuantity < 1) return;

      if (isAuthenticated) {
        // For authenticated users, update in DB first
        const serverResponse = await fetch("/api/cart", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId,
            quantity: newQuantity,
            selectedSize,
            selectedColor,
          }),
        });

        if (!serverResponse.ok) {
          if (serverResponse.status === 401) {
            setIsAuthenticated(false);
            toast.error("Your session has expired. Please log in again.");
            router.push("/login");
            return;
          }
          throw new Error("Failed to update quantity");
        }

        // Reload cart from DB
        const cartResponse = await fetch("/api/cart");
        const serverCart = await cartResponse.json();
        const normalizedCart = serverCart.map((item) => ({
          id: item.product.id,
          name: item.product.name || "Без назви",
          image: item.product.image || "/placeholder.svg",
          price: Number(item.product.price) || 0,
          quantity: Number(item.quantity) || 1,
          category: item.product.category || "Без категорії",
          selectedSize: item.selectedSize || null,
          selectedColor: item.selectedColor || null,
        }));
        setCart(normalizedCart);
      } else {
        // For non-authenticated users, update local state only
        setCart((prevCart) =>
          prevCart.map((item) =>
            item.id === productId &&
            item.selectedSize === selectedSize &&
            item.selectedColor === selectedColor
              ? { ...item, quantity: newQuantity }
              : item
          )
        );
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      if (showToast) {
        toast.error(error.message || "Failed to update quantity");
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
            toast.error("Your session has expired. Please log in again.");
            router.push("/login");
            return;
          }
          throw new Error("Failed to clear cart");
        }
      }

      // Clear local state and localStorage for all users
      setCart([]);
      localStorage.removeItem("cart");

      if (showToast) {
        toast.success("Cart cleared");
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
      if (showToast) {
        toast.error(error.message || "Failed to clear cart");
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
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
