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
