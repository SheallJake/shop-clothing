import chroma from "chroma-js";
import { log } from "./logger";

// Базові кольори для fallback
const baseColors = {
  // Основні кольори
  червоний: "#FF0000",
  синій: "#0000FF",
  зелений: "#008000",
  жовтий: "#FFFF00",
  чорний: "#000000",
  білий: "#FFFFFF",
  сірий: "#808080",
  коричневий: "#A52A2A",
  бежевий: "#F5F5DC",
  блакитний: "#87CEEB",
  гірчичний: "#DAA520",
  теракотовий: "#E2725B",
  хакі: "#806B2A",
  оливковий: "#808000",
  помаранчевий: "#FFA500",
  грифельний: "#4F4F4F",
  джинс: "#1560BD",
  електрик: "#00FFFF",
  мокко: "#6F4E37",
  салатовий: "#7FFF00",

  // Світлі відтінки
  "світло-коричневий": "#B5651D",
  "світло-сірий": "#D3D3D3",

  // Темні відтінки
  "темно-бежевий": "#D2B48C",
  "темно-жовтий": "#B8860B",
  "темно-синій": "#00008B",
  "темно-сірий": "#404040",

  // Комбіновані кольори
  "бежево-білий": "#F5F5DC",
  "бежево-зелений": "#9ACD32",
  "бежево-коричневий": "#D2B48C",
  "бежево-помаранчевий": "#FFB366",
  "бежево-сірий": "#D3D3D3",
  "біло-бежевий": "#F5F5DC",
  "біло-синій": "#87CEEB",
  "біло-чорний": "#FFFFFF",
  "жовто-чорний": "#FFD700",
  "синьо-червоний": "#0000FF",
  "сіро-блакитний": "#87CEEB",
  "сіро-помаранчевий": "#FFA500",
  "сіро-салатовий": "#7FFF00",
  "сіро-синій": "#4682B4",
  "сіро-чорний": "#404040",
  "червоно-синій": "#0000FF",
  "чорно-білий": "#000000",
  "чорно-жовтий": "#FFD700",
  "чорно-зелений": "#006400",
  "чорно-коричневий": "#654321",
  "чорно-синій": "#000080",
  "чорно-сірий": "#404040",
  "чорно-червоний": "#800000",
};

// Функція для отримання темнішого відтінку кольору
const getDarkerShade = (color) => {
  try {
    return chroma(color).darken(0.5).hex();
  } catch {
    return color;
  }
};

// Функція для отримання світлішого відтінку кольору
const getLighterShade = (color) => {
  try {
    return chroma(color).brighten(0.5).hex();
  } catch {
    return color;
  }
};

// Функція для нормалізації назви кольору
const normalizeColorName = (colorName) => {
  // Видаляємо зайві пробіли
  colorName = colorName.trim();

  // Обробка приставок "темно-" та "світло-"
  if (colorName.startsWith("темно-")) {
    const baseColor = colorName.replace("темно-", "");
    const normalizedBaseColor = normalizeColorName(baseColor);
    const baseHex = baseColors[normalizedBaseColor];
    if (baseHex) {
      return getDarkerShade(baseHex);
    }
  }

  if (colorName.startsWith("світло-")) {
    const baseColor = colorName.replace("світло-", "");
    const normalizedBaseColor = normalizeColorName(baseColor);
    const baseHex = baseColors[normalizedBaseColor];
    if (baseHex) {
      return getLighterShade(baseHex);
    }
  }

  // Виправляємо часті помилки в назвах кольорів
  const colorCorrections = {
    чорно: "чорний",
    біло: "білий",
    синьо: "синій",
    зелено: "зелений",
    червоно: "червоний",
    жовто: "жовтий",
    сіро: "сірий",
    коричнево: "коричневий",
    фіолетово: "фіолетовий",
    рожево: "рожевий",
    оранжево: "оранжевий",
    бежево: "бежевий",
    блакитно: "блакитний",
    бордово: "бордовий",
    голубо: "голубий",
    золото: "золотий",
    срібно: "срібний",
    бірюзово: "бірюзовий",
    лаймово: "лаймовий",
    малиново: "малиновий",
    пурпурно: "пурпурний",
    салатово: "салатовий",
    гірчично: "гірчичний",
    теракотово: "теракотовий",
    хаки: "хаки",
    оливково: "оливковий",
  };

  return colorCorrections[colorName] || colorName;
};

