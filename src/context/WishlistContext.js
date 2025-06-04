"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const loadWishlist = async () => {
      try {
        console.log("Loading wishlist from localStorage...");
        const savedWishlist = localStorage.getItem("wishlist");
        console.log("Saved wishlist data:", savedWishlist);

        if (savedWishlist) {
          const parsedWishlist = JSON.parse(savedWishlist);
          console.log("Parsed wishlist:", parsedWishlist);
          setWishlist(parsedWishlist);
        }
      } catch (error) {
        console.error("Error loading wishlist from localStorage:", error);
        setWishlist([]);
      } finally {
        setLoading(false);
        setIsInitialized(true);
      }
    };

    loadWishlist();
  }, []);

  // Sync with server when user is authenticated
  useEffect(() => {
    const syncWithServer = async () => {
      try {
        const response = await fetch("/api/session");
        const { user } = await response.json();

        if (user) {
          console.log("User is authenticated, syncing wishlist with server...");
          const serverResponse = await fetch("/api/wishlist");
          if (serverResponse.ok) {
            const serverWishlist = await serverResponse.json();
            console.log("Server wishlist:", serverWishlist);
            setWishlist(serverWishlist);
            localStorage.setItem("wishlist", JSON.stringify(serverWishlist));
          } else if (serverResponse.status === 401) {
            console.log("Session expired, redirecting to login...");
            toast.error("Your session has expired. Please log in again.");
            router.push("/login");
          }
        }
      } catch (error) {
        console.error("Error syncing wishlist:", error);
      }
    };

    if (isInitialized) {
      syncWithServer();
    }
  }, [router, isInitialized]);

  // Save to localStorage when wishlist changes
  useEffect(() => {
    if (!isInitialized) return;

    try {
      console.log("Saving wishlist to localStorage:", wishlist);
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
    } catch (error) {
      console.error("Error saving wishlist to localStorage:", error);
    }
  }, [wishlist, isInitialized]);

  const addToWishlist = async (product) => {
    try {
      console.log("Adding product to wishlist:", product);

      // Add to local state first
      const newWishlist = [...wishlist, { productId: product.id, product }];
      setWishlist(newWishlist);
      localStorage.setItem("wishlist", JSON.stringify(newWishlist));

      // Try to sync with server if authenticated
      const response = await fetch("/api/session");
      const sessionData = await response.json();
      console.log("Session data:", sessionData);

      if (sessionData.user) {
        console.log("User is authenticated, syncing with server...");
        const serverResponse = await fetch("/api/wishlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId: product.id,
          }),
        });

        const serverData = await serverResponse.json();
        console.log("Server response:", serverData);

        if (!serverResponse.ok) {
          if (serverResponse.status === 401) {
            toast.error("Your session has expired. Please log in again.");
            router.push("/login");
            return;
          }
          throw new Error(serverData.error || "Failed to add to wishlist");
        }
      } else {
        console.log("User is not authenticated, only saving locally");
      }

      toast.success("Added to wishlist");
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      // Revert local state on error
      setWishlist(wishlist);
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
      toast.error(error.message || "Failed to add to wishlist");
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      console.log("Removing product from wishlist:", productId);

      // Remove from local state first
      const newWishlist = wishlist.filter(
        (item) => item.productId !== productId
      );
      setWishlist(newWishlist);
      localStorage.setItem("wishlist", JSON.stringify(newWishlist));

      // Try to sync with server if authenticated
      const response = await fetch("/api/session");
      const sessionData = await response.json();
      console.log("Session data:", sessionData);

      if (sessionData.user) {
        console.log("User is authenticated, syncing with server...");
        const serverResponse = await fetch(
          `/api/wishlist?productId=${productId}`,
          {
            method: "DELETE",
          }
        );

        const serverData = await serverResponse.json();
        console.log("Server response:", serverData);

        if (!serverResponse.ok) {
          if (serverResponse.status === 401) {
            toast.error("Your session has expired. Please log in again.");
            router.push("/login");
            return;
          }
          // Revert local state on error
          setWishlist(wishlist);
          localStorage.setItem("wishlist", JSON.stringify(wishlist));
          throw new Error(serverData.error || "Failed to remove from wishlist");
        }
      } else {
        console.log("User is not authenticated, only saving locally");
      }

      toast.success("Removed from wishlist");
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error(error.message || "Failed to remove from wishlist");
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.productId === productId);
  };

  const clearWishlist = () => {
    console.log("Clearing wishlist");
    setWishlist([]);
    localStorage.removeItem("wishlist");
  };

  // Don't render children until initialized
  if (!isInitialized) {
    return null;
  }

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
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
