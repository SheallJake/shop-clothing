"use client";

import { useState } from "react";
import { BiChevronDown } from "react-icons/bi";

const faqData = [
  {
    id: 1,
    question: "Як зробити замовлення?",
    answer:
      "Оберіть товар, додайте його в кошик, натисніть 'Оформити замовлення' та заповніть контактні дані. Ми зв'яжемося з вами для підтвердження.",
  },
  {
    id: 2,
    question: "Які способи оплати ви приймаєте?",
    answer:
      "Ми приймаємо оплату через Monobank, накладений платіж при отриманні товару, а також оплату банківською карткою онлайн.",
  },
  {
    id: 3,
    question: "Як швидко доставляється замовлення?",
    answer:
      "Доставка здійснюється Новою Поштою по всій Україні. Зазвичай доставка займає 1-3 робочі дні в залежності від вашого регіону.",
  },
  {
    id: 4,
    question: "Чи можна повернути або обміняти товар?",
    answer:
      "Так, ви можете повернути або обміняти товар протягом 14 днів з моменту отримання, якщо він не був у використанні та збережено товарний вигляд.",
  },
  {
    id: 5,
    question: "Як дізнатися свій розмір?",
    answer:
      "На сторінці кожного товару є таблиця розмірів. Ви також можете звернутися до нашого чату для консультації щодо підбору розміру.",
  },
  {
    id: 6,
    question: "Чи є знижки та акції?",
    answer:
      "Так! У нас регулярно проводяться акції та розпродажі. Також ви можете отримати промокод, зігравши в нашу гру у розділі 'Отримати промокод'.",
  },
];

export default function FAQ() {
  const [openId, setOpenId] = useState(null);

  const toggleQuestion = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="mb-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white mb-2">
          Часті питання
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm md:text-base">
          Відповіді на найпопулярніші запитання
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-4">
        {faqData.map((item) => (
          <div
            key={item.id}
            className="bg-zinc-100 dark:bg-zinc-800 backdrop-blur-sm rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all duration-300"
          >
            <button
              onClick={() => toggleQuestion(item.id)}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <span className="text-zinc-900 dark:text-white font-medium text-sm md:text-base pr-4">
                {item.question}
              </span>
              <BiChevronDown
                className={`w-5 h-5 text-zinc-900 dark:text-white flex-shrink-0 transition-transform duration-300 ${
                  openId === item.id ? "rotate-180" : ""
                }`}
              />
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                openId === item.id ? "max-h-96" : "max-h-0"
              }`}
            >
              <div className="px-6 pb-4 text-zinc-700 dark:text-zinc-300 text-sm md:text-base">
                {item.answer}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-8">
        <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-4">
          Не знайшли відповідь на своє питання?
        </p>
        <button className="bg-zinc-800 dark:bg-zinc-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-zinc-700 dark:hover:bg-zinc-500 transition-colors uppercase text-sm">
          Зв'язатися з нами
        </button>
      </div>
    </div>
  );
}


