import { NextResponse } from "next/server";
import { lmstudio } from "@/lib/lmstudio";

export async function GET() {
  try {
    // Пытаемся получить список моделей для проверки подключения
    // lmstudio.models.list() делает GET запрос к http://localhost:1234/v1/models
    const models = await lmstudio.models.list();
    
    return NextResponse.json({ 
      status: "connected",
      modelsCount: models.data?.length || 0,
      models: models.data || [] // Полный список моделей с их ID и другими параметрами
    });
  } catch (error) {
    return NextResponse.json({ 
      status: "disconnected",
      error: error.message 
    }, { status: 503 });
  }
}

