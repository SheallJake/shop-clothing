"use client";

import { AnimatePresence } from "framer-motion";
import PageTransition from "@/components/PageTransition";

export default function ClientLayout({ children }) {
  return (
    <AnimatePresence mode="wait">
      <PageTransition key="content">{children}</PageTransition>
    </AnimatePresence>
  );
}
