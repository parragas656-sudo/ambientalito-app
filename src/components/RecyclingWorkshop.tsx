import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Droplet, 
  HelpCircle, 
  Compass, 
  ArrowRight, 
  CheckCircle2, 
  ShieldAlert, 
  Trash2, 
  VolumeX, 
  Volume2,
  ThumbsUp,
  RotateCcw
} from "lucide-react";

// Web Audio API Retro Sound Effects Synthesizer
const playSynthSound = (type: "rinse" | "crush" | "cap" | "success" | "wrong" | "click", muted: boolean) => {
  if (muted) return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    if (type === "click") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(380, now);
      osc.frequency.exponentialRampToValueAtTime(750, now + 0.08);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === "rinse") {
      // Sloshing bubbly water sound using frequency sweeps
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(150 + Math.random() * 80, now);
      osc.frequency.linearRampToValueAtTime(400 + Math.random() * 200, now + 0.15);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === "crush") {
      // Loud plastic crunchy sound
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.type = "triangle";
      osc1.frequency.setValueAtTime(80, now);
      osc1.frequency.exponentialRampToValueAtTime(40, now + 0.2);
      
      osc2.type = "sawtooth";
      osc2.frequency.setValueAtTime(120, now);
      osc2.frequency.setValueAtTime(60, now + 0.1);
      
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.25);
      osc2.stop(now + 0.25);
    } else if (type === "cap") {
      // Tight wooden snap
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.setValueAtTime(150, now + 0.05);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === "wrong") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(100, now + 0.35);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === "success") {
      // Success melody
      const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.05, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.18);
      });
    }
  } catch (e) {
    console.warn("AudioContext failed:", e);
  }
};

interface StepInfo {
  title: string;
  instruction: string;
  actionType: "rinse" | "crush" | "cap" | "uncap" | "fold_lid" | "sort" | "skip";
  helpTip: string;
}

interface WorkshopItem {
  id: string;
  name: string;
  icon: string;
  category: "plastic" | "glass" | "metal";
  binColor: string;
  binIcon: string;
  binName: string;
  initialState: {
    cleanPercent: number; // 0 to 100
    isCrushed: boolean;
    isCapped: boolean;
    lidIsFolded?: boolean;
  };
  steps: StepInfo[];
}

const WORKSHOP_ITEMS: WorkshopItem[] = [
  {
    id: "pet_bottle",
    name: "Refresco Pepito (Botella plástico PET)",
    icon: "🥤",
    category: "plastic",
    binColor: "bg-blue-500",
    binIcon: "🔵",
    binName: "Contenedor Azul (Plásticos)",
    initialState: {
      cleanPercent: 20,
      isCrushed: false,
      isCapped: false,
    },
    steps: [
      {
        title: "Paso 1: Destapar",
        instruction: "La botella tiene su tapa puesta suelta. Haz clic en la tapa para quitarla y poder enjuagarla por dentro.",
        actionType: "uncap",
        helpTip: "¡Excelente! Siempre destapamos para poder lavar el interior de los envases adecuadamente.",
      },
      {
        title: "Paso 2: Enjuagar",
        instruction: "Mantén presionado el grifo de agua limpia para remover los restos de refresco dulce y pegajoso.",
        actionType: "rinse",
        helpTip: "¡Enjuagado al 100%! El azúcar residual atrae plagas y pudre los cargamentos de reciclaje.",
      },
      {
        title: "Paso 3: Compactar",
        instruction: "¡Aplasta la botella! Haz clic repetidamente para desinflarla y reducir su volumen.",
        actionType: "crush",
        helpTip: "¡Botella aplastada! Compactar reduce un 70% el volumen para optimizar el transporte.",
      },
      {
        title: "Paso 4: Roscar Tapa",
        instruction: "Haz clic en la tapa plástica limpia para colocarla de nuevo. Así la botella aplastada no se vuelve a inflar.",
        actionType: "cap",
        helpTip: "¡Tapada y segura! Las tapas plásticas también se reciclan y evitan que la botella recupere aire.",
      },
      {
        title: "Paso 5: Clasificar",
        instruction: "Arrastra o toca el contenedor azul correspondiente para depositar tu botella plástica PET en su lugar.",
        actionType: "sort",
        helpTip: "¡Ecológico! Los plásticos van al azul para ser triturados y fundidos en nuevas botellas.",
      }
    ]
  },
  {
    id: "glass_beer",
    name: "Mermelada Lupita (Frasco de Vidrio)",
    icon: "🍾",
    category: "glass",
    binColor: "bg-teal-500",
    binIcon: "🟢",
    binName: "Contenedor Verde (Vidrio templado/Mermeladas)",
    initialState: {
      cleanPercent: 10,
      isCrushed: false,
      isCapped: true,
    },
    steps: [
      {
        title: "Paso 1: Quitar la tapa",
        instruction: "¡Atención! Este frasco tiene una tapa de metal. Gírala haciendo clic sobre ella para separarla.",
        actionType: "uncap",
        helpTip: "¡Separada! El vidrio y el metal se funden a temperaturas muy diferentes, por lo que van en contenedores separados.",
      },
      {
        title: "Paso 2: Enjuagar",
        instruction: "Mantén presionado el grifo de agua para lavar la mermelada acumulada al fondo.",
        actionType: "rinse",
        helpTip: "¡Brillante y limpio! El vidrio limpio se funde infinitas veces sin perder calidad ni pureza.",
      },
      {
        title: "Paso 3: Compactar (¡Peligro!)",
        instruction: "¡Cuidado! El Vidrio NO se aplasta. Haz clic para avanzar de forma segura.",
        actionType: "skip",
        helpTip: "¡Exacto! El vidrio es muy frágil. Intentar aplastarlo es peligroso porque puede romperse, causar heridas o cortar a los recicladores.",
      },
      {
        title: "Paso 4: Clasificar envases",
        instruction: "Deposita el frasco de vidrio limpio sin tapa en el contenedor verde, y recuerda que la tapa metálica irá al contenedor de metales.",
        actionType: "sort",
        helpTip: "¡Fantástico! Vidrio limpio en contenedor verde. ¡Listo para convertirse en un nuevo vaso de vidrio de forma infinita!",
      }
    ]
  },
  {
    id: "tin_can",
    name: "Manolo la Conserva (Lata metálica)",
    icon: "🥫",
    category: "metal",
    binColor: "bg-slate-500",
    binIcon: "⚫",
    binName: "Contenedor Gris/Negro (Metales)",
    initialState: {
      cleanPercent: 30,
      isCrushed: false,
      isCapped: true, // stands for lid attached
      lidIsFolded: false,
    },
    steps: [
      {
        title: "Paso 1: Enjuagar",
        instruction: "Mantén presionado el grifo para quitar los restos aceitosos de salsa de atún.",
        actionType: "rinse",
        helpTip: "¡Súper limpia! Remover grasa metálica permite fundidos uniformes sin emitir humos tóxicos.",
      },
      {
        title: "Paso 2: Doblar tapa filosa",
        instruction: "La tapa de metal cortada está suelta y es filosa. Haz clic en ella para doblarla hacia adentro de forma segura. ",
        actionType: "fold_lid",
        helpTip: "¡Tapa plegada! Plegar la tapa filosa hacia adentro previene que los operarios se corten las manos al clasificarla.",
      },
      {
        title: "Paso 3: Compactar",
        instruction: "Haz clic en la lata repetidas veces para aplastar su cuerpo de aluminio/acero lateralmente.",
        actionType: "crush",
        helpTip: "¡Lata compactada! Ahora ocupa muy poco espacio y está lista para el imán separador.",
      },
      {
        title: "Paso 4: Clasificar",
        instruction: "Envía la lata compactada de forma segura al contenedor gris de metales.",
        actionType: "sort",
        helpTip: "¡Gran trabajo! El acero y aluminio se refunden para fabricar piezas de autos, bicicletas o nuevas latas de conserva.",
      }
    ]
  }
];

