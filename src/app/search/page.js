"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q");

  useEffect(() => {
    if (query) {
      // Redirect to catalog page with search query
      router.push(`/products?q=${encodeURIComponent(query)}`);
    }
  }, [query, router]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    </div>
  );
}
