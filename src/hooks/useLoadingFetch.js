"use client";

import { useLoading } from "@/components/LoadingManager";

export function useLoadingFetch() {
  const fetchWithLoading = async (url, options = {}) => {
    const response = await fetch(url, options);
    return response;
  };

  return { fetchWithLoading };
}
