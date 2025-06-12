"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import LoadingScreen from "./LoadingScreen";

const LoadingContext = createContext();

// Priority images that should be tracked
const PRIORITY_IMAGES = [
  "/banners/banner1.png",
  "/banners/banner2.png",
  "/banners/banner3.png",
];

export function LoadingProvider({ children }) {
  const [loadingStates, setLoadingStates] = useState({
    images: new Set(PRIORITY_IMAGES),
    api: new Set(),
  });
  const [isLoading, setIsLoading] = useState(true);
  const [forceHide, setForceHide] = useState(false);
  const [error, setError] = useState(null);
  const [loadingStartTime] = useState(Date.now());

  // Force hide loading screen after 5 seconds
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log(
        "[LoadingManager] Force hiding loading screen after 5 seconds"
      );
      setForceHide(true);
      setIsLoading(false);
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);

  const addLoadingImage = useCallback((imageUrl) => {
    if (!imageUrl) return;
    console.log("[LoadingManager] Adding image to loading state:", imageUrl);
    setLoadingStates((prev) => ({
      ...prev,
      images: new Set([...prev.images, imageUrl]),
    }));
  }, []);

  const removeLoadingImage = useCallback((imageUrl) => {
    if (!imageUrl) return;
    console.log(
      "[LoadingManager] Removing image from loading state:",
      imageUrl
    );
    setLoadingStates((prev) => {
      const newImages = new Set(prev.images);
      newImages.delete(imageUrl);
      return {
        ...prev,
        images: newImages,
      };
    });
  }, []);

  const addLoadingApi = useCallback((apiUrl) => {
    if (!apiUrl) return;
    console.log("[LoadingManager] Adding API to loading state:", apiUrl);
    setLoadingStates((prev) => ({
      ...prev,
      api: new Set([...prev.api, apiUrl]),
    }));
  }, []);

  const removeLoadingApi = useCallback((apiUrl) => {
    if (!apiUrl) return;
    console.log("[LoadingManager] Removing API from loading state:", apiUrl);
    setLoadingStates((prev) => {
      const newApi = new Set(prev.api);
      newApi.delete(apiUrl);
      return {
        ...prev,
        api: newApi,
      };
    });
  }, []);

  useEffect(() => {
    if (forceHide) {
      console.log("[LoadingManager] Force hide is true, hiding loading screen");
      setIsLoading(false);
      return;
    }

    const allLoaded =
      loadingStates.images.size === 0 && loadingStates.api.size === 0;
    const loadingTime = Date.now() - loadingStartTime;

    console.log("[LoadingManager] Current loading states:", {
      images: Array.from(loadingStates.images),
      api: Array.from(loadingStates.api),
      allLoaded,
      loadingTime,
    });

    if (allLoaded) {
      console.log(
        "[LoadingManager] All resources loaded, hiding loading screen"
      );
      setIsLoading(false);
    } else if (loadingTime > 5000) {
      // If loading takes more than 5 seconds, force hide
      console.log("[LoadingManager] Loading taking too long, force hiding");
      setForceHide(true);
      setIsLoading(false);
    }
  }, [loadingStates, forceHide, loadingStartTime]);

  // Add error boundary
  useEffect(() => {
    const handleError = (error) => {
      console.error("[LoadingManager] Loading error:", error);
      setError(error);
      setForceHide(true);
      setIsLoading(false);
    };

    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  const contextValue = {
    addLoadingImage,
    removeLoadingImage,
    addLoadingApi,
    removeLoadingApi,
    isLoading,
    loadingStates,
    error,
  };

  return (
    <LoadingContext.Provider value={contextValue}>
      {isLoading && !forceHide ? <LoadingScreen /> : children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
}
