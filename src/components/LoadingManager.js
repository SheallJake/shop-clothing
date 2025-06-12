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

export function LoadingProvider({ children }) {
  const [loadingStates, setLoadingStates] = useState({
    images: new Set(),
    api: new Set(),
  });
  const [isLoading, setIsLoading] = useState(true);
  const [forceHide, setForceHide] = useState(false);

  // Force hide loading screen after 5 seconds
  useEffect(() => {
    const timeout = setTimeout(() => {
      setForceHide(true);
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);

  const addLoadingImage = useCallback((imageUrl) => {
    if (!imageUrl) return;
    setLoadingStates((prev) => ({
      ...prev,
      images: new Set([...prev.images, imageUrl]),
    }));
  }, []);

  const removeLoadingImage = useCallback((imageUrl) => {
    if (!imageUrl) return;
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
    setLoadingStates((prev) => ({
      ...prev,
      api: new Set([...prev.api, apiUrl]),
    }));
  }, []);

  const removeLoadingApi = useCallback((apiUrl) => {
    if (!apiUrl) return;
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
      setIsLoading(false);
      return;
    }

    const allLoaded =
      loadingStates.images.size === 0 && loadingStates.api.size === 0;

    if (allLoaded) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [loadingStates, forceHide]);

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
