"use client";

import { AnimatePresence } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import { LoadingProvider } from "./LoadingManager";

export default function ClientLayout({ children }) {
  return (
    <LoadingProvider>
      <AnimatePresence mode="wait">
        <PageTransition key="content">{children}</PageTransition>
      </AnimatePresence>
    </LoadingProvider>
  );
}
