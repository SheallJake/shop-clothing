"use client";

import { useState, useEffect } from "react";
import ProductCard from "@/components/ProductCard";

export default function Page() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [foundProducts, setFoundProducts] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState("checking");
  const [isLoading, setIsLoading] = useState(false);

  // Проверка статуса подключения
  async function checkConnection() {
    try {
      const res = await fetch("/api/assistant/status");
      const data = await res.json();
      setConnectionStatus(data.status);
      return data.status;
    } catch (error) {
      setConnectionStatus("disconnected");
      return "disconnected";
    }
  }

  // Автоматическая проверка статуса раз в 10 минут
  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 600000); // 10 минут = 600000 мс
    return () => clearInterval(interval);
  }, []);

  // Отправка сообщения
  async function handleSend() {
    if (!message.trim()) {
      setReply("Пожалуйста, введите сообщение");
      return;
    }

    // Обновляем статус перед отправкой запроса
    const currentStatus = await checkConnection();
    
    if (currentStatus !== "connected") {
      setReply("Ошибка: LM Studio не подключен");
      return;
    }

    setIsLoading(true);
    setReply("");
    setFoundProducts([]);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Ошибка ${res.status}`);
      }

      const data = await res.json();
      
      // Обработка структурированного ответа
      if (typeof data.reply === "object") {
        setReply(data.reply.reply || JSON.stringify(data.reply, null, 2));
      } else {
        setReply(data.reply);
      }

      // Сохраняем найденные товары
      if (data.products && data.products.length > 0) {
        setFoundProducts(data.products);
      }

      // Обновляем статус после успешного запроса
      await checkConnection();
    } catch (error) {
      setReply("Ошибка: " + error.message);
      // Обновляем статус при ошибке
      await checkConnection();
    } finally {
      setIsLoading(false);
    }
  }

  // Обработка Enter
  function handleKeyPress(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const statusColors = {
    connected: "bg-green-500",
    disconnected: "bg-red-500",
    checking: "bg-yellow-500"
  };

  const statusText = {
    connected: "Подключено",
    disconnected: "Не подключено",
    checking: "Проверка..."
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          Ассистент магазина
        </h1>

        {/* Статус подключения */}
        <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${statusColors[connectionStatus]}`}></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Статус: <strong>{statusText[connectionStatus]}</strong>
            </span>
            <button
              onClick={checkConnection}
              className="ml-auto px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Обновить
            </button>
          </div>
        </div>

        {/* Поле ввода */}
        <div className="mb-4">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Введите ваш вопрос..."
            className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            rows={4}
            disabled={isLoading || connectionStatus !== "connected"}
          />
        </div>

        {/* Кнопка отправки */}
        <button
          onClick={handleSend}
          disabled={isLoading || connectionStatus !== "connected" || !message.trim()}
          className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
        >
          {isLoading ? "Отправка..." : "Отправить"}
        </button>

        {/* Ответ */}
        {reply && (
          <div className="mt-6 space-y-6">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                Ответ ассистента:
              </h2>
              <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {reply}
              </div>
            </div>

            {/* Найденные товары */}
            {foundProducts.length > 0 && (
              <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Найденные товары:
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {foundProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

