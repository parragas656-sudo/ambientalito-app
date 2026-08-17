import { GoogleGenAI, Type } from "@google/genai";
import { getGenAI, generateContentWithFailover, demoClassifications } from "./_lib/gemini";

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { image } = req.body || {};
    if (!image) return res.status(400).json({ error: "No se proporcionó ninguna imagen para analizar." });

    let mimeType = "image/jpeg";
    let base64Data = image;
    if (image.startsWith("data:")) {
      const match = image.match(/^data:([^;]+);base64,(.*)$/);
      if (match) { mimeType = match[1]; base64Data = match[2]; }
    }

    const ai = getGenAI();

    const demoPayload = (warning?: string) => {
      const shuffled = [...demoClassifications].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, Math.floor(Math.random() * 2) + 2);
      return {
        detected: true,
        classifications: selected,
        nearbySpots: [
          { title: "Punto Verde de Reciclaje Vecinal (Demo)", uri: "https://www.google.com/maps/search/recycling+center", address: "Av. de la Ecología s/n" },
          { title: "Centro de Envases y PET Comunitario", uri: "https://www.google.com/maps/search/green+point+recycling", address: "Calle de la Sostenibilidad 42" },
        ],
        spotSearchText: `Centros de reciclaje para ${selected.map((i: any) => i.spanishMaterialName).join(" y ")}`,
        isDemoMode: true,
        apiWarning: warning || "El servidor está operando en Modo Demo porque no se configuró GEMINI_API_KEY.",
      };
    };

    if (!ai) return res.status(200).json(demoPayload());

    const imagePart = { inlineData: { mimeType, data: base64Data } };
    const textPart = {
      text: `Eres "Ambientalito"... [pega aquí, literal, el prompt largo de las líneas 305–326 de tu server.ts]`,
    };

    const response = await generateContentWithFailover(ai, {
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          // pega aquí, literal, el mismo responseSchema de las líneas 335–396 de tu server.ts
        },
      },
    });

    const resultText = response.text;
    if (!resultText) throw new Error("No se obtuvo respuesta estructurada del modelo de visión.");
    const classificationResult = JSON.parse(resultText.trim());

    return res.status(200).json({
      detected: classificationResult.detected,
      classifications: classificationResult.classifications || [],
      nearbySpots: [],
      spotSearchText: "",
      isDemoMode: false,
    });
  } catch (error: any) {
    const s = (error?.message || String(error)).toLowerCase();
    const isQuota = s.includes("quota") || s.includes("exceeded") || s.includes("limit") || s.includes("free_tier") || s.includes("resource_exhausted") || s.includes("billing");
    return res.status(200).json({
      detected: true,
      classifications: [],
      isDemoMode: true,
      apiWarning: isQuota
        ? "Límite de la API de Gemini alcanzado. Ambientalito activó el modo de respaldo."
        : "Alta demanda o error temporal. Ambientalito activó el modo de respaldo.",
    });
  }
}
