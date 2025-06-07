"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import BannerSlider from "@/components/BannerSlider";
import CategoryGrid from "@/components/CategoryGrid";
import { useAuthModal } from "@/context/AuthModalContext";

export default function HomePage() {
  const searchParams = useSearchParams();
  const { openAuthModal } = useAuthModal();

  useEffect(() => {
    const auth = searchParams.get("auth");
    if (auth === "login" || auth === "register") {
      openAuthModal(auth);
    }
  }, [searchParams, openAuthModal]);

  return (
    <div className="space-y-8">
      <BannerSlider />
      <CategoryGrid />
    </div>
  );
}
