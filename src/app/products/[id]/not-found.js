import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-3xl font-bold mb-4">Товар не знайдено</h2>
      <p className="text-gray-600 mb-6">
        Вибачте, але товар, який ви шукаєте, не існує або був видалений.
      </p>
      <Link
        href="/products"
        className="bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition-colors"
      >
        Повернутися до каталогу
      </Link>
    </div>
  );
}
