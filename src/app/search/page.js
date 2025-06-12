"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Spinner from "@/components/Spinner";

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
        <Spinner size="md" />
      </div>
    </div>
  );
}
