// Конфігурація логування
const LOG_CONFIG = {
  enabled: process.env.NODE_ENV === "development",
  colorUtils: true,
  auth: true,
  socket: true,
  loading: true,
};

// Функція для логування
export const log = (message, data, type = "info", source = "app") => {
  if (!LOG_CONFIG.enabled) return;

  // Перевіряємо чи дозволено логування для цього джерела
  if (!LOG_CONFIG[source]) return;

  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${source.toUpperCase()}] ${message}`;

  switch (type) {
    case "error":
      console.error(logMessage, data || "");
      break;
    case "warn":
      console.warn(logMessage, data || "");
      break;
    case "info":
      console.info(logMessage, data || "");
      break;
    default:
      console.log(logMessage, data || "");
  }
};

// Функція для вмикання/вимикання логування
export const setLogging = (config) => {
  Object.assign(LOG_CONFIG, config);
};

// Функція для отримання поточного стану логування
export const getLoggingConfig = () => ({ ...LOG_CONFIG });
