export interface ClassificationResult {
  material: string; // Ej: "PET Bottle", "Glass Bottle", "Aluminum Can", "Cardboard Box"
  spanishMaterialName: string; // Ej: "Botella de PET", "Lata de Aluminio"
  confidence: number; // 0 a 100
  recyclable: boolean;
  degradationTime: string; // Ej: "450 años"
  co2OffsetEstimate: string; // Ej: "Evita 120g de emisiones de CO2"
  instructions: string[]; // Instrucciones paso a paso en español
  benefits: string; // Beneficios ecológicos en español
  recyclingCategory: 'plastic' | 'glass' | 'metal' | 'paper' | 'organic' | 'hazardous' | 'other';
  summaryText: string; // Resumen totalizador de los residuos detectados en la imagen
  weightGrams?: number; // Peso estimado del objeto en gramos (ej: 40)
  co2OffsetGrams?: number; // CO2 evitado calculado en gramos (ej: 60)
  equivalentKm?: number; // Kilómetros en auto equivalentes
  equivalentTrees?: number; // Días de trabajo de un árbol
  ambientalitoAdvice?: string; // Mensaje entusiasta de Ambientalito con emojis 🌱🌍♻️
  boundingBox?: number[]; // [ymin, xmin, ymax, xmax] coordinates normalized to 0-1000
}

export interface GroundingLocation {
  title: string;
  uri: string;
  address?: string;
}

export interface AnalysisResponse {
  detected: boolean;
  classifications: ClassificationResult[];
  nearbySpots?: GroundingLocation[];
  spotSearchText?: string;
  isDemoMode?: boolean;
  apiWarning?: string;
}

export interface ScanHistoryItem {
  id: string;
  timestamp: string;
  imageUrl: string;
  detected: boolean;
  classifications: ClassificationResult[];
  location?: {
    lat: number;
    lng: number;
  };
}

