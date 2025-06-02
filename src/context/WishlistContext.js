"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem("wishlist");
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist));
    }
    setLoading(false);
  }, []);

  // Sync with server when user is authenticated
  useEffect(() => {
    const syncWithServer = async () => {
      try {
        const response = await fetch("/api/session");
        const { user } = await response.json();

        if (user) {
          const serverResponse = await fetch("/api/wishlist");
          if (serverResponse.ok) {
            const serverWishlist = await serverResponse.json();
            setWishlist(serverWishlist);
            localStorage.setItem("wishlist", JSON.stringify(serverWishlist));
          } else if (serverResponse.status === 401) {
            // Token expired or invalid
            toast.error("Your session has expired. Please log in again.");
            router.push("/login");
          }
        }
      } catch (error) {
        console.error("Error syncing wishlist:", error);
      }
    };

    syncWithServer();
  }, [router]);

  const addToWishlist = async (product) => {
    try {
      // Add to local state first
      const newWishlist = [...wishlist, { productId: product.id, product }];
      setWishlist(newWishlist);
      localStorage.setItem("wishlist", JSON.stringify(newWishlist));

      // Try to sync with server if authenticated
      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          toast.error("Your session has expired. Please log in again.");
          router.push("/login");
          return;
        }
        throw new Error("Failed to add to wishlist");
      }

      toast.success("Added to wishlist");
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      toast.error("Failed to add to wishlist");
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      // Remove from local state first
      const newWishlist = wishlist.filter(
        (item) => item.productId !== productId
      );
      setWishlist(newWishlist);
      localStorage.setItem("wishlist", JSON.stringify(newWishlist));

      // Try to sync with server if authenticated
      const response = await fetch(`/api/wishlist?productId=${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          toast.error("Your session has expired. Please log in again.");
          router.push("/login");
          return;
        }
        throw new Error("Failed to remove from wishlist");
      }

      toast.success("Removed from wishlist");
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error("Failed to remove from wishlist");
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.productId === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
