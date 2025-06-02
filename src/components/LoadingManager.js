"use client";

import { createContext, useContext, useState, useEffect } from "react";
import LoadingScreen from "./LoadingScreen";

const LoadingContext = createContext();

export function LoadingProvider({ children }) {
  const [loadingStates, setLoadingStates] = useState({
    images: new Set(),
    api: new Set(),
  });
  const [isLoading, setIsLoading] = useState(true);

  const addLoadingImage = (imageUrl) => {
    setLoadingStates((prev) => ({
      ...prev,
      images: new Set([...prev.images, imageUrl]),
    }));
  };

  const removeLoadingImage = (imageUrl) => {
    setLoadingStates((prev) => {
      const newImages = new Set(prev.images);
      newImages.delete(imageUrl);
      return {
        ...prev,
        images: newImages,
      };
    });
  };

  const addLoadingApi = (apiUrl) => {
    setLoadingStates((prev) => ({
      ...prev,
      api: new Set([...prev.api, apiUrl]),
    }));
  };

  const removeLoadingApi = (apiUrl) => {
    setLoadingStates((prev) => {
      const newApi = new Set(prev.api);
      newApi.delete(apiUrl);
      return {
        ...prev,
        api: newApi,
      };
    });
  };

  useEffect(() => {
    const allLoaded =
      loadingStates.images.size === 0 && loadingStates.api.size === 0;
    if (allLoaded) {
      // Add a small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [loadingStates]);

  const contextValue = {
    addLoadingImage,
    removeLoadingImage,
    addLoadingApi,
    removeLoadingApi,
    isLoading,
    loadingStates,
  };

  return (
    <LoadingContext.Provider value={contextValue}>
      {isLoading ? <LoadingScreen /> : children}
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
