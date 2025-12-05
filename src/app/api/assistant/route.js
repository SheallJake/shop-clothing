import { NextResponse } from "next/server";
import { lmstudio } from "@/lib/lmstudio";
import {
  searchProducts,
  getProductsByCategory,
  getCategories,
  getProductById,
  getPopularProducts,
} from "@/lib/assistant-db";

// Определение доступных функций для модели
const tools = [
  {
    type: "function",
    function: {
      name: "searchProducts",
      description: "Поиск товаров по текстовому запросу. Используй для поиска товаров по названию, описанию, бренду.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Текст поискового запроса",
          },
          limit: {
            type: "number",
            description: "Максимальное количество результатов (по умолчанию 10)",
            default: 10,
          },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getProductsByCategory",
      description: "Получить товары по категории. Используй когда пользователь спрашивает про конкретную категорию товаров.",
      parameters: {
        type: "object",
        properties: {
          categoryName: {
            type: "string",
            description: "Название категории (например: футболки, джинсы, куртки)",
          },
          limit: {
            type: "number",
            description: "Максимальное количество результатов (по умолчанию 10)",
            default: 10,
          },
        },
        required: ["categoryName"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getCategories",
      description: "Получить список всех доступных категорий товаров. Используй когда пользователь спрашивает про категории или типы товаров.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getProductById",
      description: "Получить подробную информацию о конкретном товаре по его ID. Используй когда пользователь спрашивает про товар с конкретным номером.",
      parameters: {
        type: "object",
        properties: {
          id: {
            type: "number",
            description: "ID товара",
          },
        },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getPopularProducts",
      description: "Получить популярные товары с высоким рейтингом. Используй когда пользователь спрашивает про популярные, лучшие, топ товары или товары с высоким рейтингом.",
      parameters: {
        type: "object",
        properties: {
          limit: {
            type: "number",
            description: "Максимальное количество результатов (по умолчанию 10)",
            default: 10,
          },
        },
      },
    },
  },
];

// Выполнение функции на основе вызова модели
async function executeFunction(functionName, args) {
  try {
    switch (functionName) {
      case "searchProducts":
        return await searchProducts(args.query, args.limit || 10);
      case "getProductsByCategory":
        return await getProductsByCategory(args.categoryName, args.limit || 10);
      case "getCategories":
        return await getCategories();
      case "getProductById":
        return await getProductById(args.id);
      case "getPopularProducts":
        return await getPopularProducts(args.limit || 10);
      default:
        return { error: `Неизвестная функция: ${functionName}` };
    }
  } catch (error) {
    console.error(`Ошибка выполнения функции ${functionName}:`, error);
    return { error: error.message };
  }
}

export async function POST(req) {
  try {
    const { message, useStructuredResponse } = await req.json();

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: "Сообщение не может быть пустым" },
        { status: 400 }
      );
    }

    const systemPrompt = `Ты ассистент интернет-магазина одежды. Помогай пользователям выбирать товары.

Инструкции:
- Используй доступные функции для получения информации о товарах
- Если нужно найти товары, используй соответствующие функции
- Будь дружелюбным и полезным
- Указывай цены в гривнах (UAH)
- Если есть скидки, упоминай их
- Учитывай наличие товара на складе
- Формируй понятные и информативные ответы на основе полученных данных`;

    // ШАГ 1: Спрашиваем у модели, какие функции нужно вызвать
    const firstRequest = {
      model: "meta-llama-3.1-8b-instruct",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      tools: tools,
      tool_choice: "auto", // Модель сама решает, какие функции вызывать
      temperature: 0.7,
      max_tokens: 1000,
      stream: false,
    };

    const firstCompletion = await lmstudio.chat.completions.create(firstRequest);
    const assistantMessage = firstCompletion.choices[0].message;

    // Собираем результаты выполнения функций
    const functionResults = [];
    const allProducts = [];
    const allCategories = [];

    // ШАГ 2: Если модель решила вызвать функции, выполняем их
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      for (const toolCall of assistantMessage.tool_calls) {
        const functionName = toolCall.function.name;
        let functionArgs = {};
        
        try {
          functionArgs = JSON.parse(toolCall.function.arguments || "{}");
        } catch (e) {
          console.warn(`Ошибка парсинга аргументов функции ${functionName}:`, e);
        }

        console.log(`Выполняю функцию: ${functionName}`, functionArgs);

        // Выполняем функцию
        const result = await executeFunction(functionName, functionArgs);

        // Сохраняем результаты
        functionResults.push({
          tool_call_id: toolCall.id,
          role: "tool",
          name: functionName,
          content: JSON.stringify(result),
        });

        // Собираем товары и категории для возврата клиенту
        if (Array.isArray(result)) {
          if (functionName === "getCategories") {
            allCategories.push(...result);
          } else {
            allProducts.push(...result);
          }
        } else if (result && result.id) {
          // Один товар
          allProducts.push(result);
        }
      }

      // ШАГ 3: Передаем результаты обратно модели для формирования финального ответа
      const secondRequest = {
        model: "meta-llama-3.1-8b-instruct",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
          assistantMessage, // Сообщение с tool_calls
          ...functionResults, // Результаты выполнения функций
          {
            role: "user",
            content: "Сформируй ответ пользователю на основе полученных данных. Будь дружелюбным и информативным.",
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
        stream: false,
      };

      // Опционально: структурированный JSON ответ
      if (useStructuredResponse) {
        secondRequest.response_format = {
          type: "json_schema",
          json_schema: {
            name: "assistant_response",
            strict: true,
            schema: {
              type: "object",
              properties: {
                reply: {
                  type: "string",
                  description: "Ответ ассистента пользователю",
                },
                suggestedProducts: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                  description: "Рекомендуемые товары, если применимо",
                },
              },
              required: ["reply"],
            },
          },
        };
      }

      const secondCompletion = await lmstudio.chat.completions.create(secondRequest);
      const finalReply = secondCompletion.choices[0].message.content;

      // Если используется структурированный ответ, парсим JSON
      let parsedReply = finalReply;
      if (useStructuredResponse) {
        try {
          parsedReply = JSON.parse(finalReply);
        } catch (e) {
          console.warn("Не удалось распарсить структурированный ответ:", e);
        }
      }

      // ШАГ 4: Возвращаем ответ пользователю
      return NextResponse.json({
        reply: parsedReply,
        products: allProducts.slice(0, 10), // Возвращаем до 10 товаров
        categories: allCategories,
      });
    } else {
      // Модель ответила напрямую без вызова функций
      let parsedReply = assistantMessage.content;
      
      if (useStructuredResponse) {
        try {
          parsedReply = JSON.parse(assistantMessage.content);
        } catch (e) {
          console.warn("Не удалось распарсить структурированный ответ:", e);
        }
      }

      return NextResponse.json({
        reply: parsedReply,
        products: [],
        categories: [],
      });
    }
  } catch (error) {
    console.error("Ошибка при обращении к LM Studio:", error);
    return NextResponse.json(
      {
        error:
          error.message ||
          "Ошибка при обращении к LM Studio. Убедитесь, что LM Studio запущен.",
      },
      { status: 503 }
    );
  }
}