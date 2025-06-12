"use client";

export default function Spinner({ size = "md", className = "" }) {
  const sizeClasses = {
    sm: "h-5 w-5",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  return (
    <div
      className={`animate-spin rounded-full border-t-2 border-b-2 border-[var(--foreground)] ${sizeClasses[size]} ${className}`}
    />
  );
}
