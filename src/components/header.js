'use client'
import { useState } from 'react';
import { Menu, X, User, Heart, ShoppingCart } from 'lucide-react';

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="w-full flex items-center justify-between p-4 border-b bg-white sticky top-0 z-50 text-black">
      {/* Бургер і назва */}
      <div className="flex items-center gap-2">
        <button onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
        <span className="text-xl font-bold">Магазин</span>
      </div>

      {/* Пошук */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <input
          type="text"
          placeholder="Пошук..."
          className="w-full border rounded px-3 py-1 text-sm"
        />
      </div>

      {/* Кнопки */}
      <div className="flex items-center gap-4 text-black">
        <button title="Обране"><Heart /></button>
        <button title="Кошик"><ShoppingCart /></button>
        <button title="Кабінет"><User /></button>
      </div>

      {/* Пошук (мобільний) */}
      {open && (
        <div className="absolute top-full left-0 right-0 bg-white p-4 border-t md:hidden">
          <input
            type="text"
            placeholder="Пошук..."
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>
      )}
    </header>
  );
}
