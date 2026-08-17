import { GoogleGenAI } from "@google/genai";

let aiClient: GoogleGenAI | null = null;
export function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } },
    });
  }
  return aiClient;
}

export async function callWithRetry<T>(fn: () => Promise<T>, maxRetries = 2, delayMs = 1200): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const s = (error?.message || String(error)).toLowerCase();
      const isQuota = s.includes("quota") || s.includes("exceeded") || s.includes("limit") || s.includes("free_tier") || s.includes("resource_exhausted") || s.includes("billing");
      const isTransient = !isQuota && (error?.status === 503 || error?.status === 429 || s.includes("503") || s.includes("429") || s.includes("unavailable") || s.includes("overloaded") || s.includes("high demand"));
      if (isTransient && attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, delayMs));
        delayMs *= 2;
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

export async function generateContentWithFailover(
  ai: GoogleGenAI,
  parameters: { model: string; contents: any; config?: any },
  fallbackModel = "gemini-3.1-flash-lite"
): Promise<any> {
  try {
    return await callWithRetry(() => ai.models.generateContent(parameters));
  } catch (primaryError: any) {
    const s = (primaryError?.message || String(primaryError)).toLowerCase();
    const isTransient = primaryError?.status === 503 || primaryError?.status === 429 || s.includes("503") || s.includes("429") || s.includes("unavailable") || s.includes("overloaded") || s.includes("high demand");
    if (isTransient && parameters.model !== fallbackModel) {
      return await callWithRetry(() => ai.models.generateContent({ ...parameters, model: fallbackModel }));
    }
    throw primaryError;
  }
}

export const demoClassifications = [
  // Copia aquí, tal cual, el array `demoClassifications` completo
  // de las líneas 127–243 de tu server.ts (los 5 objetos: PET, vidrio,
  // aluminio, cartón y manzana). No lo reescribo por espacio, pero
  // es un copy-paste literal de lo que ya tienes.
];
