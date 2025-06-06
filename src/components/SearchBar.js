"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiSearch } from "react-icons/fi";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative flex flex-col gap-2">
      <button
        type="submit"
        className="flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors"
      >
        <FiSearch className="w-5 h-5" />
        <span>Пошук</span>
      </button>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Пошук..."
        className="w-full px-4 py-2 rounded-md bg-[var(--background)] border border-[var(--card-border)] focus:outline-none focus:border-[var(--accent)]"
      />
    </form>
  );
}
