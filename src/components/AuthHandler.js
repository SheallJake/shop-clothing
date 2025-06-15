"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuthModal } from "@/context/AuthModalContext";

export default function AuthHandler() {
  const searchParams = useSearchParams();
  const { openAuthModal } = useAuthModal();

  useEffect(() => {
    const auth = searchParams.get("auth");
    if (auth === "login" || auth === "register") {
      const currentAuth = sessionStorage.getItem("currentAuth");
      if (currentAuth !== auth) {
        sessionStorage.setItem("currentAuth", auth);
        openAuthModal(auth);
      }
    }
  }, [searchParams, openAuthModal]);

  return null;
}
