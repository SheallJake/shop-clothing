"use client";

import { useChat } from "@/context/ChatContext";
import { useTheme } from "@/context/ThemeContext";
import { motion } from "framer-motion";

export default function MobileChatButton() {
  const { user, setIsChatOpen } = useChat();
  const { theme } = useTheme();

  if (!user) return null;

  return (
    <motion.button
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`${theme === "light" ? "bg-gradient-to-r from-stone-300 to-stone-200 text-slate-700 hover:from-stone-400 hover:to-stone-300" : "bg-gradient-to-r from-zinc-700 to-zinc-800 text-zinc-50 hover:from-zinc-600 hover:to-zinc-700"} px-3 py-1.5 rounded-lg text-base font-semibold transition-all duration-300 flex items-center gap-1.5 sm:hidden`}
      onClick={() => setIsChatOpen(true)}
    >
      <span>💬</span>
      <span>Чат</span>
    </motion.button>
  );
}
