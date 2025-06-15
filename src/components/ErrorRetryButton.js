"use client";

export default function ErrorRetryButton() {
  return (
    <button
      onClick={() => window.location.reload()}
      className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 underline transition-colors"
    >
      Спробувати ще раз
    </button>
  );
}