// Функція для отримання кольору з назви
export const getColorFromName = (colorName) => {
  log("Input colorName:", colorName, "info", "colorUtils");

  if (!colorName) {
    log("No color name provided", null, "info", "colorUtils");
    return { background: "#808080" };
  }

  // Обробка приставок "темно-" та "світло-"
  if (colorName.startsWith("темно-") || colorName.startsWith("світло-")) {
    const normalizedColor = normalizeColorName(colorName);
    log("Processed shade color:", normalizedColor, "info", "colorUtils");
    return { background: normalizedColor };
  }

  // Перевіряємо чи це комбінований колір
  if (colorName.includes("-")) {
    const [color1, color2] = colorName.split("-").map(normalizeColorName);
    log("Split colors:", { color1, color2 }, "info", "colorUtils");

    try {
      // Спробуємо отримати кольори з базового словника
      const hex1 = baseColors[color1] || chroma(color1).hex();
      const hex2 = baseColors[color2] || chroma(color2).hex();

      log(
        "Combined colors:",
        { color1, color2, hex1, hex2 },
        "info",
        "colorUtils"
      );

      // Створюємо розділення кольорів по діагоналі
      const gradient = `linear-gradient(135deg, ${hex1} 0%, ${hex1} 50%, ${hex2} 50%, ${hex2} 100%)`;
      log("Generated gradient:", gradient, "info", "colorUtils");

      return {
        background: gradient,
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
      };
    } catch (error) {
      log("Error processing combined color:", error, "error", "colorUtils");
      return { background: "#808080" };
    }
  }

  // Для одиночних кольорів
  try {
    const normalizedColor = normalizeColorName(colorName);
    // Спочатку перевіряємо базовий словник
    if (baseColors[normalizedColor]) {
      log(
        "Found in base colors:",
        baseColors[normalizedColor],
        "info",
        "colorUtils"
      );
      return { background: baseColors[normalizedColor] };
    }

    // Спробуємо конвертувати назву кольору
    const hex = chroma(normalizedColor).hex();
    log("Converted color:", hex, "info", "colorUtils");
    return { background: hex };
  } catch (error) {
    log("Error processing single color:", error, "error", "colorUtils");
    return { background: "#808080" };
  }
};

// Функція для перевірки чи колір світлий
export const isLightColor = (color) => {
  try {
    return chroma(color).luminance() > 0.5;
  } catch {
    return false;
  }
};

// Функція для отримання контрастного кольору тексту
export const getContrastTextColor = (color) => {
  try {
    return isLightColor(color) ? "#000000" : "#FFFFFF";
  } catch {
    return "#000000";
  }
};

// Функція для створення розділення кольорів
export const createColorSplit = (color1, color2, angle = 135) => {
  try {
    const normalizedColor1 = normalizeColorName(color1);
    const normalizedColor2 = normalizeColorName(color2);
    const hex1 = baseColors[normalizedColor1] || chroma(normalizedColor1).hex();
    const hex2 = baseColors[normalizedColor2] || chroma(normalizedColor2).hex();
    console.log("Creating color split:", {
      color1: normalizedColor1,
      color2: normalizedColor2,
      hex1,
      hex2,
    }); // Debug log

    const gradient = `linear-gradient(${angle}deg, ${hex1} 0%, ${hex1} 50%, ${hex2} 50%, ${hex2} 100%)`;
    console.log("Generated split gradient:", gradient); // Debug log

    return {
      background: gradient,
      backgroundSize: "100% 100%",
      backgroundRepeat: "no-repeat",
    };
  } catch (error) {
    console.error("Error creating color split:", error);
    return { background: "#808080" };
  }
};
