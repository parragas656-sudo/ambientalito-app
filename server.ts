import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase payload limit for base64 image uploads
app.use(express.json({ limit: "20mb" }));

// Initialize Google Gen AI dynamically when needed to prevent startup crashes if GEMINI_API_KEY is not defined right away
let aiClient: GoogleGenAI | null = null;
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Robust helper to execute Gemini API calls with exponential backoff on transient errors (503/429/UNAVAILABLE/RESOURCE_EXHAUSTED)
async function callWithRetry<T>(fn: () => Promise<T>, maxRetries = 2, delayMs = 1200): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      const errorString = (error?.message || String(error)).toLowerCase();
      
      // Quota limits or exceeding rate limit daily allowances are non-transient in the short-term
      const isQuotaLimit = 
        errorString.includes("quota") || 
        errorString.includes("exceeded") ||
        errorString.includes("limit") ||
        errorString.includes("free_tier") ||
        errorString.includes("resource_exhausted") ||
        errorString.includes("billing");

      let isTransient = 
        !isQuotaLimit && (
          error?.status === 503 || 
          error?.status === 429 ||
          errorString.includes("503") || 
          errorString.includes("429") ||
          errorString.includes("unavailable") ||
          errorString.includes("resource_exhausted") ||
          errorString.includes("overloaded") ||
          errorString.includes("high demand")
        );

      if (isTransient && attempt < maxRetries) {
        console.warn(`[Gemini API] Error transitorio detectado (${error.message || error}). Reintentando intento ${attempt + 1}/${maxRetries} en ${delayMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        delayMs *= 2; // backoff exponencial
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

// Helper to call generateContent with automatic model failover and retries on transient errors
async function generateContentWithFailover(
  ai: GoogleGenAI,
  parameters: {
    model: string;
    contents: any;
    config?: any;
  },
  fallbackModel = "gemini-3.1-flash-lite"
): Promise<any> {
  try {
    // Try primary model with standard retry mechanism
    return await callWithRetry(() => 
      ai.models.generateContent(parameters)
    );
  } catch (primaryError: any) {
    const errorString = (primaryError?.message || String(primaryError)).toLowerCase();
    
    // Check if the primary error is a transient error (like 503, unavailable, overloaded)
    const isTransient = 
      primaryError?.status === 503 || 
      primaryError?.status === 429 ||
      errorString.includes("503") || 
      errorString.includes("429") ||
      errorString.includes("unavailable") ||
      errorString.includes("overloaded") ||
      errorString.includes("high demand");

    if (isTransient && parameters.model !== fallbackModel) {
      console.warn(`[Gemini API Failover] El modelo primario ${parameters.model} está saturado o no disponible (503). Conmutando al modelo de respaldo/resiliencia: ${fallbackModel}...`);
      try {
        // Try fallback model with retry mechanism
        return await callWithRetry(() => 
          ai.models.generateContent({
            ...parameters,
            model: fallbackModel
          })
        );
      } catch (fallbackError) {
        console.error("[Gemini API Failover] El modelo de respaldo también falló o no está disponible:", fallbackError);
        throw fallbackError;
      }
    }
    throw primaryError;
  }
}

// Support demo/mock responses when key is missing or fails
const demoClassifications = [
  {
    detected: true,
    material: "PET Bottle",
    spanishMaterialName: "Botella de PET de Refresco",
    confidence: 96,
    recyclable: true,
    degradationTime: "450 años",
    co2OffsetEstimate: "Evita 75g de emisiones de CO2",
    instructions: [
      "1. Acondiciona: Vacía por completo cualquier residuo líquido de la botella y enjuágala con un poco de agua limpia.",
      "2. Separa: Retira la tapa plástica (¡separa las tapas para donaciones!) y aplasta firmemente la botella para ahorrar espacio.",
      "3. Entrega: Deposítala limpia y seca en el contenedor amarillo de plásticos o tu centro de reciclaje local."
    ],
    benefits: "Reciclar PET ahorra hasta un 84% de la energía requerida para producir plástico virgen y reduce significativamente la contaminación marina.",
    recyclingCategory: "plastic" as const,
    summaryText: "Se identificó una botella de plástico PET. Es un residuo altamente reciclable. Sigue las instrucciones de vaciado y compactado para optimizar su transporte y procesamiento.",
    weightGrams: 50,
    co2OffsetGrams: 75,
    equivalentKm: 0.38,
    equivalentTrees: 1.25,
    ambientalitoAdvice: "¡Esa botella plástica tiene una magnífica oportunidad de revivir! 🌱 Aplástala para remover el aire y ganar espacio en la recolección. ¡Unidos por un océano sin microplásticos! 🌊♻️",
    boundingBox: [150, 100, 850, 450]
  },
  {
    detected: true,
    material: "Glass Bottle",
    spanishMaterialName: "Botella de Vidrio de Cerveza",
    confidence: 94,
    recyclable: true,
    degradationTime: "4,000 años",
    co2OffsetEstimate: "Evita 120g de emisiones de CO2",
    instructions: [
      "1. Acondiciona: Asegúrate de vaciar todo exceso de líquido y enjuagar para remover azúcares o fermentos.",
      "2. Separa: Retira la chapa o tapón metálico antes de clasificarla (estos van en la canasta de metales).",
      "3. Entrega: Deposítala con cuidado, sin romperla, en el contenedor verde para vidrio o punto de acopio local."
    ],
    benefits: "El vidrio se puede reciclar al 100% infinitas veces sin perder calidad. Cada botella reciclada ahorra suficiente energía para encender una bombilla de 100W durante 4 horas.",
    recyclingCategory: "glass" as const,
    summaryText: "Se detectó una botella entera de vidrio transparente/ámbar. Es perfectamente apta para el reciclaje circular infinito.",
    weightGrams: 400,
    co2OffsetGrams: 120,
    equivalentKm: 0.6,
    equivalentTrees: 2.0,
    ambientalitoAdvice: "¡El vidrio es inmortal, amigo! 🌍 Puede fundirse millones de veces sin perder pureza. Con tus acciones de hoy, evitamos extraer nuevas arenas de nuestros ríos. ¡Salud por el planeta! 🍾♻️",
    boundingBox: [200, 500, 900, 850]
  },
  {
    detected: true,
    material: "Aluminum Can",
    spanishMaterialName: "Lata de Aluminio de Refresco",
    confidence: 98,
    recyclable: true,
    degradationTime: "80 a 100 años",
    co2OffsetEstimate: "Evita 135g de emisiones de CO2",
    instructions: [
      "1. Acondiciona: Termina todo el contenido líquido de la lata para evitar malos olores y atraer insectos.",
      "2. Separa: Introduce la anilla metálica de apertura dentro de la lata y aplástala para ahorrar volumen.",
      "3. Entrega: Catalógala con los metales en el contenedor destinado en tu comunidad o llévala a un punto limpio."
    ],
    benefits: "El reciclaje de aluminio ahorra un asombroso 95% de los gases de efecto invernadero en comparación con la producción de aluminio a partir de bauxita cruda.",
    recyclingCategory: "metal" as const,
    summaryText: "Se identificó una lata de metal (aluminio). Su tasa de recuperación es excelente y representa un enorme beneficio para el balance energético de la comunidad.",
    weightGrams: 15,
    co2OffsetGrams: 135,
    equivalentKm: 0.68,
    equivalentTrees: 2.25,
    ambientalitoAdvice: "¡Guau! ⚡ El reciclaje de aluminio ahorra un asombroso 95% de energía. ¡Esta lata puede ser convertida en parte de una bicicleta o una nueva lata en solo 60 días! 📦🌱",
    boundingBox: [350, 300, 800, 650]
  },
  {
    detected: true,
    material: "Cardboard Box",
    spanishMaterialName: "Caja de Cartón de Embalaje",
    confidence: 92,
    recyclable: true,
    degradationTime: "3 a 5 meses",
    co2OffsetEstimate: "Evita 225g de emisiones de CO2",
    instructions: [
      "1. Acondiciona: Retira cualquier cinta adhesiva de plástico, etiquetas sintéticas o grapas metálicas grandes.",
      "2. Separa: Desarma la caja completamente por los pliegues para que quede totalmente plana y seca.",
      "3. Entrega: Deposítala limpia con el resto del papel y cartón limpio en el contenedor azul correspondiente."
    ],
    benefits: "Ayuda a mitigar la tala de árboles. Por cada tonelada de cartón reciclada, salvamos unos 17 árboles medianos y miles de litros de agua.",
    recyclingCategory: "paper" as const,
    summaryText: "Se identificó una caja de cartón plegable. Está en condiciones idóneas para ser transformada en nuevas fibers de papel y celulosa eco-amigable.",
    weightGrams: 250,
    co2OffsetGrams: 225,
    equivalentKm: 1.13,
    equivalentTrees: 3.75,
    ambientalitoAdvice: "¡Cada caja doblada es un respiro para nuestros hermosos bosques de coníferas! 🌲 Desármala por completo y mantenla seca para que se convierta en nueva celulosa. 🌱♻️",
    boundingBox: [100, 150, 900, 850]
  },
  {
    detected: true,
    material: "Apple Core",
    spanishMaterialName: "Corazón de Manzana (Residuo Orgánico)",
    confidence: 95,
    recyclable: true,
    degradationTime: "2 a 4 semanas",
    co2OffsetEstimate: "Reduce 16g de metano en vertederos",
    instructions: [
      "1. Acondiciona: Separa los restos de comida de plásticos, pegatinas y empaques no biodegradables.",
      "2. Separa: Guarda los residuos orgánicos en contenedores cerrados para evitar olores antes de compostarlos.",
      "3. Entrega: Deposítalos en tu compostera doméstica o colócalos en el contenedor marrón municipal."
    ],
    benefits: "El compostaje de residuos orgánicos devuelve valiosos nutrientes y materia orgánica al suelo agrícola, reduciendo la dependencia de fertilizantes artificiales.",
    recyclingCategory: "organic" as const,
    summaryText: "Se identificó un desecho alimenticio de origen orgánico. Es perfecto para compostar en casa o depositar en el contenedor marrón urbano.",
    weightGrams: 80,
    co2OffsetGrams: 16,
    equivalentKm: 0.08,
    equivalentTrees: 0.27,
    ambientalitoAdvice: "¡Nutrientes puros de vuelta a la amada Pachamama! 🍎 Evitemos que vaya a un vertedero a generar metano perjudicial. Composta este resto de fruta para dar vida a nuevas plantitas en tu jardín. 🌍🌱",
    boundingBox: [400, 400, 750, 700]
  }
];

// POST Endpoint for Waste Analysis using Gemini API
app.post("/api/analyze", async (req, res) => {
  try {
    const { image, location } = req.get("Content-Type")?.includes("application/json") ? req.body : { image: null, location: null };

    if (!image) {
      return res.status(400).json({ error: "No se proporcionó ninguna imagen para analizar." });
    }

    // Extract raw base64 data and mime type from data URL
    let mimeType = "image/jpeg";
    let base64Data = image;
    if (image.startsWith("data:")) {
      const match = image.match(/^data:([^;]+);base64,(.*)$/);
      if (match) {
        mimeType = match[1];
        base64Data = match[2];
      }
    }

    const ai = getGenAI();

    if (!ai) {
      // Graceful fallback to rich mock data when API key is missing
      console.warn("GEMINI_API_KEY missing - running in Demo Mode");
      const shuffled = [...demoClassifications].sort(() => 0.5 - Math.random());
      const selectedDemoItems = shuffled.slice(0, Math.floor(Math.random() * 2) + 2); // 2 to 3 items
      
      const responsePayload = {
        detected: true,
        classifications: selectedDemoItems,
        nearbySpots: [
          {
            title: "Punto Verde de Reciclaje Vecinal (Demo)",
            uri: "https://www.google.com/maps/search/recycling+center",
            address: "Av. de la Ecología s/n (Simulado por falta de API Key)"
          },
          {
            title: "Centro de Envases y PET Comunitario",
            uri: "https://www.google.com/maps/search/green+point+recycling",
            address: "Calle de la Sostenibilidad 42"
          }
        ],
        spotSearchText: `Centros de reciclaje para ${selectedDemoItems.map(i => i.spanishMaterialName).join(" y ")}`,
        isDemoMode: true,
        apiWarning: "El servidor está operando en Modo Demo porque no se configuró la variable GEMINI_API_KEY en el panel de secretos."
      };
      
      return res.json(responsePayload);
    }

    // Build the Multimodal vision prompt for waste classification
    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: base64Data,
      },
    };

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

    // Make the vision analysis call with robust automatic retry and failover
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
    if (!resultText) {
      throw new Error("No se obtuvo respuesta estructurada del modelo de visión.");
    }

    let classificationResult;
    try {
      classificationResult = JSON.parse(resultText.trim());
    } catch (parseError) {
      console.error("JSON parsing error on vision output:", resultText);
      throw new Error("Error al analizar la estructura JSON devuelta por el modelo.");
    }

    // Maps grounding search is removed
    const nearbySpots: any[] = [];
    const spotSearchText = "";

    const payload: any = {
      detected: classificationResult.detected,
      classifications: classificationResult.classifications || [],
      nearbySpots,
      spotSearchText,
      isDemoMode: false
    };

    return res.json(payload);

  } catch (error: any) {
    console.warn("Backend scan analysis failed (falling back to Demo Mode):", error);
    
    const errorString = (error?.message || String(error)).toLowerCase();
    const isQuotaError = 
      errorString.includes("quota") || 
      errorString.includes("exceeded") || 
      errorString.includes("limit") || 
      errorString.includes("free_tier") ||
      errorString.includes("resource_exhausted") ||
      errorString.includes("billing");

    const apiWarningText = isQuotaError 
      ? "Límite de solicitudes de la API de Gemini alcanzado (Cuota de prueba superada). Ambientalito activó el simulador inteligente de respaldo con éxito para que sigas aprendiendo y jugando."
      : "El servidor inteligente experimentó una alta demanda o error temporal. Ambientalito activó el simulador de respaldo inteligente de forma automática.";

    // Graceful fallback to rich mock data when Gemini API fails/overloads (e.g. 503 overload)
    const shuffled = [...demoClassifications].sort(() => 0.5 - Math.random());
    const selectedDemoItems = shuffled.slice(0, Math.floor(Math.random() * 2) + 2); // 2 to 3 items
    
    const responsePayload = {
      detected: true,
      classifications: selectedDemoItems,
      nearbySpots: [
        {
          title: "Punto Verde de Reciclaje Vecinal (Simulado)",
          uri: "https://www.google.com/maps/search/recycling+center",
          address: "Av. de la Ecología s/n (Simulado por alta demanda temporal de IA)"
        },
        {
          title: "Centro de Envases y PET Comunitario",
          uri: "https://www.google.com/maps/search/green+point+recycling",
          address: "Calle de la Sostenibilidad 42"
        }
      ],
      spotSearchText: `Centros de reciclaje para ${selectedDemoItems.map(i => i.spanishMaterialName).join(" y ")}`,
      isDemoMode: true,
      apiWarning: apiWarningText
    };
    
    return res.json(responsePayload);
  }
});

// POST Endpoint for chatting with Ambientalito (Senior Environmental Engineer)
app.post("/api/chat", async (req, res) => {
  const { message, history } = req.body;
  try {
    if (!message) {
      return res.status(400).json({ error: "No se proporcionó ningún mensaje." });
    }

    const ai = getGenAI();

    if (!ai) {
      const lowerMsg = message.toLowerCase();
      let reply = "";

      if (lowerMsg.includes("hola") || lowerMsg.includes("buen")) {
        reply = "¡Hola, guardián de la Tierra! 🐸🍀 Desde mi oficina de Ingeniería Ambiental, te doy una cálida bienvenida. ¿Qué inquietud ecológica o duda sobre gestión de residuos tienes hoy? ¡Juntos cuidaremos nuestro hermoso planetita! 🌍♻️";
      } else if (lowerMsg.includes("plástico") || lowerMsg.includes("pet") || lowerMsg.includes("botella")) {
        reply = "¡Excelente consulta técnica! 🥤🐸 Como Ingeniero Ambiental Senior, te comento que el plástico PET (Polietileno Tereftalato) tiene un altísimo porcentaje de reciclabilidad mecánica. Al reciclarlo evitamos la extracción de petróleo virgen y ahorramos hasta un 84% de energía. Recuerda: ¡vaciado, aplastado, tapado e introducido al contenedor amarillo! ♻️🍀";
      } else if (lowerMsg.includes("vidrio") || lowerMsg.includes("cristal")) {
        reply = "¡El vidrio es asombroso, colega! 🍾🐸 Es un material con un ciclo de reciclaje infinito al 100% sin perder un ápice de sus propiedades fisicoquímicas primarias. Al fundirlo en los hornos a menor temperatura que la arena de sílice originaria, reducimos las emisiones atmosféricas de CO2 exponencialmente. ¡Siempre al contenedor verde, sin chapas! 🟢✨";
      } else if (lowerMsg.includes("papel") || lowerMsg.includes("cartón") || lowerMsg.includes("caja")) {
        reply = "¡Excelente enfoque de circularidad! 📦🌱 Reciclar cartón o papel evita la tala inmoderada y un consumo hídrico masivo en la producción de celulosa virgen. Por cada tonelada salvamos 17 árboles medianos y miles de litros de agua dulce. ¡Asegúrate siempre de que estén secos y limpios para que no se pudran en la planta de tratamiento! 🌳💚";
      } else if (lowerMsg.includes("metal") || lowerMsg.includes("lata") || lowerMsg.includes("aluminio")) {
        reply = "¡Ah, la termodinámica del aluminio! 🥫⚡ Desde la perspectiva de la ingeniería, fundir aluminio reciclado requiere un increíble 95% menos de energía que extraer bauxita y refinarla de cero. ¡Esta lata que ves hoy podría volver a tus manos reciclada en forma de pieza de bicicleta en solo dos meses! Siempre clasifícala con los metales. 🍀♻️";
      } else if (lowerMsg.includes("compost") || lowerMsg.includes("orgánico") || lowerMsg.includes("fruta") || lowerMsg.includes("comida")) {
        reply = "¡La nutrición de la Madre Tierra! 🍏🐸 Los restos orgánicos tirados al basurero común se descomponen sin oxígeno (proceso anaeróbico masivo) produciendo gas metano, el cual es 25 veces más potente que el CO2 en efecto invernadero. Al compostarlos, realizamos un proceso aeróbico controlado que genera abono orgánico premium estructurador de suelos. ¡Devolvamos amor a la Pachamama! 🌻🌱";
      } else {
        const fallbacks = [
          "¡Esa es una pregunta sumamente interesante desde la perspectiva de la gestión de residuos! 🐸🍀 Como Ingeniero Ambiental Senior, te aconsejo siempre seguir la jerarquía de residuos: primero Reducir, luego Reutilizar para prolongar la vida útil, y finalmente Reciclar de manera limpia y seca. ¡Todo granito de arena cuenta para restaurar nuestro planetita! 🌱✨",
          "¡Maravillosa inquietud ecológica, amigo de la Tierra! 🐸🌍 Cada desecho tiene un ciclo de vida térmico y material único. Como ingenieros sostenibles de nuestra comunidad, buscamos cerrar los ciclos del sistema cuna a cuna ('cradle to cradle'). ¿Tienes alguna otra pregunta técnica sobre el impacto del reciclaje o el cuidado del ecosistema? 💚🍀",
          "¡Me encanta tu entusiasmo! 🐸💚 Los ecosistemas de nuestro planeta están conectados de manera muy estrecha; un envase mal desechado puede filtrarse como microplástico en las cadenas alimenticias y lagos acuáticos de mis amigos los anfibios. ¡Sigamos impulsando la conciencia verde en cada hogar! 🌊☘️"
        ];
        reply = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      }

      return res.json({ text: reply, isDemoMode: true });
    }

    // Build model payload with history and dynamic system instructions
    const formattedContents: any[] = [];
    
    if (history && Array.isArray(history)) {
      history.forEach((chatItem: any) => {
        if (chatItem.role && chatItem.text) {
          formattedContents.push({
            role: chatItem.role === "user" ? "user" : "model",
            parts: [{ text: chatItem.text }]
          });
        }
      });
    }

    // Add current user message at the end
    formattedContents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const systemInstruction = 
      `Eres "Ambientalito", un galardonado Ingeniero Ambiental Senior de gran carisma y más de 15 años de experiencia técnica en gestión integral de residuos sólidos, valorización material, economía circular y ecología aplicada. Tu mascota/avatar/esencia es un adorable sapito verde con un hermoso trébol de cuatro hojas en la cabeza (puedes presentarte o referirte a ti como "Ambientalito 🐸🍀").

      Normas fundamentales de tu personalidad y respuestas:
      1. AUTORIDAD CIENTÍFICA-TÉCNICA: Hablas con fundamentos científicos de alto nivel de manera comprensible. Dominas términos como: termodinámica de reciclables, huella de carbono equivalente, polímeros de alta densidad (HDPE/PET), compostaje aeróbico termófilo, gases de efecto invernadero (metano, CO2eq), ecodiseño y economía circular. Brindas datos impactantes de vez en cuando (ej. ahorro energético, tasa de degradación).
      2. CALIDEZ ADORABLE Y OPTIMISMO: Eres sumamente tierno, cercano y entusiasta. Usas diminutivos afectuosos ocasionalmente (planetita, basurita, ranitas). Llamas al usuario "guardián de la Tierra", "eco-colega" o "amigo/a de la naturaleza".
      3. ABUNDANTE USO DE EMOJIS: Llena tus respuestas con emojis de la naturaleza de manera elegante y vívida (🐸, 🍀, 🌱, 🌍, ♻️, 🌊, 🍾, 🥫, 📦, 🌸, ⚡).
      4. IDIOMA: Responde impecablemente en ESPAÑOL.
      5. BREVEDAD: Intenta dar respuestas claras, dinámicas y concisas (no más de 3 párrafos medianos, o con viñetas para que se lean de forma ágil y cómoda en pantallas y globos de texto móviles). Si te preguntan del juego, recuérdales que pueden alimentarte tirando residuos clasificados en la sección de juegos para sanar el estanque.`;

    const chatResponse = await generateContentWithFailover(ai, {
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 1.0,
      }
    });

    const replyText = chatResponse.text;
    if (!replyText) {
      throw new Error("No se obtuvo una respuesta válida del modelo.");
    }

    return res.json({ text: replyText, isDemoMode: false });

  } catch (error: any) {
    console.warn("Backend chat failed (falling back to backup database):", error);
    const lowerMsg = message?.toLowerCase() || "";
    let reply = "";

    if (lowerMsg.includes("hola") || lowerMsg.includes("buen")) {
      reply = "¡Hola, guardián de la Tierra! 🐸🍀 Desde mi oficina de Ingeniería Ambiental (en modo de respaldo local debido a alta demanda de la Red de IA), te doy una cálida bienvenida. ¿Qué inquietud ecológica o duda sobre gestión de residuos tienes hoy? ¡Juntos cuidaremos nuestro hermoso planetita! 🌍♻️";
    } else if (lowerMsg.includes("plástico") || lowerMsg.includes("pet") || lowerMsg.includes("botella")) {
      reply = "¡Excelente consulta técnica de respaldo! 🥤🐸 Como tu Ingeniero Ambiental Senior de cabecera, te comento que el plástico PET tiene un altísimo porcentaje de reciclabilidad. Al reciclarlo evitamos refinar petróleo virgen y ahorramos hasta un 84% de energía. Recuerda: ¡vaciado, aplastado, tapado e introducido al contenedor amarillo! ♻️🍀";
    } else if (lowerMsg.includes("vidrio") || lowerMsg.includes("cristal")) {
      reply = "¡El vidrio es asombroso, colega! 🍾🐸 Es un material con un ciclo de reciclaje infinito al 100% sin perder un ápice de sus propiedades físico-químicas primarias. Al fundirlo en los hornos a menor temperatura, reducimos las emisiones atmosféricas de CO2 exponencialmente. ¡Siempre al contenedor verde, sin chapas! 🟢✨";
    } else if (lowerMsg.includes("papel") || lowerMsg.includes("cartón") || lowerMsg.includes("caja")) {
      reply = "¡Excelente enfoque de circularidad! 📦🌱 Reciclar cartón o papel evita la tala inmoderada y un consumo hídrico masivo en la producción de celulosa virgen. Por cada tonelada salvamos 17 árboles medianos y miles de litros de agua dulce. ¡Asegúrate siempre de que estén secos y limpios para que no se contaminen! 🌳💚";
    } else if (lowerMsg.includes("metal") || lowerMsg.includes("lata") || lowerMsg.includes("aluminio")) {
      reply = "¡Ah, la termodinámica del aluminio! 🥫⚡ Desde la perspectiva de la ingeniería, fundir aluminio reciclado requiere un increíble 95% menos de energía que extraer bauxita y refinarla de cero. ¡Esta lata que ves hoy podría volver a tus manos reciclada en forma de nueva lata en solo dos meses! Siempre clasifícala con los metales. 🍀♻️";
    } else if (lowerMsg.includes("compost") || lowerMsg.includes("orgánico") || lowerMsg.includes("fruta") || lowerMsg.includes("comida")) {
      reply = "¡La nutrición de la Madre Tierra! 🍏🐸 Los restos orgánicos tirados al basurero común se descomponen sin oxígeno produciendo gas metano (muy perjudicial). Al compostarlos, realizamos un proceso controlado que genera abono orgánico premium estructurador de suelos. ¡Devolvamos amor a la Pachamama! 🌻🌱";
    } else {
      reply = "¡Esa es una pregunta sumamente interesante desde la perspectiva de la ingeniería de residuos! 🐸🍀 Debido a una alta demanda temporal en mi red neuronal remota (error 503), me encuentro respondiéndote desde mi unidad de respaldo regional. Te aconsejo seguir la jerarquía de las 3R: primero Reducir, luego Reutilizar para prolongar la vida útil, y finalmente Reciclar de manera limpia. ¿Qué otra duda ecológica puedo ayudarte a resolver? 🌱✨";
    }

    return res.json({ text: reply, isDemoMode: true });
  }
});

// Configure Vite or Static Files
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running in ${process.env.NODE_ENV === "production" ? "production" : "development"} mode on http://localhost:${PORT}`);
  });
}

startServer();
