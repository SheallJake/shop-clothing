"use client";

import { useLoading } from "@/components/LoadingManager";

export function useLoadingFetch() {
  const { addLoadingApi, removeLoadingApi } = useLoading();

  const fetchWithLoading = async (url, options = {}) => {
    const requestId = `${url}-${JSON.stringify(options)}`;
    addLoadingApi(requestId);

    try {
      const response = await fetch(url, options);
      return response;
    } finally {
      removeLoadingApi(requestId);
    }
  };

  return { fetchWithLoading };
}
