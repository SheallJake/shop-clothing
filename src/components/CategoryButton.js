"use client";

export default function CategoryButton({ label, isActive = false, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-6 md:px-8 py-3 rounded-full uppercase transition-colors text-sm md:text-base ${
        isActive
          ? "bg-[#2F2F2F] text-white"
          : "bg-[#2F2F2F] text-white hover:bg-[#4D4D4D]"
      }`}
    >
      {label}
    </button>
  );
}

