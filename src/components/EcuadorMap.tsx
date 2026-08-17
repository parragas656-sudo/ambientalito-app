import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, 
  Trash2, 
  MapPin, 
  Flame, 
  Map as MapIcon, 
  Sparkles, 
  TrendingUp, 
  Globe, 
  Info,
  Layers,
  Leaf
} from "lucide-react";
import { ScanHistoryItem } from "../types";
import { SapoLogo } from "./SapoLogo";

interface EcuadorMapProps {
  history: ScanHistoryItem[];
  onAddSimulatedScan: (item: ScanHistoryItem) => void;
  onClearHistory: () => void;
}

// Major Ecuadorian Provinces for simulation
const EC_PROVINCES = [
  { name: "Pichincha (Quito)", lat: -0.18, lng: -78.47, region: "Sierra" },
  { name: "Guayas (Guayaquil)", lat: -2.18, lng: -79.88, region: "Costa" },
  { name: "Azuay (Cuenca)", lat: -2.90, lng: -79.00, region: "Sierra" },
  { name: "Manabí (Manta/Portoviejo)", lat: -0.95, lng: -80.73, region: "Costa" },
  { name: "Loja", lat: -4.00, lng: -79.20, region: "Sierra" },
  { name: "Tungurahua (Ambato)", lat: -1.25, lng: -78.62, region: "Sierra" },
  { name: "Galápagos", lat: -0.75, lng: -90.30, region: "Insular" },
  { name: "Orellana (El Coca)", lat: -0.46, lng: -76.98, region: "Oriente" },
  { name: "Pastaza (Puyo)", lat: -1.48, lng: -77.99, region: "Oriente" },
  { name: "Esmeraldas", lat: 0.96, lng: -79.65, region: "Costa" }
];

const WASTE_TEMPLATES = [
  { name: "Botella PET Plástico", cat: "plastic", weight: 35, co2: 105 },
  { name: "Lata de Refresco Aluminio", cat: "metal", weight: 15, co2: 142 },
  { name: "Fruta Desecho Orgánico", cat: "organic", weight: 150, co2: 75 },
  { name: "Caja de Cartón Embalaje", cat: "paper", weight: 220, co2: 198 },
  { name: "Envase de Vidrio", cat: "glass", weight: 300, co2: 240 }
];

