"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BiLogoGithub,
  BiLogoTwitter,
  BiLogoInstagram,
} from "react-icons/bi";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--card-border)] bg-[var(--background)] mt-auto overflow-x-hidden w-full">
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold mb-4">Крамничка</h3>
            <p className="text-[var(--muted)] text-sm leading-relaxed">
              Сучасний мінімалістичний магазин одягу з акцентом на якість та
              стиль.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold mb-4">Швидкі посилання</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/products"
                  className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors text-sm"
                >
                  Товари
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors text-sm"
                >
                  Кошик
                </Link>
              </li>
              <li>
                <Link
                  href="/wishlist"
                  className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors text-sm"
                >
                  Список бажань
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold mb-4">Служба підтримки</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/contact"
                  className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors text-sm"
                >
                  Зв'язатися з нами
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping"
                  className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors text-sm"
                >
                  Інформація про доставку
                </Link>
              </li>
              <li>
                <Link
                  href="/returns"
                  className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors text-sm"
                >
                  Повернення
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors text-sm"
                >
                  Часті питання
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold mb-4">Слідкуйте за нами</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors text-sm flex items-center gap-2"
                >
                  <BiLogoGithub size={20} />
                  <span>GitHub</span>
                </a>
              </li>
              <li>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors text-sm flex items-center gap-2"
                >
                  <BiLogoTwitter size={20} />
                  <span>Twitter</span>
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors text-sm flex items-center gap-2"
                >
                  <BiLogoInstagram size={20} />
                  <span>Instagram</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-[var(--card-border)] mt-12 pt-8 text-center">
          <p className="text-[var(--muted)] text-sm">
            &copy; {new Date().getFullYear()} Крамничка. Всі права захищені.
          </p>
        </div>
      </div>
    </footer>
  );
}
