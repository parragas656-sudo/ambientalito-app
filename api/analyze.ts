import { Type } from "@google/genai";
import { getGenAI, generateContentWithFailover, demoClassifications } from "./_lib/gemini.js";

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
          { title: "Punto Verde de Reciclaje Vecinal (Demo)", uri: "https://www.google.com/maps/search/recycling+center", address: "Av. de la Ecología s/n (Simulado por falta de API Key)" },
          { title: "Centro de Envases y PET Comunitario", uri: "https://www.google.com/maps/search/green+point+recycling", address: "Calle de la Sostenibilidad 42" },
        ],
        spotSearchText: `Centros de reciclaje para ${selected.map((i: any) => i.spanishMaterialName).join(" y ")}`,
        isDemoMode: true,
        apiWarning: warning || "El servidor está operando en Modo Demo porque no se configuró la variable GEMINI_API_KEY en el panel de secretos.",
      };
    };

    if (!ai) {
      console.warn("GEMINI_API_KEY missing - running in Demo Mode");
      return res.status(200).json(demoPayload());
    }

    const imagePart = { inlineData: { mimeType, data: base64Data } };
    const textPart = {
      text: `Eres "Ambientalito", un experto e ingeniero ambiental y gestor de residuos sólidos. Tu propósito es ayudar a los usuarios a diagnosticar, cuantificar, gestionar y calcular el impacto ambiental de sus residuos sólidos domésticos o comerciales. Tu tono es extremadamente entusiasta, pedagógico, fresco y comprometido con el planeta. Siempre usas emojis relacionados con la naturaleza (🌱, 🌍, ♻️, 📦, 🍾).

Analyze this image and identify ALL solid waste items found in it. Detect and list every distinct recyclable or non-recyclable item.

For each item detected, perform the following calculations and provide response fields exactly matching the requested JSON Schema:
1. Identify the 2D bounding box representing where the item is located in the image. Return this as 'boundingBox', a 4-element integer array containing [ymin, xmin, ymax, xmax] coordinates normalized to the [0, 1000] scale. ymin represents top, xmin represents left, ymax represents bottom, and xmax represents right.
2. Estimate its weight in grams ('weightGrams'). Typical weights: empty plastic bottle is ~20 to ~50g, aluminum can is ~15g, glass bottle is ~200 to ~400g, cardboard box/sheet is ~100 to ~300g, paper sheet ~5g.
3. Calculate the CO2 savings in grams ('co2OffsetGrams') using these exact environmental engineering factors based on material category:
   - PLASTIC (recyclingCategory = 'plastic'): 1.5 kg of CO2 avoided per 1.0 kg of recycled plastic (i.e. 'co2OffsetGrams' = weightGrams * 1.5).
   - METAL/ALUMINUM (recyclingCategory = 'metal'): 9.0 kg of CO2 avoided per 1.0 kg of recycled metal (i.e. 'co2OffsetGrams' = weightGrams * 9.0).
   - PAPER/CARDBOARD (recyclingCategory = 'paper'): 0.9 kg of CO2 avoided per 1.0 kg of recycled paper/cardboard (i.e. 'co2OffsetGrams' = weightGrams * 0.9).
   - GLASS (recyclingCategory = 'glass'): 0.3 kg of CO2 avoided per 1.0 kg of recycled glass (i.e. 'co2OffsetGrams' = weightGrams * 0.3).
   - ORGANIC/OTHER (recyclingCategory = 'organic' | 'hazardous' | 'other'): 0.2 kg of CO2 reduced/avoided per 1.0 kg of recycled/composted material (i.e. 'co2OffsetGrams' = weightGrams * 0.2).
4. Compute equivalent impact metrics:
   - 'equivalentKm': Kilometers driven in a gasoline-fueled car avoided (where 1000g of CO2 ≈ 5 km, so 'equivalentKm' = (co2OffsetGrams / 1000) * 5.0).
   - 'equivalentTrees': Work days of a mature tree absorbing CO2 (where 1 tree absorbs ~60g of CO2 per day, so 'equivalentTrees' = co2OffsetGrams / 60.0).
5. Set 'co2OffsetEstimate': a friendly string in Spanish outlining the calculated savings in grams of CO2 (e.g., 'Evita 75g de CO2').
6. Set 'instructions': create exactly 3 steps matching this precise action plan in Spanish:
   - "1. Acondiciona: [Detailed step to empty, clean, rinse, dry, or dismantle the item]"
   - "2. Separa: [Detailed step to flat/compress it, remove non-matching parts like labels/caps, and categorize it]"
   - "3. Entrega: [Detailed step detailing the correct landfill/recycling bin category color or local pickup]"
7. Set 'ambientalitoAdvice': an extremely friendly, enthusiastic and eco-positive pedagogical note from "Ambientalito" addressing the user, with abundant emojis, expressing congratulations on taking action, detailing why this material is super critical/important to save, and ending with an inspiring eco-slogan.`,
    };

    const imageAnalysisResponse = await generateContentWithFailover(ai, {
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detected: { type: Type.BOOLEAN },
            classifications: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  material: { type: Type.STRING },
                  spanishMaterialName: { type: Type.STRING },
                  confidence: { type: Type.INTEGER },
                  recyclable: { type: Type.BOOLEAN },
                  degradationTime: { type: Type.STRING },
                  co2OffsetEstimate: { type: Type.STRING },
                  instructions: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  benefits: { type: Type.STRING },
                  recyclingCategory: {
                    type: Type.STRING,
                    description: "Must be exactly one of: 'plastic', 'glass', 'metal', 'paper', 'organic', 'hazardous', 'other'"
                  },
                  summaryText: { type: Type.STRING },
                  weightGrams: { type: Type.INTEGER },
                  co2OffsetGrams: { type: Type.NUMBER },
                  equivalentKm: { type: Type.NUMBER },
                  equivalentTrees: { type: Type.NUMBER },
                  ambientalitoAdvice: { type: Type.STRING },
                  boundingBox: {
                    type: Type.ARRAY,
                    items: { type: Type.INTEGER },
                    description: "Coordinates representing ymin, xmin, ymax, xmax normalized in 0-1000 scale"
                  }
                },
                required: [
                  "material",
                  "spanishMaterialName",
                  "confidence",
                  "recyclable",
                  "degradationTime",
                  "co2OffsetEstimate",
                  "instructions",
                  "benefits",
                  "recyclingCategory",
                  "summaryText",
                  "weightGrams",
                  "co2OffsetGrams",
                  "equivalentKm",
                  "equivalentTrees",
                  "ambientalitoAdvice",
                  "boundingBox"
                ]
              }
            }
          },
          required: [
            "detected",
            "classifications"
          ]
        },
      },
    });

    const resultText = imageAnalysisResponse.text;
    if (!resultText) throw new Error("No se obtuvo respuesta estructurada del modelo de visión.");

    let classificationResult;
    try {
      classificationResult = JSON.parse(resultText.trim());
    } catch (parseError) {
      console.error("JSON parsing error on vision output:", resultText);
      throw new Error("Error al analizar la estructura JSON devuelta por el modelo.");
    }

    return res.status(200).json({
      detected: classificationResult.detected,
      classifications: classificationResult.classifications || [],
      nearbySpots: [],
      spotSearchText: "",
      isDemoMode: false,
    });
  } catch (error: any) {
    console.warn("Backend scan analysis failed (falling back to Demo Mode):", error);

    const s = (error?.message || String(error)).toLowerCase();
    const isQuota = s.includes("quota") || s.includes("exceeded") || s.includes("limit") || s.includes("free_tier") || s.includes("resource_exhausted") || s.includes("billing");

    const apiWarningText = isQuota
      ? "Límite de solicitudes de la API de Gemini alcanzado (Cuota de prueba superada). Ambientalito activó el simulador inteligente de respaldo con éxito para que sigas aprendiendo y jugando."
      : "El servidor inteligente experimentó una alta demanda o error temporal. Ambientalito activó el simulador de respaldo inteligente de forma automática.";

    const shuffled = [...demoClassifications].sort(() => 0.5 - Math.random());
    const selectedDemoItems = shuffled.slice(0, Math.floor(Math.random() * 2) + 2);

    return res.status(200).json({
      detected: true,
      classifications: selectedDemoItems,
      nearbySpots: [
        { title: "Punto Verde de Reciclaje Vecinal (Simulado)", uri: "https://www.google.com/maps/search/recycling+center", address: "Av. de la Ecología s/n (Simulado por alta demanda temporal de IA)" },
        { title: "Centro de Envases y PET Comunitario", uri: "https://www.google.com/maps/search/green+point+recycling", address: "Calle de la Sostenibilidad 42" },
      ],
      spotSearchText: `Centros de reciclaje para ${selectedDemoItems.map((i: any) => i.spanishMaterialName).join(" y ")}`,
      isDemoMode: true,
      apiWarning: apiWarningText,
    });
  }
}