export default function EcuadorMap({ history, onAddSimulatedScan, onClearHistory }: EcuadorMapProps) {
  const [mapMode, setMapMode] = useState<"heatmap" | "pins">("heatmap");
  const [selectedPin, setSelectedPin] = useState<ScanHistoryItem | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [regionFilter, setRegionFilter] = useState<string>("all");

  // Project lat/lng coordinate on an SVG canvas (500 width, 400 height)
  // Galapagos will fall in an inset window because of -90.3 longitude
  const projectCoordinate = (lat: number, lng: number) => {
    // Galapagos condition
    if (lng < -83.0) {
      // Scale inside an inset box at top-left ([15, 15] to [115, 115])
      // Galapagos bounding: Lat (-1.5 to 0.7), Lng (-91.6 to -89.1)
      const x = Math.max(15, Math.min(115, 15 + ((lng - (-91.6)) / 2.5) * 85));
      const y = Math.max(15, Math.min(115, 15 + ((0.7 - lat) / 2.2) * 85));
      return { x, y, isGalapagos: true };
    }

    // Mainland projection
    // Bounding bounds: Lng (-81.2 to -75.0), Lat (1.5 to -5.0)
    let x = ((lng - (-81.2)) / 6.2) * 500;
    let y = ((1.5 - lat) / 6.5) * 400;
    
    // Clamp coordinates tightly within the visible SVG grid so they don't render off-canvas
    x = Math.max(25, Math.min(475, x));
    y = Math.max(25, Math.min(375, y));
    
    return { x, y, isGalapagos: false };
  };

  // Create simulated scan helper
  const handleSimulateInProvince = (prov: typeof EC_PROVINCES[number]) => {
    const template = WASTE_TEMPLATES[Math.floor(Math.random() * WASTE_TEMPLATES.length)];
    const id = `sim-${Date.now()}`;
    const timestamp = new Date().toISOString();
    
    // Slight random offset to avoid exact stacking
    const randOffsetLat = (Math.random() - 0.5) * 0.14;
    const randOffsetLng = (Math.random() - 0.5) * 0.14;

    const simulatedItem: ScanHistoryItem = {
      id,
      timestamp,
      imageUrl: "manual", // Indicates manual/simulated
      detected: true,
      classifications: [
        {
          material: template.name.toUpperCase().replace(/ /g, "_"),
          spanishMaterialName: template.name,
          confidence: Math.round(85 + Math.random() * 15),
          recyclable: true,
          degradationTime: template.cat === "plastic" ? "450 años" : "100 años",
          co2OffsetEstimate: `Evita ${template.co2}g de CO2`,
          instructions: ["Acondicionar y reciclar de forma usual."],
          benefits: "Aporte sumado mecánicamente de forma ecológica.",
          recyclingCategory: template.cat as any,
          summaryText: `Residuo tipo ${template.name} simulado en ${prov.name}.`,
          weightGrams: template.weight,
          co2OffsetGrams: template.co2,
          ambientalitoAdvice: `¡Saludos desde ${prov.name}! 🐸🍀 He registrado este residuo en nuestro ecomapa.`
        }
      ],
      location: {
        lat: prov.lat + randOffsetLat,
        lng: prov.lng + randOffsetLng
      }
    };

    onAddSimulatedScan(simulatedItem);
  };

  // Extract all scanned locations from history (filtering only detected ones with location)
  const validScanLocations = useMemo(() => {
    return history
      .filter(item => item.detected && item.location && item.classifications && item.classifications[0])
      .map(item => {
        const coords = projectCoordinate(item.location!.lat, item.location!.lng);
        return {
          ...item,
          coords,
          category: item.classifications[0].recyclingCategory,
          weight: item.classifications[0].weightGrams || 50,
          co2: item.classifications[0].co2OffsetGrams || 100,
          material: item.classifications[0].spanishMaterialName
        };
      });
  }, [history]);

  // Compute stat metrics by region
  const statsByRegion = useMemo(() => {
    const counts = { Costa: 0, Sierra: 0, Oriente: 0, Insular: 0 };
    let totalWeight = 0;
    let totalCo2 = 0;

    validScanLocations.forEach(loc => {
      totalWeight += loc.weight;
      totalCo2 += loc.co2;

      // Classify which region based on coordinates
      if (loc.coords.isGalapagos) {
        counts.Insular++;
      } else {
        const lng = loc.location!.lng;
        if (lng < -79.3) {
          counts.Costa++;
        } else if (lng >= -79.3 && lng < -78.1) {
          counts.Sierra++;
        } else {
          counts.Oriente++;
        }
      }
    });

    return { counts, totalWeight, totalCo2 };
  }, [validScanLocations]);

  // Filters points based on selected region
  const filteredLocations = useMemo(() => {
    if (regionFilter === "all") return validScanLocations;
    return validScanLocations.filter(loc => {
      if (regionFilter === "insular") return loc.coords.isGalapagos;
      
      const lng = loc.location!.lng;
      if (regionFilter === "costa") return !loc.coords.isGalapagos && lng < -79.3;
      if (regionFilter === "sierra") return !loc.coords.isGalapagos && lng >= -79.3 && lng < -78.1;
      if (regionFilter === "oriente") return !loc.coords.isGalapagos && lng >= -78.1;
      return true;
    });
  }, [validScanLocations, regionFilter]);

  return (
    <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 md:p-6 shadow-2xl relative animate-fade-in text-white overflow-hidden">
      
      {/* Decorative background effects */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header section with instructions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-white/5 pb-5 select-none">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest">
              Eco-Visor Geográfico
            </span>
          </div>
          <h2 className="text-xl font-black font-display text-white mt-1">
            Ecomapa Sostenible de Calor <span className="text-emerald-450">EC 🇪🇨</span>
          </h2>
          <p className="text-xs text-slate-450 max-w-xl mt-1 leading-relaxed">
            Visualiza en tiempo real los focos de reciclaje registrados en el Ecuador. Los puntos representan la mitigación de CO₂ y volumen de residuos recuperados.
          </p>
        </div>

        {/* Map view type toggles */}
        <div className="flex bg-slate-900 border border-white/10 p-1 rounded-xl self-start md:self-center">
          <button
            onClick={() => setMapMode("heatmap")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold font-sans transition flex items-center gap-1.5 cursor-pointer ${
              mapMode === "heatmap" 
                ? "bg-emerald-600 text-white shadow-md" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>Mapa de Calor</span>
          </button>
          <button
            onClick={() => setMapMode("pins")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold font-sans transition flex items-center gap-1.5 cursor-pointer ${
              mapMode === "pins" 
                ? "bg-emerald-600 text-white shadow-md" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-teal-400" />
            <span>Marcadores</span>
          </button>
        </div>
      </div>

      {/* Grid containing map representation + dashboard metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column: Interactive Map Widget (7 columns) */}
        <div className="lg:col-span-7 bg-slate-950/60 p-4 border border-white/5 rounded-3xl flex flex-col items-center justify-between min-h-[460px] relative shadow-inner overflow-hidden">
          
          {/* Active Legend Layer */}
          <div className="absolute top-4 left-4 z-20 bg-slate-950/90 border border-white/10 rounded-xl p-3 text-[10px] space-y-1.5 backdrop-blur-md select-none">
            <span className="font-bold text-slate-300 block mb-1 uppercase tracking-wide">Regiones Naturales:</span>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500/20 border border-emerald-500/60" />
              <span className="text-slate-100">Costa (Litoral)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-amber-500/20 border border-amber-500/60" />
              <span className="text-slate-100">Sierra (Andes)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-teal-500/20 border border-teal-500/60" />
              <span className="text-slate-100">Oriente (Amazonía)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-sky-500/20 border border-sky-500/60" />
              <span className="text-slate-100">Galápagos (Insular)</span>
            </div>
          </div>

          {/* Interactive Region Filter Pills */}
          <div className="absolute top-4 right-4 z-20 flex gap-1 bg-slate-900/90 border border-white/10 p-0.5 rounded-lg text-[9px] backdrop-blur-md select-none">
            {["all", "costa", "sierra", "oriente", "insular"].map((f) => (
              <button
                key={f}
                onClick={() => setRegionFilter(f)}
                className={`px-2 py-1 rounded capitalize font-medium cursor-pointer transition ${
                  regionFilter === f
                    ? "bg-emerald-600 text-white font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {f === "all" ? "Todo" : f}
              </button>
            ))}
          </div>

          {/* SVG Map Render */}
          <div 
            className="w-full h-full max-h-[380px] flex items-center justify-center relative mt-6"
            onClick={() => setSelectedPin(null)}
          >
            <div 
              className="relative w-full max-w-[450px] aspect-4/3 overflow-visible"
              onClick={(e) => e.stopPropagation()}
            >
              <svg 
                viewBox="0 0 500 400" 
                className="w-full h-full overflow-visible pointer-events-auto"
              >
                <defs>
                  {/* Real-world scientific heatmap gradient: White-hot core, moving to intense red/orange, fading into yellow and green */}
                  <radialGradient id="heat-grad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                    <stop offset="15%" stopColor="#ff1e56" stopOpacity="0.95" />
                    <stop offset="40%" stopColor="#ff5f00" stopOpacity="0.8" />
                    <stop offset="65%" stopColor="#ffb000" stopOpacity="0.5" />
                    <stop offset="85%" stopColor="#22c55e" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                  </radialGradient>

                  {/* Costa region physical color: agricultural plains, golden sands with north forest cover */}
                  <linearGradient id="costa-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#16a34a" /> {/* Esmeraldas North forest */}
                    <stop offset="25%" stopColor="#34d399" /> {/* Manabi wet hills */}
                    <stop offset="60%" stopColor="#fef08a" /> {/* Dry plains/beige */}
                    <stop offset="85%" stopColor="#fde047" /> {/* Santa Elena sand */}
                    <stop offset="100%" stopColor="#d97706" /> {/* El Oro dry loam */}
                  </linearGradient>

                  {/* Sierra region physical color: majestic rugged brown ranges, sub-valleys */}
                  <linearGradient id="sierra-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#78350f" /> {/* Northern range */}
                    <stop offset="35%" stopColor="#a16207" /> {/* Valleys */}
                    <stop offset="70%" stopColor="#854d0e" /> {/* Chimborazo highlands */}
                    <stop offset="100%" stopColor="#b45309" /> {/* Loja warm soil */}
                  </linearGradient>

                  {/* Oriente region physical color: dense, deep, rich Amazonian forest canopy */}
                  <linearGradient id="oriente-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#14532d" /> {/* Heavy jungle north */}
                    <stop offset="50%" stopColor="#15803d" /> {/* Central canopy */}
                    <stop offset="100%" stopColor="#166534" /> {/* Pastaza basin deep green */}
                  </linearGradient>

                  {/* Ocean contour gradient: clean and subtle depth */}
                  <radialGradient id="ocean-contour" cx="20%" cy="60%" r="80%">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.06" />
                    <stop offset="50%" stopColor="#0ea5e9" stopOpacity="0.02" />
                    <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
                  </radialGradient>

                  <filter id="glow-effect" x="-35%" y="-35%" width="170%" height="170%">
                    <feGaussianBlur stdDeviation="3.5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>

                  <filter id="volcano-ridge-glow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Ocean physical waves background simulator */}
                <rect width="500" height="400" fill="url(#ocean-contour)" rx="24" className="pointer-events-none" />

                {/* Dotted Geographic Grid (Latitude & Longitude) */}
                <g stroke="rgba(255,255,255,0.04)" strokeWidth="0.8" strokeDasharray="3 4">
                  {/* Latitudes */}
                  <line x1="10" y1="50" x2="490" y2="50" />
                  <line x1="10" y1="150" x2="490" y2="150" />
                  <line x1="10" y1="250" x2="490" y2="250" />
                  <line x1="10" y1="350" x2="490" y2="350" />
                  {/* Longitudes */}
                  <line x1="100" y1="10" x2="100" y2="390" />
                  <line x1="220" y1="10" x2="220" y2="390" />
                  <line x1="340" y1="10" x2="340" y2="390" />
                  <line x1="460" y1="10" x2="460" y2="390" />
                </g>

                {/* Grid values */}
                <g fill="#64748b" fontSize="8" fontFamily="monospace" opacity="0.6" className="select-none pointer-events-none">
                  <text x="4" y="53">0° Lat (Línea Equinoccial)</text>
                  <text x="4" y="153">1°S</text>
                  <text x="4" y="253">2°S</text>
                  <text x="4" y="353">3°S</text>
                  <text x="104" y="394" textAnchor="middle">80°W</text>
                  <text x="224" y="394" textAnchor="middle">79°W</text>
                  <text x="344" y="394" textAnchor="middle">78°W</text>
                  <text x="464" y="394" textAnchor="middle">77°W</text>
                </g>

                {/* Physical marine geography label accents mimicking paper charts */}
                <g className="select-none pointer-events-none" fill="#38bdf8" opacity="0.25" fontFamily="sans-serif">
                  <text x="45" y="315" fontSize="10" fontWeight="bold" letterSpacing="2" transform="rotate(-15, 45, 315)">
                    OCÉANO PACÍFICO
                  </text>
                  <text x="30" y="160" fontSize="7" fontWeight="medium" letterSpacing="1.5" transform="rotate(-12, 30, 160)">
                    CARNEGIE RIDGE
                  </text>
                  <text x="65" y="282" fontSize="7" fontWeight="bold" letterSpacing="0.8" transform="rotate(-5, 65, 282)" fill="#7dd3fc" opacity="0.4">
                    Golfo de Guayaquil
                  </text>
                </g>

                {/* GALAPAGOS INSET BOX FRAME */}
                <rect 
                  x="10" 
                  y="10" 
                  width="120" 
                  height="115" 
                  rx="16" 
                  fill="#020617/60" 
                  stroke="#0ea5e9" 
                  strokeWidth="1.2" 
                  strokeDasharray="4 3" 
                  className="opacity-40"
                />
                <text x="20" y="24" fill="#38bdf8" fontSize="9" fontWeight="bold" fontFamily="monospace" className="select-none tracking-wider opacity-90">
                  GALÁPAGOS
                </text>

                {/* Simplified Insular Islands */}
                <circle cx="34" cy="65" r="9" fill="#0ea5e9" fillOpacity="0.25" stroke="#0ea5e9" strokeWidth="1.2" />
                <ellipse cx="78" cy="54" rx="14" ry="10" fill="#0ea5e9" fillOpacity="0.25" stroke="#0ea5e9" strokeWidth="1.2" />
                <circle cx="95" cy="88" r="8" fill="#0ea5e9" fillOpacity="0.25" stroke="#0ea5e9" strokeWidth="1.2" />

                {/* 1. COSTA SVG PATH SECTION (Lush, highly detailed coastline) */}
                <path 
                  d="M 135 12 C 130 18, 128 25, 122 33 C 112 40, 105 50, 95 62 C 80 72, 72 85, 75 92 C 70 102, 65 118, 62 130 C 52 140, 44 148, 48 158 C 55 162, 64 164, 68 168 C 55 185, 48 198, 45 210 C 32 218, 20 232, 15 240 C 22 248, 38 252, 52 258 C 64 256, 78 252, 85 255 C 92 262, 90 272, 82 284 C 88 290, 94 298, 102 305 C 106 295, 114 286, 118 274 C 115 264, 112 254, 115 248 C 122 242, 126 252, 128 264 C 134 278, 126 292, 122 305 C 118 318, 124 326, 132 338 C 136 345, 142 352, 142 352 C 142 352, 143 325, 144 298 C 146 268, 143 225, 145 182 C 145 130, 153 85, 155 45 Z" 
                  fill="url(#costa-grad)"
                  fillOpacity={hoveredRegion === "costa" ? "0.95" : "0.78"}
                  stroke="#10b981" 
                  strokeWidth={hoveredRegion === "costa" ? "2.5" : "1.2"} 
                  strokeLinejoin="round"
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredRegion("costa")}
                  onMouseLeave={() => setHoveredRegion(null)}
                />

                {/* Isla Puná explicitly rendering in Guayaquil Gulf */}
                <path 
                  d="M 85 272 C 86 268, 92 268, 96 270 C 102 274, 105 278, 104 284 C 102 288, 96 290, 90 286 C 84 282, 84 276, 85 272 Z"
                  fill="#eab308"
                  fillOpacity="0.8"
                  stroke="#ca8a04"
                  strokeWidth="1"
                  className="opacity-95"
                />

                {/* 2. SIERRA SVG PATH SECTION (Rugged Andes mountains, solid brown & golden valleys) */}
                <path 
                  d="M 155 45 C 153 85, 145 130, 145 182 C 143 225, 146 268, 144 298 C 143 325, 142 352, 142 352 C 142 352, 146 364, 145 375 C 155 378, 168 381, 185 385 C 195 385, 198 370, 202 355 C 208 322, 204 285, 208 245 C 212 210, 208 172, 205 130 C 195 100, 188 65, 185 45 Z" 
                  fill="url(#sierra-grad)"
                  fillOpacity={hoveredRegion === "sierra" ? "0.95" : "0.78"}
                  stroke="#f59e0b" 
                  strokeWidth={hoveredRegion === "sierra" ? "2.5" : "1.2"} 
                  strokeLinejoin="round"
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredRegion("sierra")}
                  onMouseLeave={() => setHoveredRegion(null)}
                />

                {/* Andes volcanic spine ridge line to look realistic like the relief map's hotspots (Avenida de los Volcanes) */}
                <path 
                  d="M 172 48 Q 166 100 178 140 T 182 230 T 176 300 T 162 365"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="7"
                  strokeLinecap="round"
                  opacity="0.32"
                  filter="url(#volcano-ridge-glow)"
                  className="pointer-events-none"
                />
                <path 
                  d="M 172 48 Q 166 100 178 140 T 182 230 T 176 300 T 162 365"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  opacity="0.65"
                  className="pointer-events-none"
                />

                {/* Famous High Peaks/Volcano indicators from the physical map */}
                <g className="select-none pointer-events-none opacity-80">
                  {/* Volcán Cotopaxi */}
                  <circle cx="180" cy="138" r="2.5" fill="#ffffff" />
                  <circle cx="180" cy="138" r="5" fill="#ef4444" fillOpacity="0.4" className="animate-ping" style={{ animationDuration: "3s" }} />
                  <text x="186" y="141" fill="#fca5a5" fontSize="6.5" fontWeight="bold" fontFamily="monospace">Cotopaxi</text>

                  {/* Volcán Chimborazo (Highest peak) */}
                  <circle cx="178" cy="198" r="3" fill="#ffffff" />
                  <circle cx="178" cy="198" r="6" fill="#ef4444" fillOpacity="0.4" className="animate-ping" style={{ animationDuration: "2.5s" }} />
                  <text x="184" y="201" fill="#fca5a5" fontSize="6.5" fontWeight="bold" fontFamily="monospace">Chimborazo</text>

                  {/* Volcán Active Tungurahua */}
                  <circle cx="204" cy="166" r="2.5" fill="#f59e0b" />
                  <text x="210" y="169" fill="#fde047" fontSize="5.5" fontWeight="black" fontFamily="monospace">Tungurahua</text>
                </g>

                {/* 3. ORIENTE SVG PATH SECTION (Dense organic Amazon green) */}
                <path 
                  d="M 185 45 C 188 65, 195 100, 205 130 C 208 172, 212 210, 208 245 C 204 285, 208 322, 202 355 C 198 370, 195 385, 195 385 C 195 385, 222 378, 250 365 C 285 352, 325 338, 362 318 C 402 298, 448 278, 465 248 C 475 220, 482 178, 475 105 C 415 100, 312 85, 245 62 C 212 52, 195 48, 185 45 Z" 
                  fill="url(#oriente-grad)"
                  fillOpacity={hoveredRegion === "oriente" ? "0.95" : "0.78"}
                  stroke="#14b8a6" 
                  strokeWidth={hoveredRegion === "oriente" ? "2.5" : "1.2"} 
                  strokeLinejoin="round"
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredRegion("oriente")}
                  onMouseLeave={() => setHoveredRegion(null)}
                />

                {/* Projections Visual labels */}
                <text x="310" y="150" fill="#22c55e" fillOpacity="0.75" fontSize="11" fontWeight="bold" fontFamily="sans-serif" className="select-none tracking-wider pointer-events-none">
                  ORIENTE (AMAZONÍA)
                </text>
                <text x="148" y="274" fill="#fbbf24" fillOpacity="0.7" fontSize="10" fontWeight="bold" fontFamily="sans-serif" className="select-none tracking-wide pointer-events-none" transform="rotate(-90, 148, 274)">
                  SIERRA (ANDES)
                </text>
                <text x="96" y="160" fill="#10b981" fillOpacity="0.75" fontSize="11" fontWeight="bold" fontFamily="sans-serif" className="select-none tracking-wide pointer-events-none">
                  COSTA
                </text>

                {/* HEATMAP LAYER POINTS (Render radial glow shapes centered around coordinates) */}
                {mapMode === "heatmap" && filteredLocations.map((loc) => {
                  const isActive = selectedPin?.id === loc.id;
                  return (
                    <g 
                      key={`heat-${loc.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPin(loc);
                      }}
                      className="cursor-pointer group"
                    >
                      {/* Pulsing outer aura */}
                      <circle 
                        cx={loc.coords.x} 
                        cy={loc.coords.y} 
                        r={Math.min(45, 16 + (loc.weight / 10)) * (isActive ? 1.15 : 1)} 
                        fill="url(#heat-grad)" 
                        className={`animate-pulse transition-all duration-300 ${
                          isActive ? "opacity-100 scale-105" : "opacity-85 group-hover:opacity-100"
                        }`}
                        style={{ animationDuration: "1.8s" }}
                      />
                      
                      {/* Active highlight orbital ring */}
                      {isActive && (
                        <circle 
                          cx={loc.coords.x} 
                          cy={loc.coords.y} 
                          r={Math.min(45, 16 + (loc.weight / 10)) + 3} 
                          fill="none"
                          stroke="#fbbf24"
                          strokeWidth="1.2"
                          strokeDasharray="3 3"
                          className="animate-[spin_8s_linear_infinite]"
                        />
                      )}

                      {/* Central intensive density core */}
                      <circle 
                        cx={loc.coords.x} 
                        cy={loc.coords.y} 
                        r={isActive ? "6.5" : "5.5"} 
                        fill={isActive ? "#fbbf24" : "#ff004c"} 
                        stroke="#ffffff" 
                        strokeWidth={isActive ? "2.2" : "1.8"} 
                        filter="url(#glow-effect)"
                        className="transition-all duration-300 truncate"
                      />
                    </g>
                  );
                })}

                {/* PINS LAYER (Renders clickable custom icons) */}
                {mapMode === "pins" && filteredLocations.map((loc) => {
                  const isActive = selectedPin?.id === loc.id;
                  return (
                    <g 
                      key={`pin-${loc.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPin(loc);
                      }}
                      className="cursor-pointer group"
                    >
                      {/* Pulsing selection backing aura */}
                      <circle 
                        cx={loc.coords.x} 
                        cy={loc.coords.y} 
                        r={isActive ? "13" : "7"} 
                        className={`${isActive ? "fill-emerald-500/40 animate-ping" : "fill-emerald-500/25 group-hover:scale-125 transition-transform"}`}
                      />
                      
                      {/* Pine locator node */}
                      <circle 
                        cx={loc.coords.x} 
                        cy={loc.coords.y} 
                        r="4.5" 
                        fill={isActive ? "#00ff73" : "#ffffff"} 
                        stroke="#0f172a" 
                        strokeWidth="2.2"
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Floating detail popover on click */}
              {selectedPin && (() => {
                const pinDetails = filteredLocations.find(l => l.id === selectedPin.id) || selectedPin as any;
                if (!pinDetails || !pinDetails.coords) return null;
                
                const { x, y } = pinDetails.coords;
                // Smart boundary containment positioning
                const isRight = x > 250;
                const isBottom = y > 200;
                
                const leftX = `${(x / 500) * 100}%`;
                const topY = `${(y / 400) * 100}%`;
                
                const classification = pinDetails.classifications?.[0];
                const cat = classification?.recyclingCategory || "other";
                
                const badgeColors: Record<string, string> = {
                  plastic: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
                  glass: "bg-sky-500/20 text-sky-300 border-sky-500/30",
                  metal: "bg-amber-500/20 text-amber-300 border-amber-500/30",
                  paper: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
                  organic: "bg-lime-500/20 text-lime-300 border-lime-500/30",
                  hazardous: "bg-rose-500/20 text-rose-300 border-rose-500/30",
                  other: "bg-slate-500/20 text-slate-300 border-slate-500/30"
                };
                
                const catNames: Record<string, string> = {
                  plastic: "Plástico ♻️",
                  glass: "Vidrio 🍾",
                  metal: "Metal 🥫",
                  paper: "Papel/Cartón 📦",
                  organic: "Orgánico 🌱",
                  hazardous: "Peligroso ⚠️",
                  other: "Otro 🪵"
                };

                return (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: isBottom ? 10 : -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", damping: 15, stiffness: 150 }}
                    style={{
                      left: leftX,
                      top: topY,
                    }}
                    className={`absolute z-30 min-w-[210px] max-w-[240px] bg-slate-900/95 border border-white/10 p-3 rounded-2xl shadow-2xl backdrop-blur-md pointer-events-auto text-left flex flex-col gap-2.5 ${
                      isRight ? "-translate-x-full -ml-3" : "ml-3"
                    } ${
                      isBottom ? "-translate-y-full -mt-3" : "mt-3"
                    }`}
                  >
                    {/* Header of popover with closing button */}
                    <div className="flex items-center justify-between border-b border-white/5 pb-1.5 select-none">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${badgeColors[cat] || badgeColors.other}`}>
                        {catNames[cat] || "Residuo"}
                      </span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPin(null);
                        }}
                        className="text-slate-400 hover:text-white transition text-xs font-mono p-1 rounded hover:bg-white/15 leading-none cursor-pointer"
                        title="Cerrar detalles"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Main info section */}
                    <div className="flex gap-2.5 items-start">
                      {/* Thumbnail representation of the waste */}
                      <div className="w-14 h-14 rounded-lg bg-slate-950 border border-white/10 shrink-0 overflow-hidden flex items-center justify-center relative select-none">
                        {pinDetails.imageUrl && pinDetails.imageUrl !== "manual" ? (
                          <img 
                            src={pinDetails.imageUrl} 
                            alt={classification?.spanishMaterialName || "Residuo"} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          // Custom vector / illustrative fallback based on category
                          <div className="text-xl flex items-center justify-center h-full w-full bg-gradient-to-br from-white/10 via-white/5 to-transparent">
                            {cat === "plastic" && "🥤"}
                            {cat === "glass" && "🍾"}
                            {cat === "metal" && "🥫"}
                            {cat === "paper" && "📦"}
                            {cat === "organic" && "🍎"}
                            {cat === "hazardous" && "🔋"}
                            {cat === "other" && "🪵"}
                          </div>
                        )}
                      </div>

                      {/* Text descriptions */}
                      <div className="flex-1 min-w-0">
                        <h5 className="text-[11px] font-bold text-white truncate font-display leading-tight" title={classification?.spanishMaterialName}>
                          {classification?.spanishMaterialName || "Residuo detectado"}
                        </h5>
                        <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                          En {EC_PROVINCES.find(p => {
                            const dLat = Math.abs(p.lat - (pinDetails.location?.lat || 0));
                            const dLng = Math.abs(p.lng - (pinDetails.location?.lng || 0));
                            return dLat < 0.8 && dLng < 0.8;
                          })?.name.split(" ")[0] || "Ecuador"}
                        </p>
                        <div className="flex flex-col gap-0.5 mt-1">
                          <span className="text-[9.5px] text-emerald-400 font-bold font-mono">
                            ♻️ {classification?.co2OffsetEstimate || `Evita ${pinDetails.co2}g CO2`}
                          </span>
                          <span className="text-[8.5px] text-slate-300 font-medium">
                            ⚖️ Peso: {pinDetails.weight >= 1000 ? `${(pinDetails.weight / 1000).toFixed(2)} kg` : `${pinDetails.weight} g`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-[8.5px] text-slate-400 bg-slate-950/40 p-1.5 rounded-lg italic leading-normal border border-white/5 line-clamp-2">
                      {classification?.summaryText || "Reporte ecológico procesado por IA."}
                    </div>
                  </motion.div>
                );
              })()}
            </div>

            {/* Displaying instruction notification helper if history has zero locations */}
            {validScanLocations.length === 0 && (
              <div className="absolute inset-x-8 bottom-10 bg-slate-900/90 border border-emerald-500/20 rounded-2xl p-4 text-center select-none backdrop-blur-md">
                <SapoLogo className="w-9 h-9 mx-auto mb-2 animate-bounce" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-display">Ecomapa Vacío</h4>
                <p className="text-[10px] text-slate-300 mt-1 leading-relaxed">
                  ¿No tienes escaneos registrados aún? ¡No te preocupes! Usa la sección de abajo para simular avistamientos en las distintas provincias de inmediato.
                </p>
              </div>
            )}
          </div>

          <span className="text-[9px] font-mono text-slate-500 text-center select-none mt-2">
            Proyección cartográfica cónica aproximada del territorio ecuatoriano nacional.
          </span>
        </div>

        {/* Right Column: Simulated triggers & Province stats summaries (5 columns) */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-6 pointer-events-auto">
          
          {/* A. Dynamic Info Card showing selected Item attributes or national totals */}
          <div className="bg-slate-900/60 border border-white/5 p-4.5 rounded-3xl relative overflow-hidden flex-1 flex flex-col justify-between shadow-md">
            
            <AnimatePresence mode="wait">
              {selectedPin ? (
                <motion.div
                  key="selected"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4 flex-1 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono font-bold text-orange-400 uppercase bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        Detalles del Reporte
                      </span>
                      <button 
                        onClick={() => setSelectedPin(null)}
                        className="text-[10px] text-slate-400 hover:text-white cursor-pointer hover:underline"
                      >
                        Desmarcar
                      </button>
                    </div>

                    <h4 className="text-base font-bold font-display text-white">
                      {selectedPin.classifications[0].spanishMaterialName}
                    </h4>

                    <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                      {selectedPin.classifications[0].summaryText}
                    </p>

                    <div className="grid grid-cols-2 gap-2 pt-2.5">
                      <div className="bg-white/5 border border-white/5 rounded-xl p-2 flex flex-col">
                        <span className="text-[8px] text-slate-400 font-mono uppercase tracking-wider">Fecha-Hora</span>
                        <span className="text-[10px] text-stone-200 mt-0.5 truncate font-medium">
                          {new Date(selectedPin.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2 flex flex-col">
                        <span className="text-[8px] text-emerald-400 font-mono uppercase tracking-wider">CO₂ Mitigada</span>
                        <span className="text-[10px] text-emerald-300 mt-0.5 font-bold font-mono">
                          {Math.round(selectedPin.classifications[0].co2OffsetGrams || 100)}g CO2
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-emerald-950/20 border border-emerald-900/30 p-2.5 rounded-2xl flex items-start gap-2.5">
                    <span className="text-lg">🐸</span>
                    <p className="text-[10px] text-emerald-300 italic leading-relaxed">
                      "¡Vaya que ayudaste! Al registrar este residuo, evitamos que un contaminante degrade más fauna en nuestras provincias."
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="totals"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4 flex-1 flex flex-col justify-between min-h-[220px]"
                >
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 tracking-wider">
                      Reporte Consolidado Nacional
                    </span>
                    <h4 className="text-base font-black font-display text-white">
                      Resumen del Inventario Circular
                    </h4>
                    
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Ecuador centraliza su actividad aquí. Puedes tocar los marcadores en el mapa para ver la ficha ambiental o simular actividades.
                    </p>

                    <div className="grid grid-cols-2 gap-3 pt-3">
                      <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col justify-between">
                        <span className="text-[8px] font-mono uppercase text-slate-400 tracking-wide">Scans Totales</span>
                        <span className="text-xl font-bold text-white font-mono mt-1">{validScanLocations.length}</span>
                      </div>
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3 flex flex-col justify-between">
                        <span className="text-[8px] font-mono uppercase text-emerald-400 tracking-wide font-medium">CO₂ Evitado EC</span>
                        <span className="text-xl font-bold text-emerald-300 font-mono mt-1">
                          {Math.round(statsByRegion.totalCo2)}g
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-2xl border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[8px] text-slate-500 font-mono uppercase block">Sólidos recuperados</span>
                      <span className="text-xs font-bold text-emerald-400 font-mono mt-0.5">
                        {Math.round(statsByRegion.totalWeight / 1000 * 100) / 100} kg de residuos
                      </span>
                    </div>
                    <Leaf className="w-5 h-5 text-emerald-500 animate-pulse" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* B. Simular scans triggers list */}
          <div className="bg-slate-900/60 border border-white/5 p-4 rounded-3xl space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold uppercase tracking-wider font-mono text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                Simulador del Estudiante
              </span>
              {history.length > 0 && (
                <button
                  onClick={onClearHistory}
                  className="text-[9px] font-bold text-rose-450 hover:text-rose-400 hover:underline cursor-pointer transition flex items-center gap-1"
                  title="Borra todos los registros"
                >
                  <Trash2 className="w-2.5 h-2.5" /> Vaciar
                </button>
              )}
            </div>
            
            <p className="text-[10px] text-slate-300 leading-relaxed">
              Haz click en cualquiera de las provincias para simular un scan de residuo instantáneo y observar cómo evoluciona el mapa de calor:
            </p>

            {/* Quick trigger layout list */}
            <div className="grid grid-cols-2 md:grid-cols-2 gap-2 max-h-[140px] overflow-y-auto p-1 border border-white/5 rounded-xl bg-slate-950/40 custom-scrollbar select-none">
              {EC_PROVINCES.map((prov) => (
                <button
                  key={prov.name}
                  onClick={() => handleSimulateInProvince(prov)}
                  className="bg-slate-900 hover:bg-emerald-950/40 border border-white/5 hover:border-emerald-500/30 text-slate-300 hover:text-emerald-350 py-1.5 px-2 rounded-xl text-[10px] font-semibold text-left transition-all truncate flex items-center justify-between cursor-pointer group"
                >
                  <span className="truncate group-hover:translate-x-0.5 transition-transform">{prov.name}</span>
                  <Plus className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
