"use client";

import Link from "next/link";
import { FiGithub, FiTwitter, FiInstagram } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--card-border)] bg-[var(--background)] mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Магазин</h3>
            <p className="text-[var(--muted)]">
              Сучасний мінімалістичний магазин одягу з акцентом на якість та
              стиль.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Швидкі посилання</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/products"
                  className="hover:text-[var(--muted)] transition-colors"
                >
                  Товари
                </Link>
              </li>
              <li>
                <Link
                  href="/game"
                  className="hover:text-[var(--muted)] transition-colors"
                >
                  Промогра
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="hover:text-[var(--muted)] transition-colors"
                >
                  Кошик
                </Link>
              </li>
              <li>
                <Link
                  href="/wishlist"
                  className="hover:text-[var(--muted)] transition-colors"
                >
                  Список бажань
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Служба підтримки</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/contact"
                  className="hover:text-[var(--muted)] transition-colors"
                >
                  Зв'язатися з нами
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping"
                  className="hover:text-[var(--muted)] transition-colors"
                >
                  Інформація про доставку
                </Link>
              </li>
              <li>
                <Link
                  href="/returns"
                  className="hover:text-[var(--muted)] transition-colors"
                >
                  Повернення
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="hover:text-[var(--muted)] transition-colors"
                >
                  Часті питання
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Слідкуйте за нами</h3>
            <div className="flex space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--muted)] transition-colors"
              >
                <FiGithub size={24} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--muted)] transition-colors"
              >
                <FiTwitter size={24} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--muted)] transition-colors"
              >
                <FiInstagram size={24} />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-[var(--card-border)] mt-8 pt-8 text-center">
          <p>&copy; {new Date().getFullYear()} Магазин. Всі права захищені.</p>
        </div>
      </div>
    </footer>
  );
}
