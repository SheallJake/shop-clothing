import OpenAI from "openai";

export const lmstudio = new OpenAI({
  apiKey: "lm-studio", // любое слово, LM Studio не проверяет
  baseURL: "http://localhost:1234/v1"
});
