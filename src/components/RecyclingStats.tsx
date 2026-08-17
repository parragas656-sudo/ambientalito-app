import React, { useState } from "react";
import { ScanHistoryItem } from "../types";
import { Award, Leaf, Trash2, CheckCircle2, ChevronRight, BarChart3 } from "lucide-react";

interface RecyclingStatsProps {
  history: ScanHistoryItem[];
  onClearHistory: () => void;
  onSelectItem: (item: ScanHistoryItem) => void;
}

export default function RecyclingStats({ history, onClearHistory, onSelectItem }: RecyclingStatsProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  // Compute metrics across all classified items in all scans
  const totalScans = history.length;
  const allClassifications = history.flatMap((item) => item.classifications || []);
  const totalItemsClassified = allClassifications.length;
  
  const recyclableScans = allClassifications.filter((c) => c.recyclable).length;
  const recyclableRate = totalItemsClassified > 0 ? Math.round((recyclableScans / totalItemsClassified) * 100) : 0;

  // Compute total CO2 offset estimate
  let totalCo2Grams = 0;
  allClassifications.forEach((c) => {
    const text = c.co2OffsetEstimate || "";
    // Extract numbers, e.g., "120g", "300g"
    const match = text.match(/(\d+)/);
    if (match) {
      totalCo2Grams += parseInt(match[1], 10);
    } else if (text.toLowerCase().includes("evita") || text.toLowerCase().includes("ahorra")) {
      totalCo2Grams += 100; // general default estimate for items scanned
    }
  });

  const co2Display = totalCo2Grams >= 1000 
    ? `${(totalCo2Grams / 1000).toFixed(2)} kg` 
    : `${totalCo2Grams} g`;

  // Compute category distributions
  const categories: Record<string, { count: number; color: string; label: string }> = {
    plastic: { count: 0, color: "bg-blue-500", label: "Plástico" },
    glass: { count: 0, color: "bg-teal-500", label: "Vidrio" },
    metal: { count: 0, color: "bg-slate-500", label: "Metales" },
    paper: { count: 0, color: "bg-amber-500", label: "Papel/Cartón" },
    organic: { count: 0, color: "bg-emerald-500", label: "Orgánico" },
    hazardous: { count: 0, color: "bg-red-500", label: "Peligroso" },
    other: { count: 0, color: "bg-zinc-400", label: "Otros" },
  };

  allClassifications.forEach((c) => {
    const cat = c.recyclingCategory || "other";
    if (categories[cat]) {
      categories[cat].count++;
    } else {
      categories["other"].count++;
    }
  });

  const maxCount = Math.max(...Object.values(categories).map((c) => c.count), 1);

  return (
    <div className="space-y-6">
      {/* Environmental Impact Cards */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        <div className="bg-emerald-500/10 backdrop-blur-md rounded-2xl p-3 md:p-4 border border-emerald-500/20 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-emerald-300">CO₂ Reducido</span>
            <div className="p-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-300 shadow">
              <Leaf className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl md:text-2xl font-bold font-display text-white">{co2Display}</div>
            <p className="text-[10px] text-emerald-300/80 mt-1">Gases mitigados</p>
          </div>
        </div>

        <div className="bg-blue-500/10 backdrop-blur-md rounded-2xl p-3 md:p-4 border border-blue-500/20 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-blue-300">Reciclable</span>
            <div className="p-1.5 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 shadow">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl md:text-2xl font-bold font-display text-white">{recyclableRate}%</div>
            <p className="text-[10px] text-blue-300/80 mt-1">{recyclableScans} de {totalItemsClassified || 1} aptos</p>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3 md:p-4 border border-white/10 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-slate-300">Escaneos</span>
            <div className="p-1.5 bg-white/10 border border-white/10 rounded-lg text-slate-205 shadow">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl md:text-2xl font-bold font-display text-white">{totalScans}</div>
            <p className="text-[10px] text-slate-400 mt-1">Historial activo ({totalItemsClassified} items)</p>
          </div>
        </div>
      </div>

      {/* Category Breakdown list */}
      {totalScans > 0 && (
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-xl text-white">
          <h3 className="text-sm font-bold font-display text-white mb-4 flex items-center justify-between">
            <span>Distribución de Materiales</span>
            <span className="text-xs font-normal text-slate-400 font-mono">Tipos clasificados</span>
          </h3>
          <div className="space-y-3">
            {Object.entries(categories).map(([key, value]) => {
              const percentage = Math.round((value.count / (totalItemsClassified || 1)) * 100);
              if (value.count === 0) return null;

              return (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-slate-200">
                    <span className="flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${value.color}`} />
                      {value.label}
                    </span>
                    <span className="font-mono text-slate-400 font-normal">
                      {value.count} ({percentage}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${value.color}`} 
                      style={{ width: `${(value.count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick History List */}
      <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-xl text-white">
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-sm font-bold font-display text-white flex items-center gap-2">
            <span>Escaneos Recientes</span>
            <span className="bg-white/10 border border-white/15 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold">
              {totalScans}
            </span>
          </h3>
          {totalScans > 0 && (
            <div className="flex items-center gap-2">
              {isConfirming ? (
                <>
                  <span className="text-[11px] font-medium text-amber-300 animate-pulse font-sans select-none">
                    ¿Eliminar todo?
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onClearHistory();
                      setIsConfirming(false);
                    }}
                    className="text-[11px] text-red-400 hover:text-red-350 font-bold px-2 py-1 rounded bg-red-500/10 border border-red-500/20 cursor-pointer hover:bg-red-500/20 transition-all font-sans"
                  >
                    Sí, borrar
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsConfirming(false);
                    }}
                    className="text-[11px] text-slate-400 hover:text-slate-200 px-1.5 py-1 rounded cursor-pointer font-sans"
                  >
                    No
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsConfirming(true);
                  }}
                  className="text-xs text-red-400 hover:text-red-350 hover:underline flex items-center gap-1 cursor-pointer transition-all font-medium py-1 px-2.5 rounded-lg hover:bg-slate-50/5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Borrar todo
                </button>
              )}
            </div>
          )}
        </div>

        {totalScans === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <CheckCircle2 className="w-8 h-8 text-slate-500 mx-auto mb-2.5" />
            <p className="text-xs font-medium">El log está vacío</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Captura un residuo arriba para iniciar el historial</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5 max-h-[300px] overflow-y-auto custom-scrollbar">
            {history.map((item) => {
              const itemNames = item.classifications?.map((c) => c.spanishMaterialName).join(", ") || "Residuo detectado";
              const isRecyclable = item.classifications?.some((c) => c.recyclable) || false;
              const firstCat = item.classifications?.[0]?.recyclingCategory || "other";
              const catConfig = categories[firstCat] || categories["other"];
              
              let scanCo2 = 0;
              item.classifications?.forEach((c) => {
                const match = c.co2OffsetEstimate?.match(/(\d+)/);
                if (match) scanCo2 += parseInt(match[1], 10);
              });
              const offsetLabel = scanCo2 > 0 ? `Evita ${scanCo2}g CO2` : "Escaneo múltiple";

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectItem(item)}
                  className="w-full text-left px-5 py-3.5 hover:bg-white/5 active:bg-white/10 flex items-center gap-3.5 cursor-pointer group transition-all"
                >
                  <div className="w-11 h-11 rounded-lg border border-white/10 overflow-hidden shrink-0 relative flex items-center justify-center bg-slate-900 leading-none">
                    {item.imageUrl === "manual" ? (
                      <span className="text-md" role="img" aria-label="manual">🧮</span>
                    ) : (
                      <img 
                        src={item.imageUrl} 
                        alt={itemNames} 
                        className="w-full h-full object-cover animate-fade-in"
                        referrerPolicy="no-referrer"
                      />
                    )}
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${catConfig.color}`} />
                        <span className="text-xs font-mono font-medium text-slate-400 tracking-tight">
                          {item.classifications?.length === 1 ? catConfig.label : `${item.classifications?.length} residuos`}
                        </span>
                      </div>
                      {isRecyclable && (
                        <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/20 px-1.5 py-0.5 rounded leading-none">
                          Reciclable
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-emerald-400 transition leading-tight">
                      {itemNames}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-sans">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {offsetLabel}
                    </p>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-200 transform group-hover:translate-x-0.5 transition" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
