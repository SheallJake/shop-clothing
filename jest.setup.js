// Увеличиваем таймаут для тестов
jest.setTimeout(30000);

// Добавляем полифилы для TextEncoder и TextDecoder
const { TextEncoder, TextDecoder } = require("util");
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Глобальные моки
global.console = {
  ...console,
  // Отключаем console.error и console.warn в тестах
  error: jest.fn(),
  warn: jest.fn(),
  // Оставляем console.log для отладки
  log: console.log,
};