export default function RecyclingWorkshop({ 
  onPurityChange, 
  onRewardStars 
}: { 
  onPurityChange: (newPurity: number) => void;
  onRewardStars: (amount: number) => void;
}) {
  const [muted, setMuted] = useState<boolean>(() => {
    return localStorage.getItem("ambientalito_muted") === "true";
  });
  
  const [activeItemIndex, setActiveItemIndex] = useState<number>(0);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  
  // Running material states
  const [cleanPercent, setCleanPercent] = useState<number>(20);
  const [isCapped, setIsCapped] = useState<boolean>(true);
  const [isCrushed, setIsCrushed] = useState<boolean>(false);
  const [lidIsFolded, setLidIsFolded] = useState<boolean>(false);
  const [crushClicks, setCrushClicks] = useState<number>(0);
  const [isSquishing, setIsSquishing] = useState<boolean>(false);
  
  const [isRinsing, setIsRinsing] = useState<boolean>(false);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string>("");
  const [gameFinished, setGameFinished] = useState<boolean>(false);
  const [purityRewardAdded, setPurityRewardAdded] = useState<boolean>(false);

  // Load selected item
  const selectedItem = WORKSHOP_ITEMS[activeItemIndex] || WORKSHOP_ITEMS[0];
  const stepToUse = selectedItem.steps[currentStepIndex] ? currentStepIndex : 0;
  const currentStep = selectedItem.steps[stepToUse];

  // Sync state with selected item initial attributes on switch
  useEffect(() => {
    setCleanPercent(selectedItem.initialState.cleanPercent);
    setIsCapped(selectedItem.initialState.isCapped);
    setIsCrushed(selectedItem.initialState.isCrushed);
    setLidIsFolded(selectedItem.initialState.lidIsFolded || false);
    setCrushClicks(0);
    setCurrentStepIndex(0);
    setShowExplanation(false);
    setFeedbackMsg("");
    setGameFinished(false);
    setPurityRewardAdded(false);
  }, [activeItemIndex]);

  // Rinse Interval
  useEffect(() => {
    let interval: any = null;
    if (isRinsing) {
      interval = setInterval(() => {
        setCleanPercent((prev) => {
          if (prev >= 100) {
            setIsRinsing(false);
            playSynthSound("success", muted);
            setFeedbackMsg(currentStep.helpTip);
            setShowExplanation(true);
            return 100;
          }
          playSynthSound("rinse", muted);
          return Math.min(100, prev + 10);
        });
      }, 150);
    }
    return () => clearInterval(interval);
  }, [isRinsing, currentStepIndex, muted]);

  const handleNextStep = () => {
    playSynthSound("click", muted);
    setShowExplanation(false);
    setFeedbackMsg("");

    if (currentStepIndex < selectedItem.steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      // Finished recycling this item!
      setGameFinished(true);
      playSynthSound("success", muted);
      
      // Award Stars
      onRewardStars(25);
      
      // Boost Pond Purity!
      onPurityChange(15);
    }
  };

  const handleUncapAction = () => {
    setIsCapped(false);
    playSynthSound("cap", muted);
    setFeedbackMsg(currentStep.helpTip);
    setShowExplanation(true);
  };

  const handleCapAction = () => {
    setIsCapped(true);
    playSynthSound("cap", muted);
    setFeedbackMsg(currentStep.helpTip);
    setShowExplanation(true);
  };

  const handleFoldLidAction = () => {
    setLidIsFolded(true);
    playSynthSound("cap", muted);
    setFeedbackMsg(currentStep.helpTip);
    setShowExplanation(true);
  };

  const handleCrushAction = () => {
    setIsSquishing(true);
    setTimeout(() => setIsSquishing(false), 120);

    if (crushClicks < 4) {
      setCrushClicks((prev) => prev + 1);
      playSynthSound("crush", muted);
    } else {
      setIsCrushed(true);
      playSynthSound("success", muted);
      setFeedbackMsg(currentStep.helpTip);
      setShowExplanation(true);
    }
  };

  const handleSkipAction = () => {
    playSynthSound("success", muted);
    setFeedbackMsg(currentStep.helpTip);
    setShowExplanation(true);
  };

  const handleSortAction = () => {
    playSynthSound("success", muted);
    setFeedbackMsg(currentStep.helpTip);
    setShowExplanation(true);
  };

  const resetItem = () => {
    playSynthSound("click", muted);
    setCleanPercent(selectedItem.initialState.cleanPercent);
    setIsCapped(selectedItem.initialState.isCapped);
    setIsCrushed(selectedItem.initialState.isCrushed);
    setLidIsFolded(selectedItem.initialState.lidIsFolded || false);
    setCrushClicks(0);
    setCurrentStepIndex(0);
    setShowExplanation(false);
    setFeedbackMsg("");
    setGameFinished(false);
  };

  // Switch between items
  const handleItemSelect = (index: number) => {
    playSynthSound("click", muted);
    setActiveItemIndex(index);
  };

  return (
    <div className="bg-amber-50 text-slate-950 border-4 border-slate-900 rounded-[32px] p-5 space-y-6 shadow-[6px_6px_0px_rgba(15,23,42,1)] relative overflow-hidden">
      <div className="absolute inset-0 bg-[#e67e22]/5 bg-[size:8px_8px] pointer-events-none z-0" />

      {/* TOP INSTRUCTION BAR */}
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b-2 border-dashed border-slate-900">
        <div>
          <span className="text-[9px] font-black text-rose-800 bg-rose-100 border-2 border-slate-900 px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-[1.5px_1.5px_0px_rgba(15,23,42,1)] inline-block mb-1">
            🔧 TALLER DE ECO-PREPARACIÓN
          </span>
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest font-sans leading-tight">
            ¿Cómo debemos reciclar correctamente?
          </h3>
          <p className="text-[10px] font-bold text-slate-600">
            Aprende a lavar, compactar, tapar y clasificar restos para proteger la laguna de Ambientalito. 🐸✨
          </p>
        </div>

        {/* Local Volume Toggle */}
        <button
          onClick={() => {
            const nextMute = !muted;
            setMuted(nextMute);
            localStorage.setItem("ambientalito_muted", nextMute.toString());
            playSynthSound("click", nextMute);
          }}
          type="button"
          className="w-8 h-8 rounded-xl bg-white border-2 border-slate-900 flex items-center justify-center hover:bg-slate-50 shadow-[1.5px_1.5px_0px_rgba(15,23,42,1)] active:translate-x-0.5 active:translate-y-0.5 self-end md:self-auto"
        >
          {muted ? <VolumeX className="w-3.5 h-3.5 text-red-500" /> : <Volume2 className="w-3.5 h-3.5 text-slate-700" />}
        </button>
      </div>

      {/* CHOOSE MATERIAL SHELF */}
      <div className="relative z-10 space-y-2">
        <span className="text-[8px] font-black text-slate-400 block uppercase tracking-wider">
          Selecciona un residuo sucio para preparar en la mesa de laboratorio:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {WORKSHOP_ITEMS.map((item, idx) => {
            const isSelected = idx === activeItemIndex;
            return (
              <button
                key={item.id}
                onClick={() => handleItemSelect(idx)}
                type="button"
                className={`flex items-center gap-2 p-3 border-4 rounded-2xl text-left transition-all ${
                  isSelected 
                    ? "bg-yellow-400 border-slate-800 shadow-[3px_3px_0px_rgba(15,23,42,1)] scale-[1.02]" 
                    : "bg-white hover:bg-slate-50 border-slate-900 shadow-[1.5px_1.5px_0px_rgba(15,23,42,1)]"
                }`}
              >
                <span className="text-2xl bg-slate-100 rounded-xl px-1.5 py-1 border-2 border-slate-900 shadow-[1px_1px_0px_rgba(0,0,0,1)] select-none">
                  {item.icon}
                </span>
                <div className="min-w-0">
                  <h4 className="text-[11px] font-black text-slate-900 truncate leading-tight">
                    {item.name}
                  </h4>
                  <span className="text-[8px] font-semibold text-slate-500">
                    Clase: {item.category === "plastic" ? "Plástico" : item.category === "glass" ? "Vidrio" : "Metal"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* THE WORKBENCH LABORATORY */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* VISUAL WRAPPER CARD - 5 COLS */}
        <div id="workbench-visual-stage" className="lg:col-span-5 bg-gradient-to-b from-stone-800 to-stone-900 border-4 border-slate-900 rounded-[28px] p-4 flex flex-col items-center justify-between min-h-[300px] relative shadow-[4px_4px_0px_rgba(15,23,42,1)] overflow-hidden">
          <div className="absolute inset-0 bg-black/10 pointer-events-none z-0 bg-[radial-gradient(#ffffff_10%,transparent_10%)] bg-[size:16px_16px] opacity-5" />
          
          {/* Header info */}
          <div className="w-full flex justify-between items-center z-10">
            <span className="text-[8px] font-black text-white bg-slate-700/80 border-2 border-slate-900 px-2 py-0.5 rounded-full uppercase tracking-widest shadow-sm">
              🔬 LABORATORIO RECICLA
            </span>
            <span className="text-[9px] font-mono text-yellow-300 font-extrabold">
              Estado: {gameFinished ? "Listo 💚" : "Preparando ⚙️"}
            </span>
          </div>

          {/* FAUCET SYSTEM */}
          {currentStep.actionType === "rinse" && (
            <div className="absolute top-[34px] left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
              {/* El grifo/llave de agua interactivo */}
              <motion.button
                onPointerDown={() => setIsRinsing(true)}
                onPointerUp={() => setIsRinsing(false)}
                onPointerLeave={() => setIsRinsing(false)}
                onTouchStart={() => setIsRinsing(true)}
                onTouchEnd={() => setIsRinsing(false)}
                animate={isRinsing ? { scale: 0.95 } : { scale: [1, 1.05, 1] }}
                transition={isRinsing ? { duration: 0.1 } : { repeat: Infinity, duration: 1.5 }}
                className={`w-14 h-14 rounded-full bg-cyan-500 border-4 border-slate-900 flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.3)] cursor-pointer select-none touch-manipulation active:bg-cyan-600 relative overflow-visible ${
                  isRinsing ? "ring-4 ring-yellow-400" : "animate-pulse"
                }`}
                title="Mantén pulsado para lavar"
              >
                <span className="text-3xl select-none">🚰</span>
                
                {/* Indicación flotante para pulsar */}
                {!isRinsing && (
                  <span className="absolute -bottom-8 bg-yellow-400 border-2 border-slate-900 text-[8px] font-black text-slate-800 px-1.5 py-0.5 rounded shadow whitespace-nowrap animate-bounce leading-none">
                    👉 MANTÉN PRESIONADO AQUÍ CON EL DEDO
                  </span>
                )}
              </motion.button>

              {/* Animación del chorro de agua limpia */}
              {isRinsing && (
                <div className="flex flex-col items-center pointer-events-none mt-1">
                  <div className="w-2.5 bg-sky-300/80 h-28 animate-pulse border-x border-cyan-400" />
                  <div className="flex gap-1">
                    <span className="text-xs animate-ping">🫧</span>
                    <span className="text-sm animate-bounce text-sky-200">💧</span>
                    <span className="text-xs animate-ping">🫧</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* THE SECT CONTAINER MATERIAL ITEM DESIGN REPRESENTATION */}
          <div className="my-auto relative flex flex-col items-center justify-center min-h-[200px] z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${selectedItem.id}-${isCrushed}-${isCapped}-${cleanPercent}`}
                initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative flex flex-col items-center"
              >
                 {/* 1. Plastico bottle representation */}
                 {selectedItem.id === "pet_bottle" && (
                   <div className="relative flex flex-col items-center animate-fade-in">
                     {/* Bottle cap floating or on top */}
                     {isCapped ? (
                       <motion.button 
                         onClick={currentStep.actionType === "uncap" ? handleUncapAction : undefined}
                         onPointerDown={currentStep.actionType === "uncap" ? handleUncapAction : undefined}
                         onTouchStart={currentStep.actionType === "uncap" ? handleUncapAction : undefined}
                         animate={currentStep.actionType === "uncap" ? { scale: [1, 1.1, 1], rotate: [0, -3, 3, 0] } : {}}
                         transition={currentStep.actionType === "uncap" ? { repeat: Infinity, duration: 1.5 } : {}}
                         className="w-16 h-10 -my-3 z-30 outline-none flex items-center justify-center relative touch-manipulation cursor-pointer"
                       >
                         {/* El tapón visual ampliado para dedos grandes */}
                         <div className={`w-11 h-4 bg-blue-600 rounded-lg border-2 border-slate-900 shadow-sm flex items-center justify-center transition-all ${
                           currentStep.actionType === "uncap" ? "ring-4 ring-yellow-400 active:bg-blue-700 animate-pulse" : ""
                         }`}>
                           <span className="text-[6.5px] font-black text-white pointer-events-none">TAPA</span>
                         </div>
                         {currentStep.actionType === "uncap" && (
                           <span className="absolute -top-7 bg-yellow-400 border-2 border-slate-900 text-[8px] font-black text-slate-900 px-1.5 py-0.5 rounded shadow whitespace-nowrap animate-bounce leading-none">
                             👉 ¡PÚLSA CON EL DEDO!
                           </span>
                         )}
                       </motion.button>
                     ) : (
                       <div className="w-16 h-4 relative flex items-center justify-center">
                         {/* Cap lying dirty side */}
                         <motion.button 
                           onClick={currentStep.actionType === "cap" ? handleCapAction : undefined}
                           onPointerDown={currentStep.actionType === "cap" ? handleCapAction : undefined}
                           onTouchStart={currentStep.actionType === "cap" ? handleCapAction : undefined}
                           className="absolute -top-16 -left-16 text-3xl select-none z-30 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] focus:outline-none bg-transparent border-0 p-2 cursor-pointer touch-manipulation hover:scale-110 active:scale-95 flex items-center justify-center"
                           title="Tapa plástica suelta"
                         >
                           <span className="relative flex flex-col items-center">
                             {/* Un tapón plástico azul 3D diseñado con Tailwind */}
                             <div className="w-12 h-8 bg-blue-600 rounded-lg border-2 border-slate-900 shadow-md flex flex-col items-center justify-center relative hover:bg-blue-700 active:scale-95 transition-all p-0.5">
                               <div className="w-9 h-1.5 bg-blue-400 rounded-sm border-b border-blue-700 mb-0.5" />
                               <span className="text-[7.5px] font-black text-white leading-none uppercase tracking-tight">TAPA PET</span>
                             </div>
                             {currentStep.actionType === "cap" && (
                               <span className="absolute -top-8 bg-yellow-400 border-2 border-slate-900 text-[8px] font-black text-slate-900 px-1.5 py-0.5 rounded shadow whitespace-nowrap animate-bounce leading-none">
                                 👉 ¡TAPAR CON EL DEDO!
                               </span>
                             )}
                           </span>
                         </motion.button>
                       </div>
                     )}

                     {/* Bottleneck mouth */}
                     <div 
                       onClick={currentStep.actionType === "cap" ? handleCapAction : undefined}
                       onPointerDown={currentStep.actionType === "cap" ? handleCapAction : undefined}
                       onTouchStart={currentStep.actionType === "cap" ? handleCapAction : undefined}
                       className={`w-10 h-6 -mb-2 z-10 transition-colors flex items-center justify-center ${
                         currentStep.actionType === "cap" ? "cursor-pointer bg-yellow-250 animate-pulse ring-4 ring-yellow-400" : "bg-sky-200/50"
                       } border-x-2 border-t-2 border-slate-900`} 
                     >
                       {currentStep.actionType === "cap" && (
                         <span className="text-[6px] font-black text-yellow-900 animate-ping">🕳️</span>
                       )}
                     </div>

                     {/* Bottle body */}
                     <motion.div
                       onClick={currentStep.actionType === "crush" ? handleCrushAction : undefined}
                       onPointerDown={currentStep.actionType === "crush" ? handleCrushAction : undefined}
                       onTouchStart={currentStep.actionType === "crush" ? handleCrushAction : undefined}
                       animate={
                         isCrushed 
                           ? { scaleY: 0.45, scaleX: 1.3, rotate: 3 } 
                           : isSquishing 
                             ? { scaleY: 0.75, scaleX: 1.15 } 
                             : { scaleY: 1, scaleX: 1 }
                       }
                       transition={{ type: "spring", stiffness: 350, damping: 15 }}
                       className={`w-20 h-32 border-4 border-slate-900 origin-bottom rounded-t-xl rounded-b-2xl flex flex-col items-center justify-between p-1.5 shadow-inner transition-colors duration-500 relative select-none touch-manipulation ${
                         cleanPercent >= 90 ? "bg-sky-200/20" : "bg-yellow-900/40"
                       } ${currentStep.actionType === "crush" && !isCrushed ? "cursor-pointer hover:brightness-105 ring-4 ring-amber-400 active:scale-95" : ""}`}
                     >
                       {currentStep.actionType === "crush" && !isCrushed && (
                         <span className="absolute -top-9 bg-amber-400 border-2 border-slate-900 text-[8.5px] font-black text-slate-900 px-2 py-0.5 rounded shadow whitespace-nowrap animate-bounce leading-none z-15">
                           👉 ¡TOCA LA BOTELLA REPETIDAMENTE!
                         </span>
                       )}
                       {/* Soda residue spots */}
                      {cleanPercent < 90 && (
                        <div className="absolute inset-0 bg-yellow-950/25 blur-sm rounded-lg m-2 pointer-events-none flex flex-col items-center justify-center">
                          <span className="text-[10px] text-amber-950 font-black tracking-widest opacity-80 uppercase bg-yellow-500/20 px-1 rounded">SUCIO 🤢</span>
                        </div>
                      )}

                      {/* Sparkles on clean */}
                      {cleanPercent >= 100 && (
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                          <span className="text-xl animate-pulse">✨</span>
                        </div>
                      )}

                      {/* Brand Label */}
                      <div className="w-full bg-blue-500 border-2 border-slate-900 py-1 rounded text-center shadow-sm select-none">
                        <span className="text-[8px] font-black text-white uppercase block leading-none">PEPETO PET</span>
                        <span className="text-[6px] font-bold text-blue-100 block mt-0.5 font-mono">100% Reciclable</span>
                      </div>

                      {/* Water Volume status bar interior */}
                      <div className="w-full h-4 bg-sky-300/40 border border-slate-900/50 rounded-md overflow-hidden relative">
                        <div 
                          className="h-full bg-cyan-400/80 transition-all duration-300" 
                          style={{ width: `${cleanPercent}%` }}
                        />
                        <span className="absolute inset-0 flex items-center justify-center text-[6.5px] font-black text-slate-800">
                          LIMPIEZA: {cleanPercent}%
                        </span>
                      </div>
                    </motion.div>
                  </div>
                )}

                {/* 2. Glass Jar representation */}
                {selectedItem.id === "glass_beer" && (
                  <div className="relative flex flex-col items-center">
                    {/* Metal cap on top or separate */}
                    {isCapped ? (
                      <motion.button 
                        onClick={currentStep.actionType === "uncap" ? handleUncapAction : undefined}
                        onPointerDown={currentStep.actionType === "uncap" ? handleUncapAction : undefined}
                        onTouchStart={currentStep.actionType === "uncap" ? handleUncapAction : undefined}
                        animate={currentStep.actionType === "uncap" ? { scale: [1, 1.1, 1], rotate: [0, -3, 3, 0] } : {}}
                        transition={currentStep.actionType === "uncap" ? { repeat: Infinity, duration: 1.5 } : {}}
                        className={`w-12 h-3.5 bg-yellow-500 rounded-t-md border-2 border-slate-900 z-20 shadow text-[6px] flex items-center justify-center text-amber-955 font-black outline-none relative touch-manipulation ${
                          currentStep.actionType === "uncap" ? "cursor-pointer ring-4 ring-yellow-400 active:bg-yellow-600 animate-pulse" : ""
                        }`}
                      >
                        <span>METAL</span>
                        {currentStep.actionType === "uncap" && (
                          <span className="absolute -top-7 bg-yellow-400 border-2 border-slate-900 text-[8px] font-black text-slate-900 px-1.5 py-0.5 rounded shadow whitespace-nowrap animate-bounce leading-none">
                            👉 ¡PÚLSA CON EL DEDO!
                          </span>
                        )}
                      </motion.button>
                    ) : (
                      <div className="h-0 w-12 relative">
                        <motion.button
                          onClick={currentStep.actionType === "cap" ? handleCapAction : undefined}
                          onPointerDown={currentStep.actionType === "cap" ? handleCapAction : undefined}
                          onTouchStart={currentStep.actionType === "cap" ? handleCapAction : undefined}
                          className="absolute -top-14 -left-14 text-2xl select-none z-30 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] bg-transparent border-0 p-0 cursor-pointer touch-manipulation"
                          title="Tapa metálica separada"
                        >
                          <span className="relative flex flex-col items-center">
                            {/* Chapa metálica dorada de diseño 3D */}
                            <div className="w-12 h-8 bg-amber-500 rounded-lg border-2 border-slate-900 shadow-md flex flex-col items-center justify-center relative hover:bg-amber-600 active:scale-95 transition-all p-0.5">
                              <div className="w-9 h-1.5 bg-amber-300 rounded-sm border-b border-amber-600 mb-0.5" />
                              <span className="text-[7.5px] font-black text-slate-900 leading-none uppercase tracking-tight">TAPA METAL</span>
                            </div>
                            {currentStep.actionType === "cap" && (
                              <span className="absolute -top-8 bg-yellow-400 border-2 border-slate-900 text-[8px] font-black text-slate-900 px-1.5 py-0.5 rounded shadow whitespace-nowrap animate-bounce leading-none">
                                👉 ¡TAPAR CON EL DEDO!
                              </span>
                            )}
                          </span>
                        </motion.button>
                      </div>
                    )}

                    {/* Jar neck */}
                    <div className="w-8 h-3.5 bg-emerald-150/40 border-x-2 border-t-2 border-slate-900 z-10" />

                    {/* Jar jar body */}
                    <div
                      className={`w-24 h-28 border-4 border-slate-900 rounded-3xl flex flex-col items-center justify-between p-2 shadow-inner transition-colors duration-500 relative ${
                        cleanPercent >= 90 ? "bg-teal-200/20" : "bg-red-950/40"
                      }`}
                    >
                      {/* Jam dark residue */}
                      {cleanPercent < 90 && (
                        <div className="absolute inset-x-2 bottom-2 h-1/2 bg-red-800/60 blur-sm rounded-lg pointer-events-none flex flex-col items-center justify-center">
                          <span className="text-[8px] bg-red-100 text-red-900 px-1 py-0.5 rounded font-black tracking-widest uppercase">MERMELADA 🍓</span>
                        </div>
                      )}

                      {/* Sparkles */}
                      {cleanPercent >= 100 && (
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                          <span className="text-xl animate-spin">✨</span>
                        </div>
                      )}

                      {/* Logo tag */}
                      <div className="w-16 bg-white/90 border border-slate-900 py-0.5 rounded shadow-sm text-center select-none mt-2">
                        <span className="text-[7px] font-black text-rose-800 uppercase block leading-none">LUPITA GLAS</span>
                      </div>

                      {/* Cleanliness bar */}
                      <div className="w-full h-3 bg-teal-300/20 border border-slate-900/50 rounded-md overflow-hidden relative mt-auto">
                        <div 
                          className="h-full bg-emerald-400/80 transition-all duration-300" 
                          style={{ width: `${cleanPercent}%` }}
                        />
                        <span className="absolute inset-0 flex items-center justify-center text-[6px] font-extrabold text-slate-900 leading-none">
                          LAVADO: {cleanPercent}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Tin Can representation */}
                {selectedItem.id === "tin_can" && (
                  <div className="relative flex flex-col items-center">
                    
                    {/* Metal sharp lid */}
                    {isCapped && (
                      <motion.button 
                        onClick={currentStep.actionType === "fold_lid" && !lidIsFolded ? handleFoldLidAction : undefined}
                        onPointerDown={currentStep.actionType === "fold_lid" && !lidIsFolded ? handleFoldLidAction : undefined}
                        onTouchStart={currentStep.actionType === "fold_lid" && !lidIsFolded ? handleFoldLidAction : undefined}
                        animate={lidIsFolded 
                          ? { rotateX: 90, y: 4, scaleX: 0.9 } 
                          : (currentStep.actionType === "fold_lid" ? { scale: [1, 1.05, 1], rotate: [-1, 2, -1] } : { rotate: [-1, 2, -1] })
                        }
                        transition={lidIsFolded ? {} : { repeat: Infinity, duration: 2 }}
                        className={`w-18 h-4 border-2 border-slate-900 z-20 bg-slate-400 rounded-t-full shadow relative flex items-center justify-center outline-none touch-manipulation ${
                          currentStep.actionType === "fold_lid" && !lidIsFolded ? "cursor-pointer ring-4 ring-yellow-400 active:bg-slate-500" : ""
                        }`}
                      >
                        <span className="text-[5px] font-black text-white tracking-widest uppercase">
                          {lidIsFolded ? "PLEGADO" : "⚠️ TAPA FILOSA"}
                        </span>
                        {currentStep.actionType === "fold_lid" && !lidIsFolded && (
                          <span className="absolute -top-7 bg-yellow-400 border-2 border-slate-900 text-[8px] font-black text-slate-900 px-1.5 py-0.5 rounded shadow whitespace-nowrap animate-bounce leading-none overflow-visible">
                            👉 ¡PLEGAR CON EL DEDO!
                          </span>
                        )}
                      </motion.button>
                    )}

                    {/* Can cylindrical body */}
                    <motion.div
                      animate={isCrushed ? { scaleY: 0.4, scaleX: 1.2, skewX: 5 } : {}}
                      className={`w-20 h-28 border-4 border-slate-900 rounded-xl flex flex-col items-center justify-between p-2 shadow-inner transition-colors duration-500 relative ${
                        cleanPercent >= 90 ? "bg-slate-300" : "bg-amber-900/40"
                      }`}
                    >
                      {/* Oil tomato rest */}
                      {cleanPercent < 90 && (
                        <div className="absolute inset-1 m-1 bg-amber-950/40 rounded-lg blur-xs pointer-events-none flex flex-col items-center justify-center">
                          <span className="text-[9px] bg-yellow-400 text-slate-950 px-1 rounded font-black tracking-wider uppercase">GRASA 🥫</span>
                        </div>
                      )}

                      {/* Sparkles */}
                      {cleanPercent >= 100 && (
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                          <span className="text-xl">⭐</span>
                        </div>
                      )}

                      {/* Brand label wrapper */}
                      <div className="w-full bg-slate-700 text-stone-200 border border-slate-950 py-1 rounded text-center leading-none">
                        <span className="text-[8px] font-black uppercase">MANOLO ATÚN</span>
                      </div>

                      {/* Cleanliness progress bar inside */}
                      <div className="w-full h-3 bg-slate-200/50 border border-slate-900/40 rounded overflow-hidden relative">
                        <div 
                          className="h-full bg-blue-400 transition-all duration-300" 
                          style={{ width: `${cleanPercent}%` }}
                        />
                        <span className="absolute inset-0 flex items-center justify-center text-[6px] font-black text-slate-800">
                          SALSAS: {100 - cleanPercent}%
                        </span>
                      </div>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Simulated Workbench shadow */}
            <div className="w-36 h-3 bg-black/30 rounded-full blur-xs mt-3" />
          </div>

          {/* Sparkles / Confetti celebration on finish */}
          {gameFinished && (
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-4 text-center z-30"
            >
              <div className="w-14 h-14 rounded-full bg-yellow-400 border-4 border-slate-900 flex items-center justify-center text-3xl mb-2 animate-bounce shadow-[2px_2px_0px_rgba(15,23,42,1)]">
                ⭐
              </div>
              <h4 className="text-sm font-black text-yellow-350 uppercase tracking-widest">
                ¡ENVASADO PERFECTO!
              </h4>
              <p className="text-[10px] font-bold text-white max-w-[180px] leading-relaxed mt-1">
                Remitiste un resto 100% sano. Ambientalito te premia con:
              </p>
              <div className="flex gap-2.5 my-2">
                <span className="text-[10px] font-black text-slate-900 bg-yellow-300 border-2 border-slate-900 px-3 py-1 rounded-full uppercase shadow-[1.5px_1.5px_0px_rgba(255,255,255,1)]">
                  ⭐ +25 Estrellas
                </span>
                <span className="text-[10px] font-black text-white bg-emerald-600 border-2 border-slate-900 px-3 py-1 rounded-full uppercase shadow-[1.5px_1.5px_0px_rgba(15,23,42,1)]">
                  🌊 +15% Pureza
                </span>
              </div>
              <p className="text-[9px] text-slate-350">
                ¡Mira cómo el lago de tu mascota se torna más cristalino y verde!
              </p>
              <div className="flex gap-2 mt-3 w-full">
                <button
                  onClick={resetItem}
                  type="button"
                  className="flex-1 py-1 px-2.5 bg-slate-700 text-white rounded-xl border-2 border-slate-900 text-[9px] font-bold uppercase hover:bg-slate-650 cursor-pointer shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 leading-none"
                >
                  Nuevo Intento
                </button>
                <button
                  onClick={() => {
                    playSynthSound("click", muted);
                    if (activeItemIndex < WORKSHOP_ITEMS.length - 1) {
                      setActiveItemIndex((prev) => prev + 1);
                    } else {
                      setActiveItemIndex(0);
                    }
                  }}
                  type="button"
                  className="flex-1 py-1 px-2.5 bg-yellow-400 text-slate-900 rounded-xl border-2 border-slate-900 text-[9px] font-black uppercase hover:bg-yellow-350 cursor-pointer shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 leading-none"
                >
                  Siguiente envase
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* CONTROLS AREA - 7 COLS */}
        <div className="lg:col-span-7 flex flex-col justify-between py-2 space-y-4">
          
          {/* STEP HEADER */}
          <div className="bg-white border-4 border-slate-900 rounded-2xl p-4 shadow-[3px_3px_0px_rgba(15,23,42,1)] space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-[8px] font-black uppercase tracking-widest text-[#e67e22]">
                PASO {stepToUse + 1} DE {selectedItem.steps.length}
              </span>
              <span className="text-xs font-black text-slate-900 uppercase">
                {currentStep.title}
              </span>
            </div>
            <h4 className="text-xs font-extrabold text-slate-900 leading-snug">
              {currentStep.instruction}
            </h4>
          </div>

          {/* INTERACTIVE CONTROLS CENTER PANEL */}
          <div className="bg-amber-100/50 border-4 border-slate-900 rounded-3xl p-5 min-h-[160px] flex flex-col items-center justify-center relative shadow-[3px_3px_0px_rgba(15,23,42,1)] overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#d3c1a3_15%,transparent_15%)] bg-[size:10px_10px] opacity-10 pointer-events-none" />

            {showExplanation ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full text-center space-y-4 relative z-10"
              >
                <div className="bg-emerald-500 border-2 border-slate-900 p-2.5 rounded-2xl inline-flex items-center gap-2 shadow-[2px_2px_0px_rgba(0,0,0,1)] text-white select-none">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-wider">¡PASO COMPLETADO CON ÉXITO!</span>
                </div>

                <div className="bg-white border-2 border-slate-900 p-3 rounded-xl text-left shadow-[2px_2px_0px_rgba(15,23,42,1)]">
                  <p className="text-[10.5px] font-medium text-slate-800 leading-relaxed">
                    💡 <strong>Sabb-Tip:</strong> {feedbackMsg}
                  </p>
                </div>

                <button
                  onClick={handleNextStep}
                  type="button"
                  className="w-full py-2.5 bg-[#e67e22] text-white border-4 border-slate-900 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-[#d35400] transition-colors shadow-[3px_3px_0px_rgba(15,23,42,1)] active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Siguiente paso</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>
              </motion.div>
            ) : (
              <div className="w-full flex flex-col items-center justify-center gap-4 relative z-10">
                {/* DYNAMIC ACTION RENDERING BOUND TO CURRENT ACTIONTYPE */}
                
                {/* 1. Rinsing holds button */}
                {currentStep.actionType === "rinse" && (
                  <div className="flex flex-col items-center gap-3 w-full">
                    <span className="text-xs font-black text-slate-400 block text-center uppercase tracking-wider">
                      Mantén presionado el botón manguera para verter agua limpia:
                    </span>
                    <motion.button
                      onPointerDown={() => setIsRinsing(true)}
                      onPointerUp={() => setIsRinsing(false)}
                      onPointerLeave={() => setIsRinsing(false)}
                      onTouchStart={() => setIsRinsing(true)}
                      onTouchEnd={() => setIsRinsing(false)}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      className="w-24 h-24 rounded-full bg-sky-400 border-4 border-slate-900 flex flex-col items-center justify-center hover:bg-sky-350 shadow-[4px_4px_0px_rgba(15,23,42,1)] select-none cursor-merge outline-none active:bg-cyan-400"
                    >
                      <Droplet className="w-8 h-8 text-white stroke-[2.5] fill-white animate-bounce" />
                      <span className="text-[9px] font-black text-slate-950 uppercase tracking-tight mt-1">¡LAVAR!</span>
                    </motion.button>
                    <span className="text-[8px] font-bold text-slate-500 italic block">
                      (Mantén pulsado o presiona para alimentar el agua)
                    </span>
                  </div>
                )}

                {/* 2. Uncap click */}
                {currentStep.actionType === "uncap" && (
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600 block text-center">
                      Haz clic en girar tapa para separar los componentes del envase:
                    </span>
                    <button
                      onClick={handleUncapAction}
                      type="button"
                      className="py-3 px-6 bg-yellow-400 border-4 border-slate-900 rounded-2xl text-xs font-black uppercase hover:bg-yellow-350 cursor-pointer shadow-[3px_3px_0px_rgba(15,23,42,1)] active:translate-x-0.5 active:translate-y-0.5 flex items-center gap-1.5"
                    >
                      <span>🔄 Separar Tapa de Metal o Rosca</span>
                    </button>
                  </div>
                )}

                {/* 3. Cap action */}
                {currentStep.actionType === "cap" && (
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600 block text-center">
                      Coloca la tapa en su lugar para mantener la botella aplastada:
                    </span>
                    <button
                      onClick={handleCapAction}
                      type="button"
                      className="py-3 px-6 bg-blue-500 text-white border-4 border-slate-900 rounded-2xl text-xs font-black uppercase hover:bg-blue-400 cursor-pointer shadow-[3px_3px_0px_rgba(15,23,42,1)] active:translate-x-0.5 active:translate-y-0.5 flex items-center gap-1.5"
                    >
                      <span>🔒 Enroscar Tapa Plástica</span>
                    </button>
                  </div>
                )}

                {/* 4. Fold sharp metal lid */}
                {currentStep.actionType === "fold_lid" && (
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600 block text-center">
                      Pliega la tapa cortante dentro para proteger las manos del recolector:
                    </span>
                    <button
                      onClick={handleFoldLidAction}
                      type="button"
                      className="py-3 px-6 bg-slate-500 text-white border-4 border-slate-900 rounded-2xl text-xs font-black uppercase hover:bg-slate-400 cursor-pointer shadow-[3px_3px_0px_rgba(15,23,42,1)] active:translate-x-0.5 active:translate-y-0.5 flex items-center gap-2"
                    >
                      <ShieldAlert className="w-5 h-5 text-yellow-300 animate-pulse" />
                      <span>Pliega Tapa Hacia Adentro Secramente</span>
                    </button>
                  </div>
                )}

                {/* 5. Rapidity crushing clicks */}
                {currentStep.actionType === "crush" && (
                  <div className="flex flex-col items-center gap-3 w-full">
                    <span className="text-[10px] font-black text-rose-800 block text-center uppercase tracking-widest leading-tight">
                      ¡Pulsa repetidamente sobre el botón para aplastar la lata o botella! ({crushClicks}/5 clicks)
                    </span>
                    
                    <div className="w-full bg-slate-200 border-2 border-slate-900 h-3 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-150" 
                        style={{ width: `${crushClicks * 20}%` }}
                      />
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={handleCrushAction}
                      type="button"
                      className="py-3.5 px-8 bg-orange-500 text-white border-4 border-slate-900 rounded-2xl text-xs font-black uppercase hover:bg-orange-450 cursor-pointer shadow-[3px_3px_0px_rgba(15,23,42,1)] active:translate-x-0.5 active:translate-y-0.5 flex items-center gap-1.5"
                    >
                      👊 ¡APLASTAR RESIDUOS!
                    </motion.button>
                  </div>
                )}

                {/* 6. Skip glass crush safety lesson */}
                {currentStep.actionType === "skip" && (
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="w-12 h-12 rounded-full bg-rose-100 border-2 border-slate-900 flex items-center justify-center text-rose-600 animate-pulse">
                      <ShieldAlert className="w-6 h-6 stroke-[2.5]" />
                    </div>
                    <span className="text-xs font-extrabold text-red-700 max-w-sm block leading-relaxed">
                      ¡ALERTA DE SEGURIDAD! El vidrio NO debe ser triturado ni aplastado a mano porque genera astillas cortantes sumamente peligrosas.
                    </span>
                    <button
                      onClick={handleSkipAction}
                      type="button"
                      className="py-2.5 px-6 bg-white border-4 border-slate-900 rounded-xl text-xs font-extrabold text-slate-800 uppercase hover:bg-slate-50 cursor-pointer shadow-[3px_3px_0px_rgba(15,23,42,1)] active:translate-x-0.5 active:translate-y-0.5 leading-none"
                    >
                      Avanzar de forma segura ✅
                    </button>
                  </div>
                )}

                {/* 7. Classify into correct can */}
                {currentStep.actionType === "sort" && (
                  <div className="flex flex-col items-center gap-3 w-full">
                    <span className="text-xs font-semibold text-slate-600 text-center block">
                      Disposita el residuo limpio en su compartimento oficial:
                    </span>
                    
                    <button
                      onClick={handleSortAction}
                      type="button"
                      className={`w-full max-w-sm py-4 ${selectedItem.binColor} text-white border-4 border-slate-900 rounded-2xl flex items-center justify-center gap-2.5 shadow-[4px_4px_0px_rgba(15,23,42,1)] active:translate-x-0.5 active:translate-y-0.5 hover:brightness-110 shrink-0 text-left`}
                    >
                      <span className="text-2xl select-none shrink-0">{selectedItem.binIcon}</span>
                      <div className="min-w-0">
                        <span className="block text-[8px] font-black uppercase tracking-widest text-[#eee]/80 leading-none">TACHO COMPATIBLE</span>
                        <strong className="text-xs font-black uppercase tracking-wide truncate">{selectedItem.binName}</strong>
                      </div>
                    </button>
                  </div>
                )}

              </div>
            )}
          </div>

          {/* DYNAMIC HELP CARD INFORMATION */}
          <div className="bg-white border-4 border-slate-900 rounded-2xl p-4 flex gap-3 shadow-[1.5px_1.5px_0px_rgba(15,23,42,1)]">
            <span className="text-2xl select-none mt-0.5">🌟</span>
            <div>
              <strong className="text-slate-950 text-[10px] uppercase font-black tracking-wide block mb-0.5">La Regla de Oro</strong>
              <p className="text-[10px] text-slate-700 leading-snug">
                El 90% de los envases que llegan sucios a las plantas de reciclaje terminan incinerándose en vertederos debido a que la materia orgánica pudre el plástico o funde de forma contaminada. ¡Lava siempre y reduce el volumen!
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
