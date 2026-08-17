import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  RotateCcw, 
  Star, 
  Trophy, 
  ChevronRight, 
  HelpCircle,
  Lightbulb,
  Award,
  Volume2,
  VolumeX,
  Flame,
  Trash2,
  Check,
  Zap,
  Info
} from "lucide-react";
import RecyclingWorkshop from "./RecyclingWorkshop";

interface GameItem {
  id: string;
  name: string;
  category: "plastic" | "glass" | "metal" | "paper";
  icon: string;
  hint: string;
  funFact: string;
  difficulty: "Fácil" | "Medio" | "Experto";
  degradation: string;
}

const RECYCLABLE_ITEMS: GameItem[] = [
  // Plásticos (Contenedor Azul)
  {
    id: "p1",
    name: "Botella de Agua PET",
    category: "plastic",
    icon: "🥤",
    hint: "Es el plástico reciclado más famoso. ¡Busca el triángulo con el número 1!",
    funFact: "¡Con solo 80 botellas de plástico recicladas se puede confeccionar un abrigo polar ecológico!",
    difficulty: "Fácil",
    degradation: "450 años"
  },
  {
    id: "p2",
    name: "Envase de Champú rígido",
    category: "plastic",
    icon: "🧴",
    hint: "Es muy resistente, catalogado como HDPE #2. ¡Suele transformarse en palas y toboganes!",
    funFact: "Se recicla para fabricar tuberías largas, macetas super resistentes y nuevos envases seguros.",
    difficulty: "Medio",
    degradation: "500 años"
  },
  {
    id: "p3",
    name: "Taparosca Plástica",
    category: "plastic",
    icon: "🟡",
    hint: "Son pequeñas pero abundantes. ¡Mantenlas limpias para hacer filamentos de impresión 3D!",
    funFact: "Las tapitas plásticas se donan en fundaciones para cofinanciar tratamientos de salud infantil.",
    difficulty: "Fácil",
    degradation: "300 años"
  },
  {
    id: "p4",
    name: "Vaso Plástico de Cumpleaños",
    category: "plastic",
    icon: "🥛",
    hint: "Hecho de Polipropileno. Debe estar libre de gaseosa o restos.",
    funFact: "Se muele y se funde para crear escobas, cajas de herramientas y hieleras ecológicas.",
    difficulty: "Experto",
    degradation: "400 años"
  },

  // Vidrio (Contenedor Verde)
  {
    id: "g1",
    name: "Botella de Vidrio de Gaseosa",
    category: "glass",
    icon: "🍾",
    hint: "El rey del reciclaje interminable. ¡Se puede transformar infinitamente sin perder pureza!",
    funFact: "¡Reciclar una botella ahorra suficiente electricidad para prender una bombilla clásica por 4 horas!",
    difficulty: "Fácil",
    degradation: "4,000 años"
  },
  {
    id: "g2",
    name: "Frasco de Vidrio de Mermelada",
    category: "glass",
    icon: "🫙",
    hint: "Quítale la tapa metálica y dale una enjuagada ligera. Las etiquetas se disuelven solas.",
    funFact: "El vidrio reciclado triturado se llama calcín; se derrite más rápido y reduce drásticamente el uso de gas.",
    difficulty: "Fácil",
    degradation: "4,000 años"
  },
  {
    id: "g3",
    name: "Copa de Vidrio Común",
    category: "glass",
    icon: "🍷",
    hint: "Recuerda enjuagarla muy bien. Si está rota, colócala con cuidado.",
    funFact: "La arena de sílice virgen se conserva gracias a las miles de copas y botellas que devolvemos al ciclo.",
    difficulty: "Medio",
    degradation: "4,000 años"
  },

  // Metales (Contenedor Amarillo)
  {
    id: "m1",
    name: "Lata de Refresco (Aluminio)",
    category: "metal",
    icon: "🥫",
    hint: "Súper ligera y 100% biodegradable de forma industrial. ¡A aplastarla bien!",
    funFact: "¡Reciclar aluminio gasta un 95% MENOS de energía que extraer la roca de bauxita de la mina!",
    difficulty: "Fácil",
    degradation: "80 años"
  },
  {
    id: "m2",
    name: "Lata de Atún o Conservas",
    category: "metal",
    icon: "🐟",
    hint: "Hecha de hojalata y acero protector. Un imán potente la separará solita en la planta.",
    funFact: "Las latas de atún recicladas vuelven a la vida en forma de vigas de puentes u otras latas.",
    difficulty: "Medio",
    degradation: "100 años"
  },
  {
    id: "m3",
    name: "Lata de Aerosol vacía",
    category: "metal",
    icon: "💨",
    hint: "Asegúrate de gastar todo su contenido antes. ¡No intentes romperla bajo ningún motivo!",
    funFact: "El acero se funde en hornos gigantescos purificando todos los compuestos de manera ecológica.",
    difficulty: "Experto",
    degradation: "100 años"
  },

  // Papel y Cartón (Contenedor Gris)
  {
    id: "pa1",
    name: "Caja de Cartón de Envíos",
    category: "paper",
    icon: "📦",
    hint: "Desármala y aplástala por completo. ¡Ocupará menos espacio en el camión de recogida!",
    funFact: "Por cada tonelada de cartón salvada, evitamos cortar 17 árboles maduros y ahorramos 50,000L de agua.",
    difficulty: "Fácil",
    degradation: "2 meses"
  },
  {
    id: "pa2",
    name: "Periódico o Diario Viejo",
    category: "paper",
    icon: "📰",
    hint: "Las fibras de celulosa del papel de diario pueden renacer hasta 7 veces en papel nuevo.",
    funFact: "La fabricación con papel reciclado consume un 60% menos de energía que la pulpa de madera virgen.",
    difficulty: "Fácil",
    degradation: "6 semanas"
  },
  {
    id: "pa3",
    name: "Cuaderno viejo (sin espiral)",
    category: "paper",
    icon: "📓",
    hint: "Quítale la parte de alambre o espiral de plástico antes de arrojar sus hojas.",
    funFact: "El papel blanco de oficina renace habitualmente convertido en servilletas suaves o papel higiénico.",
    difficulty: "Medio",
    degradation: "6 meses"
  },
  {
    id: "pa4",
    name: "Envase de Cartón Tetra Pak",
    category: "paper",
    icon: "🧃",
    hint: "Tiene 75% papel, plástico y aluminio en capas. ¡Ábrela por las esquinas y aplástala!",
    funFact: "¡Con el residuo prensado de Tetra Pak se fabrican láminas para techos escolares súper resistentes al sol!",
    difficulty: "Experto",
    degradation: "30 años"
  }
];

const BINS_CONFIG = [
  {
    type: "plastic",
    name: "Tacho Azul",
    label: "Plásticos",
    badge: "🥤 Botellas/Envases",
    bodyColor: "bg-blue-600",
    lidColor: "bg-blue-800",
    accentColor: "bg-blue-500",
    textColor: "text-blue-100",
    borderHighlight: "border-blue-400 shadow-blue-500/50"
  },
  {
    type: "glass",
    name: "Tacho Verde",
    label: "Vidrio",
    badge: "🍾 Botellas/Frascos",
    bodyColor: "bg-emerald-655",
    lidColor: "bg-emerald-800",
    accentColor: "bg-emerald-500",
    textColor: "text-emerald-100",
    borderHighlight: "border-emerald-400 shadow-emerald-500/50"
  },
  {
    type: "metal",
    name: "Tacho Amarillo",
    label: "Metales",
    badge: "🥫 Latas/Acero",
    bodyColor: "bg-yellow-500",
    lidColor: "bg-yellow-650",
    accentColor: "bg-yellow-400",
    textColor: "text-amber-950",
    borderHighlight: "border-yellow-350 shadow-yellow-550/50"
  },
  {
    type: "paper",
    name: "Tacho Gris",
    label: "Papel/Cartón",
    badge: "📦 Cajas/Revistas",
    bodyColor: "bg-slate-500",
    lidColor: "bg-slate-750",
    accentColor: "bg-slate-400",
    textColor: "text-slate-100",
    borderHighlight: "border-slate-350 shadow-slate-500/50"
  }
];

const SCRAP_ITEMS = [
  { id: 1, icon: "🧴", left: "10%", top: "72%", rotation: 45, threshold: 30 },
  { id: 2, icon: "🥤", left: "80%", top: "65%", rotation: -30, threshold: 45 },
  { id: 3, icon: "🥫", left: "15%", top: "50%", rotation: 90, threshold: 60 },
  { id: 4, icon: "🐟", left: "82%", top: "45%", rotation: 15, threshold: 75 },
  { id: 5, icon: "🧻", left: "12%", top: "35%", rotation: -15, threshold: 20 },
  { id: 6, icon: "🚬", left: "75%", top: "80%", rotation: 60, threshold: 15 },
  { id: 7, icon: "🪰", left: "20%", top: "25%", rotation: -45, threshold: 40 },
  { id: 8, icon: "🍌", left: "85%", top: "25%", rotation: 120, threshold: 50 },
  { id: 9, icon: "👞", left: "5%", top: "20%", rotation: -10, threshold: 35 },
];

const ECO_FLOWERS = [
  { id: 201, icon: "🌸", left: "8%", top: "75%", scale: 1.2, threshold: 60 },
  { id: 202, icon: "🪷", left: "85%", top: "68%", scale: 1.4, threshold: 75 },
  { id: 203, icon: "🌿", left: "12%", top: "22%", scale: 1, threshold: 50 },
  { id: 204, icon: "🦋", left: "78%", top: "18%", scale: 1.1, threshold: 85 },
  { id: 205, icon: "🦆", left: "45%", top: "82%", scale: 1.3, threshold: 90 },
];

type FrogState = "normal" | "hungry" | "eating" | "sad_error" | "love" | "excited";

// Sound Synthesizer using Web Audio API (Nostalgic POU Sounds!)
const playPouSound = (type: "eat" | "correct" | "incorrect" | "click" | "drag_over", isMuted: boolean) => {
  if (isMuted) return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === "eat") {
      const now = ctx.currentTime;
      for (let i = 0; i < 3; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(300 + Math.random() * 200, now + i * 0.12);
        osc.frequency.exponentialRampToValueAtTime(120, now + i * 0.12 + 0.08);
        gain.gain.setValueAtTime(0.08, now + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.12 + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.09);
      }
    } else if (type === "correct") {
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // retro C5 -> E5 -> G5 -> C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.06, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.005, now + idx * 0.08 + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.2);
      });
    } else if (type === "incorrect") {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(110, now + 0.4);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
    } else if (type === "click") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(350, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === "drag_over") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(450, ctx.currentTime);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    }
  } catch (e) {
    console.warn("AudioContext not loaded or muted:", e);
  }
};

export default function AmbientalitoGame() {
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [stars, setStars] = useState<number>(0);
  const [currentItemIndex, setCurrentItemIndex] = useState<number>(0);
  const [shuffledItems, setShuffledItems] = useState<GameItem[]>([]);
  const [muted, setMuted] = useState<boolean>(false);
  
  const [environmentPurity, setEnvironmentPurity] = useState<number>(() => {
    const saved = localStorage.getItem("ambientalito_pond_purity");
    return saved ? parseInt(saved, 10) : 10;
  });

  const [currentState, setCurrentState] = useState<FrogState>("normal");
  const [draggedOverMascot, setDraggedOverMascot] = useState<boolean>(false);
  const [draggedOverBin, setDraggedOverBin] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState<boolean>(true);
  const [activeTab, setActiveGameTab] = useState<"game" | "workshop" | "knowledge">("game");

  const handleWorkshopStars = (amount: number) => {
    setStars(prev => {
      const next = prev + amount;
      localStorage.setItem("ambientalito_total_stars", next.toString());
      return next;
    });
  };

  const handleWorkshopPurity = (amount: number) => {
    setEnvironmentPurity(prev => {
      const next = Math.min(100, prev + amount);
      localStorage.setItem("ambientalito_pond_purity", next.toString());
      return next;
    });
  };

  const [answersCount, setAnswersCount] = useState<{ total: number; correct: number }>({ total: 0, correct: 0 });

  // Floating particles system for cute rewards
  const [confetti, setConfetti] = useState<{ id: number; symbol: string; x: number; y: number }[]>([]);
  const [feedback, setFeedback] = useState<{
    show: boolean;
    isCorrect: boolean;
    message: string;
    item?: GameItem;
  } | null>(null);

  // Mouse / Touch Pupil Tracking inside container
  const containerRef = useRef<HTMLDivElement>(null);
  const [eyeOffset, setEyeOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Pointer drag state for Unified Touch & Mouse Mobile operations
  const [dragState, setDragState] = useState({
    isActive: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
  });

  useEffect(() => {
    localStorage.setItem("ambientalito_pond_purity", environmentPurity.toString());
  }, [environmentPurity]);

  useEffect(() => {
    shuffleNewGame();
    const savedHighScore = localStorage.getItem("ambientalito_high_score");
    const savedStars = localStorage.getItem("ambientalito_total_stars");
    if (savedHighScore) setHighScore(parseInt(savedHighScore, 10));
    if (savedStars) setStars(parseInt(savedStars, 10));

    // Eye tracking logic
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      const maxMove = 8; // Max pixels pupil can glide inside eye
      const limit = Math.min(dist, 100);
      const ratio = limit / 100;
      
      setEyeOffset({
        x: (dx / (dist || 1)) * maxMove * ratio,
        y: (dy / (dist || 1)) * maxMove * ratio
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const shuffleNewGame = () => {
    const shuffled = [...RECYCLABLE_ITEMS].sort(() => Math.random() - 0.5);
    setShuffledItems(shuffled);
    setCurrentItemIndex(0);
    setStreak(0);
    setScore(0);
    setEnvironmentPurity(10);
    setCurrentState("normal");
    setFeedback(null);
  };

  // Launch cute star particles!
  const triggerConfetti = () => {
    const newConfetti = Array.from({ length: 15 }).map((_, i) => ({
      id: Date.now() + i,
      symbol: ["⭐", "✨", "🎉", "🍬", "🎈", "🐸", "♻️"][Math.floor(Math.random() * 7)],
      x: (Math.random() - 0.5) * 160,
      y: -20 - Math.random() * 80
    }));
    setConfetti(prev => [...prev, ...newConfetti]);
    setTimeout(() => {
      setConfetti(prev => prev.filter(c => !newConfetti.find(nc => nc.id === c.id)));
    }, 1500);
  };

  const handleClassification = (selectedCategory: string) => {
    if (feedback?.show) return;

    const currentItem = shuffledItems[currentItemIndex];
    const isCorrect = currentItem.category === selectedCategory;

    setAnswersCount(prev => ({
      total: prev.total + 1,
      correct: prev.correct + (isCorrect ? 1 : 0)
    }));

    if (isCorrect) {
      setCurrentState("eating");
      playPouSound("eat", muted);
      setEnvironmentPurity(prev => Math.min(100, prev + 15));
      
      setTimeout(() => {
        playPouSound("correct", muted);
        triggerConfetti();
        const nextEmotion = streak >= 2 ? "excited" : "love";
        setCurrentState(nextEmotion);

        setScore(prev => {
          const newScore = prev + 1;
          if (newScore > highScore) {
            setHighScore(newScore);
            localStorage.setItem("ambientalito_high_score", newScore.toString());
          }
          return newScore;
        });

        setStreak(prev => prev + 1);
        setStars(prev => {
          const newStars = prev + 1;
          localStorage.setItem("ambientalito_total_stars", newStars.toString());
          return newStars;
        });

        const successPhrases = [
          "¡YUM! ¡Este plástico sabe a aire limpio! 🥤🐸",
          "¡CHOMP! ¡Riquísimo frasco de vidrio! 🌱💚",
          "¡ÑAM! Aluminio brillante para mi barriga. ⭐",
          "¡Crunchy! Papel reciclado de primera calidad. 📦"
        ];
        
        setFeedback({
          show: true,
          isCorrect: true,
          message: successPhrases[Math.floor(Math.random() * successPhrases.length)],
          item: currentItem
        });
      }, 900);

    } else {
      playPouSound("incorrect", muted);
      setCurrentState("sad_error");
      setStreak(0);
      setEnvironmentPurity(prev => Math.max(0, prev - 15));

      const failurePhrases = [
        "¡Uf! Eso no va en esta sección. ¡Casi me como algo inadecuado! 🤮",
        "¡Guácala! Mezclar cartón húmedo daña el reciclaje. 💦",
        "¡Ay-ay! No metas plástico en el papel, Ambientalito se enferma."
      ];

      setFeedback({
        show: true,
        isCorrect: false,
        message: failurePhrases[Math.floor(Math.random() * failurePhrases.length)],
        item: currentItem
      });
    }
  };

  const nextQuestion = () => {
    setFeedback(null);
    setCurrentState("normal");
    setDraggedOverMascot(false);
    
    if (currentItemIndex + 1 >= shuffledItems.length) {
      const reshuffled = [...RECYCLABLE_ITEMS].sort(() => Math.random() - 0.5);
      setShuffledItems(reshuffled);
      setCurrentItemIndex(0);
    } else {
      setCurrentItemIndex(prev => prev + 1);
    }
  };

  const currentItem = shuffledItems[currentItemIndex];

  // Helper function to check collision with both bins and the Pou mascot drop zone
  const checkCollision = (clientX: number, clientY: number) => {
    // Check bins
    for (const bin of BINS_CONFIG) {
      const el = document.getElementById(`bin-${bin.type}`);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (
          clientX >= rect.left &&
          clientX <= rect.right &&
          clientY >= rect.top &&
          clientY <= rect.bottom
        ) {
          return { type: "bin", value: bin.type };
        }
      }
    }
    
    // Check mascot
    const mascotEl = document.getElementById("pou-mascot-dropzone");
    if (mascotEl) {
      const rect = mascotEl.getBoundingClientRect();
      if (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      ) {
        return { type: "mascot", value: "pou" };
      }
    }
    
    return null;
  };

  // Pointer based universal touch & mouse drag systems
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (feedback?.show) return;
    
    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);
    
    setDragState({
      isActive: true,
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
    });
    
    setCurrentState("hungry");
    playPouSound("click", muted);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.isActive) return;
    
    const currentX = e.clientX;
    const currentY = e.clientY;
    
    setDragState(prev => ({
      ...prev,
      currentX,
      currentY,
    }));

    // Real-time boundary overlap calculations
    const collision = checkCollision(currentX, currentY);
    if (collision) {
      if (collision.type === "bin") {
        setDraggedOverBin(collision.value);
        setDraggedOverMascot(false);
      } else if (collision.type === "mascot") {
        setDraggedOverMascot(true);
        setDraggedOverBin(null);
      }
    } else {
      setDraggedOverBin(null);
      setDraggedOverMascot(false);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.isActive) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    
    const finalX = e.clientX;
    const finalY = e.clientY;
    
    setDragState({
      isActive: false,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
    });
    
    const collision = checkCollision(finalX, finalY);
    setDraggedOverBin(null);
    setDraggedOverMascot(false);
    setCurrentState("normal");
    
    if (collision) {
      if (collision.type === "bin") {
        handleClassification(collision.value);
      } else if (collision.type === "mascot" && currentItem) {
        // Drop on Pou mascot feeds it in the correct category
        handleClassification(currentItem.category);
      }
    }
  };

  // Get expressive assets based on state
  const getPouStateStyles = () => {
    switch (currentState) {
      case "eating":
        return {
          eyes: "^ _ ^",
          blush: "bg-pink-400 scale-125 animate-pulse",
          expression: "¡MUNCH CHOMP! 🍴",
          bgColor: "bg-green-500",
          scale: 1.1,
          mouthStyle: "w-14 h-4 bg-amber-950 rounded-b-full border-2 border-slate-900 duration-100 animate-pulse"
        };
      case "hungry":
        return {
          eyes: "○ _ ○",
          blush: "bg-rose-400 scale-110",
          expression: "¡Tengo hambre! ¡Aliméntame! 🍽️",
          bgColor: "bg-green-400",
          scale: 1.05,
          mouthStyle: "w-16 h-16 bg-red-650 rounded-full border-4 border-slate-900 shadow-inner translate-y-1 relative overflow-hidden"
        };
      case "sad_error":
        return {
          eyes: "> _ <",
          blush: "bg-blue-400 opacity-60",
          expression: "¡Ay, mi pancita! 😭",
          bgColor: "bg-emerald-700",
          scale: 0.9,
          mouthStyle: "w-12 h-3 bg-red-700/80 rounded-t-full border-2 border-slate-900 -translate-y-1"
        };
      case "love":
        return {
          eyes: "♥ _ ♥",
          blush: "bg-pink-500 animate-bounce scale-150",
          expression: "¡Te amo Eco-Héroe! 💕",
          bgColor: "bg-emerald-500",
          scale: 1.15,
          mouthStyle: "w-14 h-8 bg-pink-500 rounded-b-full border-4 border-slate-900 flex items-center justify-center font-bold text-[8px] text-white"
        };
      case "excited":
        return {
          eyes: "★ _ ★",
          blush: "bg-yellow-400 scale-150 duration-75",
          expression: "¡RACHA INCREÍBLE! ⭐👑",
          bgColor: "bg-lime-400 animate-bounce",
          scale: 1.2,
          mouthStyle: "w-18 h-10 bg-gradient-to-r from-yellow-400 to-rose-400 rounded-b-full border-4 border-slate-900"
        };
      case "normal":
      default:
        return {
          eyes: "● _ ●",
          blush: "bg-rose-400/90 scale-100",
          expression: "¡Hola! ¡Arrastra un residuo a un tacho!",
          bgColor: "bg-green-500",
          scale: 1,
          mouthStyle: "w-10 h-3 bg-slate-900/15 border-b-4 border-slate-900 rounded-b-xl"
        };
    }
  };

  const currentStyles = getPouStateStyles();

  // Background styling based on pond purity: transition from dark grey toxic/murky to sparkling sunny sky and water
  const getPondBackgroundStyles = () => {
    if (environmentPurity < 33) {
      return {
        waterBg: "from-stone-800 via-slate-800 to-stone-900",
        waterLidColor: "bg-slate-900/30",
        skyBg: "bg-gradient-to-b from-stone-950 to-slate-900",
        glassRefl: "bg-red-500/10",
        statusMessage: "🤢 Estanque repleto de basura. ¡Limpiemos el entorno!",
        ambientParticles: "💨",
        sunnyRays: false,
        statusTextColor: "text-red-400 font-black"
      };
    } else if (environmentPurity < 66) {
      return {
        waterBg: "from-teal-900 via-stone-800 to-slate-800",
        waterLidColor: "bg-teal-950/20",
        skyBg: "bg-gradient-to-b from-zinc-800 to-teal-950",
        glassRefl: "bg-amber-500/5",
        statusMessage: "🌤️ ¡Estanque recuperándose! Sigue clasificando.",
        ambientParticles: "🫧",
        sunnyRays: false,
        statusTextColor: "text-amber-300 font-black"
      };
    } else {
      return {
        waterBg: "from-sky-400 via-cyan-200 to-blue-500",
        waterLidColor: "bg-cyan-300/30",
        skyBg: "bg-gradient-to-b from-sky-300 to-cyan-100",
        glassRefl: "bg-white/25",
        statusMessage: "✨ ¡Laguna cristalina, linda, limpia y soleada! 🌤️",
        ambientParticles: "⭐",
        sunnyRays: true,
        statusTextColor: "text-emerald-700 font-black"
      };
    }
  };

  const pondStyles = getPondBackgroundStyles();

  // Drag physics styling
  const deltaX = dragState.isActive ? (dragState.currentX - dragState.startX) : 0;
  const deltaY = dragState.isActive ? (dragState.currentY - dragState.startY) : 0;

  const dragStyle: React.CSSProperties = dragState.isActive ? {
    transform: `translate3d(${deltaX}px, ${deltaY}px, 100px)`,
    zIndex: 999,
    position: "relative",
    touchAction: "none",
    opacity: 0.85,
    cursor: "grabbing",
    boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.15), 0 8px 10px -6px rgb(0 0 0 / 0.15)",
  } : {
    touchAction: "none",
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-2" id="ambientalito-game-module">
      
      {/* 🏡 TOY PLAYROOM TOP NAVBAR */}
      <div className="bg-yellow-400 text-slate-950 border-4 border-slate-900 rounded-3xl p-4 md:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[6px_6px_0px_rgba(15,23,42,1)] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_15%,transparent_15%)] bg-[size:14px_14px] opacity-10 pointer-events-none" />

        <div className="flex items-center gap-3 z-10">
          <div className="relative w-14 h-14 rounded-2xl bg-white border-4 border-slate-900 flex items-center justify-center text-4xl shadow-[3px_3px_0px_rgba(15,23,42,1)] overflow-hidden shrink-0">
            <span className="animate-bounce inline-block">🐸</span>
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest font-sans flex items-center gap-1.5 leading-tight">
              Ambientalito Pou v2.5
            </h3>
            <p className="text-xs font-bold text-slate-900 leading-tight">
              ¡Clasifica y alimenta con residuos reciclables limpios! ♻️✨
            </p>
          </div>
        </div>

        {/* CUTE TOP COUNTERS */}
        <div className="flex flex-wrap justify-center items-center gap-2 z-10 w-full md:w-auto">
          {/* Flame streak */}
          <div className="bg-white border-4 border-slate-900 rounded-xl px-2.5 py-1 flex items-center gap-1 shadow-[2px_2px_0px_rgba(15,23,42,1)]">
            <Flame className={`w-4 h-4 text-orange-500 ${streak > 0 ? "animate-bounce" : ""}`} />
            <div>
              <span className="block text-[7px] font-black text-slate-500 uppercase leading-none">Racha</span>
              <span className="text-xs font-black text-slate-900 font-mono leading-none">{streak}</span>
            </div>
          </div>

          {/* Stars Collected */}
          <motion.div 
            key={stars}
            animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0] }}
            className="bg-yellow-50 border-4 border-slate-900 rounded-xl px-2.5 py-1 flex items-center gap-1 shadow-[2px_2px_0px_rgba(15,23,42,1)] text-slate-900"
          >
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-600 animate-pulse" />
            <div>
              <span className="block text-[7px] font-black text-slate-500 uppercase leading-none">Estrellas</span>
              <span className="text-xs font-black font-mono leading-none">{stars}</span>
            </div>
          </motion.div>

          {/* High score crown */}
          <div className="bg-pink-100 border-4 border-slate-900 rounded-xl px-2.5 py-1 flex items-center gap-1 shadow-[2px_2px_0px_rgba(15,23,42,1)]">
            <Trophy className="w-4 h-4 text-pink-500" />
            <div>
              <span className="block text-[7px] font-black text-slate-500 uppercase leading-none">Máximo</span>
              <span className="text-xs font-black text-pink-700 font-mono leading-none">{highScore}</span>
            </div>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              setMuted(!muted);
              playPouSound("click", !muted);
            }}
            type="button"
            className="w-9 h-9 rounded-xl bg-white border-4 border-slate-900 flex items-center justify-center hover:bg-slate-100 shadow-[2px_2px_0px_rgba(15,23,42,1)] active:translate-x-0.5 active:translate-y-0.5"
          >
            {muted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4 text-slate-700" />}
          </button>
        </div>
      </div>

      {/* TABS SELECTION */}
      <div className="flex bg-slate-900/40 p-1.5 rounded-2xl border-4 border-slate-900 max-w-md mx-auto shadow-[3px_3px_0px_rgba(15,23,42,1)] gap-1">
        <button
          onClick={() => {
            playPouSound("click", muted);
            setActiveGameTab("game");
          }}
          type="button"
          className={`flex-1 py-1.5 text-[10.5px] font-black uppercase tracking-wider rounded-xl border-2 transition-all ${
            activeTab === "game" 
              ? "bg-emerald-500 border-slate-900 text-white shadow-[2px_2px_0px_rgba(0,0,0,1)]" 
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          🎮 Alimentar
        </button>
        <button
          onClick={() => {
            playPouSound("click", muted);
            setActiveGameTab("workshop");
          }}
          type="button"
          className={`flex-1 py-1.5 text-[10.5px] font-black uppercase tracking-wider rounded-xl border-2 transition-all ${
            activeTab === "workshop" 
              ? "bg-amber-500 border-slate-900 text-white shadow-[2px_2px_0px_rgba(0,0,0,1)]" 
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          🔧 Taller Eco
        </button>
        <button
          onClick={() => {
            playPouSound("click", muted);
            setActiveGameTab("knowledge");
          }}
          type="button"
          className={`flex-1 py-1.5 text-[10.5px] font-black uppercase tracking-wider rounded-xl border-2 transition-all ${
            activeTab === "knowledge" 
              ? "bg-emerald-500 border-slate-900 text-white shadow-[2px_2px_0px_rgba(0,0,0,1)]" 
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          📖 Recetario
        </button>
      </div>

      {activeTab === "game" ? (
        <div 
          ref={containerRef}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch"
        >
          {/* 🐸 LEFT CONTAINER: THE POU MASCOT (PLAYROOM GAME STAGE / ESTANQUE INTERACTIVO) */}
          <div 
            id="pou-mascot-dropzone"
            data-frog="true"
            className={`border-4 border-slate-900 rounded-[32px] p-5 flex flex-col items-center justify-between min-h-[460px] relative shadow-[6px_6px_0px_rgba(15,23,42,1)] overflow-hidden transition-all duration-1000 bg-gradient-to-b ${pondStyles.waterBg}`}
          >
            {/* Sky Background Overlays */}
            <div className="absolute inset-x-0 top-0 h-1/3 bg-black/10 pointer-events-none z-0" />
            
            {/* SUN AND LIGHT RAYS */}
            {pondStyles.sunnyRays && (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
                  className="absolute top-4 right-4 text-5xl select-none z-0 filter drop-shadow-[0_0_10px_rgba(253,224,71,0.5)]"
                >
                  ☀️
                </motion.div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-yellow-300/15 via-transparent to-transparent pointer-events-none z-0" />
              </>
            )}

            {/* Dynamic Clouds / Fog System */}
            {environmentPurity >= 66 ? (
              <motion.div
                animate={{ x: [-80, 360] }}
                transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
                className="absolute top-5 left-0 text-2xl pointer-events-none opacity-80 z-0 select-none"
              >
                ☁️
              </motion.div>
            ) : (
              <motion.div
                animate={{ x: [-50, 360], y: [0, -3, 3, 0] }}
                transition={{ repeat: Infinity, duration: 24, ease: "linear" }}
                className="absolute top-4 left-0 text-2xl pointer-events-none opacity-40 z-0 select-none"
              >
                🌫️
              </motion.div>
            )}

            {/* Water Ripples Lines decoration */}
            <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-black/5 pointer-events-none z-0 border-t border-white/5" />
            
            {/* FLOATING RESIDUES IN DIRTY POND */}
            {SCRAP_ITEMS.map((trash) => {
              if (environmentPurity >= trash.threshold) return null;
              return (
                <motion.div
                  key={`trash-${trash.id}`}
                  initial={{ y: 0 }}
                  animate={{ 
                    y: [0, -5, 5, 0], 
                    rotate: [trash.rotation, trash.rotation + 4, trash.rotation - 4, trash.rotation] 
                  }}
                  transition={{ repeat: Infinity, duration: 4 + (trash.id % 3), ease: "easeInOut" }}
                  style={{ left: trash.left, top: trash.top }}
                  className="absolute text-2xl select-none z-10 pointer-events-none filter drop-shadow-[0_3px_2px_rgba(0,0,0,0.6)]"
                >
                  {trash.icon}
                </motion.div>
              );
            })}

            {/* SPAWNED BEAUTIFUL ECO-FLOWERS & FAUNA IN CLEAN POND */}
            {ECO_FLOWERS.map((eco) => {
              if (environmentPurity < eco.threshold) return null;
              return (
                <motion.div
                  key={`eco-${eco.id}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: eco.scale, opacity: 1, y: [0, -2, 2, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse", repeatDelay: Math.random() }}
                  style={{ left: eco.left, top: eco.top }}
                  className="absolute text-2xl select-none z-10 pointer-events-none filter drop-shadow-[0_2px_4px_rgba(255,255,255,0.5)]"
                >
                  {eco.icon}
                </motion.div>
              );
            })}

            {/* Top Toolbar overlay inside pond container */}
            <div className="w-full flex justify-between items-center z-10 mb-2 gap-2">
              {/* Dynamic Status Badges */}
              <div className="flex flex-col gap-1 items-start">
                <span className="text-[8px] font-black text-rose-800 bg-rose-100 border-2 border-slate-900 px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-[1.5px_1.5px_0px_rgba(15,23,42,1)]">
                  {currentStyles.expression}
                </span>
              </div>

              {/* Water purity indicator bar */}
              <div className="flex-1 max-w-[170px] bg-white/95 border-2 border-slate-900 rounded-xl px-2 py-0.5 flex flex-col gap-0.5 shadow-[2px_2px_0px_rgba(15,23,42,1)]">
                <div className="flex justify-between items-center text-[7px] font-black text-slate-800">
                  <span className="truncate">🌊 PUREZA DEL AGUA</span>
                  <span className="font-mono text-emerald-700 font-extrabold">{environmentPurity}%</span>
                </div>
                <div className="h-2 w-full bg-slate-200 border border-slate-900 rounded-full overflow-hidden">
                  <motion.div 
                    animate={{ width: `${environmentPurity}%` }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                  />
                </div>
              </div>

              <button
                onClick={() => setShowTutorial(!showTutorial)}
                type="button"
                className="w-7 h-7 rounded-full bg-white border-2 border-slate-900 flex items-center justify-center text-slate-900 hover:bg-slate-50 shadow-[1.5px_1.5px_0px_rgba(15,23,42,1)]"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Status explanation label */}
            <div className="z-10 w-full mb-3 text-center">
              <span className={`text-[9px] px-3 py-1 rounded-full border-2 border-slate-900 bg-white/90 shadow-[2px_2px_0px_rgba(15,23,42,1)] ${pondStyles.statusTextColor}`}>
                {pondStyles.statusMessage}
              </span>
            </div>

            {/* CONFETTI EFFECTS */}
            <div className="absolute inset-x-0 top-1/4 pointer-events-none z-30">
              <AnimatePresence>
                {confetti.map((particle) => (
                  <motion.div
                    key={particle.id}
                    initial={{ opacity: 1, scale: 0.5, x: 0, y: 0 }}
                    animate={{ 
                      opacity: [1, 1, 0],
                      scale: [1, 1.8, 1],
                      x: particle.x,
                      y: particle.y,
                      rotate: [0, Math.random() * 360]
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="absolute left-1/2 text-2xl select-none"
                    style={{ transform: "translateX(-50%)" }}
                  >
                    {particle.symbol}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* THE FROG MASCOT DRESSING & FEEDING DRAGZONE */}
            <div className="relative my-4 flex items-center justify-center">
              <motion.div
                animate={currentState === "eating" ? {
                  scale: [1, 1.15, 0.95, 1.1, 1],
                  rotate: [0, -3, 3, -1, 0]
                } : currentState === "sad_error" ? {
                  x: [-8, 8, -8, 8, -4, 4, 0],
                  rotate: [-4, 4, -4, 4, -2, 2, 0]
                } : {
                  y: [0, -6, 0],
                  scaleX: [1, 1.02, 1],
                  scaleY: [1, 0.97, 1]
                }}
                transition={currentState === "eating" || currentState === "sad_error" ? {
                  duration: 0.5,
                  ease: "easeInOut"
                } : {
                  duration: 2.8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className={`relative select-none cursor-pointer p-4 transition-all z-20 ${
                  draggedOverMascot ? "scale-105" : ""
                }`}
                onClick={() => {
                  playPouSound("click", muted);
                  if (currentState === "normal") {
                    setCurrentState("love");
                    setTimeout(() => setCurrentState("normal"), 1500);
                  }
                }}
              >
                {/* Crown for streaks */}
                {streak >= 4 && (
                  <motion.div
                    animate={{ rotate: [-8, 8, -8], y: [-2, 2, -2] }}
                    transition={{ repeat: Infinity, duration: 1.8 }}
                    className="absolute -top-10 left-1/2 -translate-x-1/2 text-4xl z-35 drop-shadow-[0_3px_3px_rgba(0,0,0,0.3)]"
                  >
                    👑
                  </motion.div>
                )}

                {/* Heart pops */}
                {currentState === "love" && (
                  <div className="absolute -top-10 left-0 right-0 flex justify-between pointer-events-none text-xl z-30">
                    <span className="animate-ping">❤️</span>
                    <span className="animate-bounce">💖</span>
                    <span className="animate-ping">💝</span>
                  </div>
                )}

                {/* THE CHUBBY GREEN FROG - EXCELLENT DETAILED HANDS & FEET SHOWN! */}
                <div 
                  className={`w-40 h-34 transition-colors duration-300 relative border-4 border-slate-900 shadow-[0_10px_0px_rgba(15,23,42,0.15)] flex flex-col items-center justify-center ${currentStyles.bgColor}`}
                  style={{
                    borderRadius: "52% 52% 44% 44% / 62% 62% 38% 38%",
                  }}
                >
                  {/* 🍀 Four-leaf Clover (Trébol de 4 hojas) on the mascot's head! */}
                  <div className="absolute -top-11 left-1/2 -translate-x-1/2 z-25 drop-shadow-[0_2px_3px_rgba(0,0,0,0.3)] pointer-events-none select-none">
                    <svg viewBox="0 0 40 40" className="w-10 h-10 animate-pulse" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {/* Stem */}
                      <path d="M 20 22 Q 17 32, 19 36" stroke="#15803d" strokeWidth="3" strokeLinecap="round" fill="none" />
                      {/* 4 leaflets */}
                      <g transform="translate(20, 20)">
                        <path d="M 0 0 C -3 -6, 3 -6, 0 0 Z" fill="#10b981" stroke="#0f172a" strokeWidth="2.5" strokeLinejoin="round" />
                        <path d="M 0 0 C -3 -6, 3 -6, 0 0 Z" fill="#10b981" stroke="#0f172a" strokeWidth="2.5" strokeLinejoin="round" transform="rotate(90)" />
                        <path d="M 0 0 C -3 -6, 3 -6, 0 0 Z" fill="#10b981" stroke="#0f172a" strokeWidth="2.5" strokeLinejoin="round" transform="rotate(180)" />
                        <path d="M 0 0 C -3 -6, 3 -6, 0 0 Z" fill="#10b981" stroke="#0f172a" strokeWidth="2.5" strokeLinejoin="round" transform="rotate(270)" />
                        <circle cx="0" cy="0" r="0.8" fill="#a7f3d0" />
                      </g>
                    </svg>
                  </div>

                  {/* TWO HUGE PROTRUDING FROG EYES WITH GREEN BACKINGS */}
                  <div className="absolute -top-7 inset-x-3 flex justify-between px-0.5 z-10">
                    {/* Left Eye with green backing */}
                    <div className="relative">
                      <div className={`w-14 h-14 rounded-full border-4 border-slate-900 ${currentStyles.bgColor} absolute -top-1 -left-1`} />
                      <div className="w-12 h-12 bg-white rounded-full border-4 border-slate-900 flex items-center justify-center relative shadow-sm overflow-hidden z-10">
                        <motion.div 
                          animate={{ x: eyeOffset.x, y: eyeOffset.y }}
                          className="w-5 h-5 bg-slate-950 rounded-full relative flex items-center justify-center"
                        >
                          <div className="w-1.5 h-1.5 bg-white rounded-full absolute top-0.5 left-0.5" />
                        </motion.div>
                      </div>
                    </div>

                    {/* Right Eye with green backing */}
                    <div className="relative">
                      <div className={`w-14 h-14 rounded-full border-4 border-slate-900 ${currentStyles.bgColor} absolute -top-1 -left-1`} />
                      <div className="w-12 h-12 bg-white rounded-full border-4 border-slate-900 flex items-center justify-center relative shadow-sm overflow-hidden z-10">
                        <motion.div 
                          animate={{ x: eyeOffset.x, y: eyeOffset.y }}
                          className="w-5 h-5 bg-slate-950 rounded-full relative flex items-center justify-center"
                        >
                          <div className="w-1.5 h-1.5 bg-white rounded-full absolute top-0.5 left-0.5" />
                        </motion.div>
                      </div>
                    </div>
                  </div>

                  {/* Cheeks */}
                  <div className={`absolute top-12 left-3.5 w-6 h-4 rounded-full transition-all duration-300 ${currentStyles.blush}`} />
                  <div className={`absolute top-12 right-3.5 w-6 h-4 rounded-full transition-all duration-300 ${currentStyles.blush}`} />

                  {/* Belly Patch */}
                  <div className="absolute bottom-1 w-20 h-10 bg-green-100 border-t-4 border-slate-900 rounded-t-full flex items-center justify-center overflow-hidden">
                    <span className="text-[10px] font-black tracking-wider text-green-800 opacity-90 uppercase">
                      Ranita
                    </span>
                  </div>

                  {/* Cute Frog Hands/Arms inside body */}
                  <div className="absolute left-1 bottom-1/2 w-4 h-5 rounded-full border-2 border-slate-900 rotate-12 bg-inherit" />
                  <div className="absolute right-1 bottom-1/2 w-4 h-5 rounded-full border-2 border-slate-900 -rotate-12 bg-inherit" />

                  {/* MOUTH ZONE */}
                  <div className="absolute top-12 left-0 right-0 flex justify-center items-center z-10 h-16">
                    <div className={`transition-all duration-200 flex items-center justify-center ${currentStyles.mouthStyle}`}>
                      {currentState === "hungry" && (
                        <div className="w-10 h-8 bg-indigo-950/20 absolute -bottom-1 rounded-full border-t-2 border-slate-950 flex items-center justify-center">
                          <span className="text-base">👅</span>
                        </div>
                      )}
                      {currentState === "love" && <span>✨</span>}
                    </div>
                  </div>
                </div>

                {/* Back Frog Legs protruding on the sides */}
                <div className={`w-8 h-8 rounded-full border-4 border-slate-900 absolute -bottom-1 -left-4 -z-10 ${currentStyles.bgColor} shadow-sm`} />
                <div className={`w-8 h-8 rounded-full border-4 border-slate-900 absolute -bottom-1 -right-4 -z-10 ${currentStyles.bgColor} shadow-sm`} />

                {/* Lilypad */}
                <div className="w-48 h-6 bg-emerald-800 rounded-full absolute -bottom-3 left-1/2 -translate-x-1/2 -z-30 border-4 border-slate-900 shadow-[0_5px_0px_rgba(15,23,42,1)]" />
              </motion.div>

              {/* Magnet Drop Feedback Overlay */}
              {currentState === "hungry" && (
                <div 
                  className={`absolute -inset-6 border-4 border-dashed rounded-[36px] pointer-events-none z-10 flex items-center justify-center flex-col transition-colors ${
                    draggedOverMascot ? "border-emerald-500 bg-emerald-500/10" : "border-slate-400/20"
                  }`}
                />
              )}
            </div>

            {/* POU Bubble Dialog Box */}
            <div className="w-full bg-white border-4 border-slate-900 rounded-2xl p-3 relative shadow-[3px_3px_0px_rgba(15,23,42,1)] z-10 mb-2">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-5 h-5 bg-white border-t-4 border-l-4 border-slate-900 rotate-45" />
              <div className="text-center">
                <span className="text-[8px] font-black text-slate-400 block uppercase tracking-wider mb-0.5">
                  La ranita dice:
                </span>
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  "{currentState === "sad_error" 
                    ? "¡Ay! Eso contamina mi estómago o estanque de agua..."
                    : currentState === "eating"
                      ? "¡OM-NOM-NOM! ¡Sabroso reciclaje seco!"
                      : currentItem?.hint || "¡Hola! ¿Sabes en qué tacho se recicla esto?"}"
                </p>
              </div>
            </div>
          </div>

          {/* 🍽️ RIGHT CONTAINER: DIETARY CARD SHELF & TACHOS DE BASURA */}
          <div className="bg-amber-50 text-slate-950 border-4 border-slate-900 rounded-[32px] p-5 flex flex-col justify-between shadow-[6px_6px_0px_rgba(15,23,42,1)] relative overflow-hidden">
            <div className="absolute inset-0 bg-[#e67e22]/5 bg-[size:8px_8px] pointer-events-none" />

            {showTutorial && (
              <div className="mb-4 p-3 bg-yellow-200 border-4 border-slate-900 rounded-2xl font-bold text-[11px] text-slate-800 space-y-1 relative shadow-[3px_3px_0px_rgba(15,23,42,1)] z-10">
                <button 
                  onClick={() => {
                    playPouSound("click", muted);
                    setShowTutorial(false);
                  }}
                  type="button"
                  className="absolute top-1 right-2 text-slate-600 hover:text-slate-950 font-black text-xs cursor-pointer"
                >
                  ✕
                </button>
                <p className="font-black text-slate-900 uppercase tracking-wider flex items-center gap-1 leading-none">
                  🌻 ¡A reciclar en los Tachos de Basura!
                </p>
                <p className="font-semibold text-slate-750">
                  Arrastra el residuo con tu <strong className="text-emerald-700">dedo/mouse</strong> directo a la boca de Pou o al <strong className="text-blue-700">tacho de basura correspondiente</strong>. ¡También puedes pulsar el tacho directamente!
                </p>
              </div>
            )}

            {/* WOODEN SHELF CURRENT ITEM */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-1 leading-none">
                  🍩 Mesa de Residuos
                </span>
                <span className="text-[9px] font-black text-slate-900 bg-white border-2 border-slate-900 py-0.5 px-2 rounded-md shadow-[1px_1px_0px_rgba(0,0,0,1)] leading-none">
                  {currentItemIndex + 1} de {shuffledItems.length}
                </span>
              </div>

              {/* DRAG-AND-DROP ACTIVE WASTE CARD */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentItem?.id || "empty"}
                  initial={{ opacity: 0, scale: 0.9, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -15 }}
                  transition={{ duration: 0.25 }}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  style={dragStyle}
                  className={`border-4 rounded-2xl p-4 relative select-none cursor-grab active:cursor-grabbing transition-colors text-slate-950 ${
                    feedback 
                      ? feedback.isCorrect 
                        ? "bg-emerald-100 border-emerald-500 shadow-[3px_3px_0px_rgba(16,185,129,1)]"
                        : "bg-red-100 border-red-500 shadow-[3px_3px_0px_rgba(239,68,68,1)]"
                      : "bg-white border-slate-900 hover:border-slate-950 shadow-[4px_4px_0px_rgba(15,23,42,1)]"
                  }`}
                >
                  {!feedback && (
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-yellow-100 border-2 border-slate-900 rounded text-[7px] font-black text-slate-800 uppercase tracking-wider animate-pulse flex items-center gap-1">
                      <span>🍕 Arrastra al tacho</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-105 border-4 border-slate-900 flex items-center justify-center text-3xl shrink-0 bg-[radial-gradient(#ccc_20%,transparent_20%)] bg-[size:8px_8px] shadow-inner">
                      <div>{currentItem?.icon}</div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1 mb-0.5">
                        <span className={`text-[7px] font-black uppercase border-2 border-slate-900 px-1 rounded ${
                          currentItem?.difficulty === "Fácil" 
                            ? "bg-emerald-300 text-slate-900"
                            : currentItem?.difficulty === "Medio"
                              ? "bg-yellow-300 text-slate-900"
                              : "bg-pink-300 text-slate-900"
                        }`}>
                          {currentItem?.difficulty}
                        </span>
                        <span className="text-[8px] font-bold text-slate-850 leading-none truncate">
                          ⏳ {currentItem?.degradation}
                        </span>
                      </div>

                      <h4 className="text-xs font-black text-slate-950 truncate leading-tight">
                        {currentItem?.name}
                      </h4>
                    </div>
                  </div>

                  {/* FEEDBACK EXPLOSION */}
                  {feedback?.show && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-3 pt-3 border-t-2 border-dashed border-slate-900 space-y-2"
                    >
                      <div className={`p-2.5 rounded-xl text-xs flex items-start gap-2 border-2 border-slate-900 ${
                        feedback.isCorrect ? "bg-emerald-250 text-emerald-950" : "bg-red-200 text-red-950"
                      }`}>
                        {feedback.isCorrect ? <span className="text-sm shrink-0">🟢</span> : <span className="text-sm shrink-0">❌</span>}
                        <div>
                          <strong className="block text-[8px] uppercase font-black tracking-widest text-slate-950 mb-0.5">
                            {feedback.isCorrect ? "¡LOGRADO!" : "¡ESPUTADO!"}
                          </strong>
                          <p className="text-[10px] font-bold leading-tight text-slate-950">{feedback.message}</p>
                        </div>
                      </div>

                      {/* Educational fact */}
                      <div className="bg-white border-2 border-slate-900 rounded-xl p-2.5 text-xs text-slate-900 leading-relaxed flex gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 animate-bounce" />
                        <div>
                          <strong className="text-slate-950 font-black text-[9px] block uppercase tracking-wider mb-0.5">📚 ¿Sabías que?</strong>
                          <p className="text-[10px] font-medium leading-normal text-slate-900">{feedback.item?.funFact}</p>
                        </div>
                      </div>

                      {/* Siguiente Button */}
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => {
                            playPouSound("click", muted);
                            nextQuestion();
                          }}
                          type="button"
                          className="bg-yellow-400 hover:bg-yellow-300 border-4 border-slate-900 text-slate-950 font-black text-[10px] py-1.5 px-3 rounded-xl flex items-center gap-1 shadow-[2px_2px_0px_rgba(15,23,42,1)] active:translate-x-0.5 active:translate-y-0.5 font-sans cursor-pointer uppercase tracking-wider"
                        >
                          <span>Siguiente Plato</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* TACHOS DE BASURA RECYCLING CONTAINERS ZONE */}
            <div className="mt-5 space-y-3">
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 block leading-none">
                🥫 Tachos de basura receptores:
              </span>

              {/* Tacho grid: 2x2. Perfect and ultra compact on cell phones! */}
              <div className="grid grid-cols-2 gap-3">
                {BINS_CONFIG.map((bin) => {
                  const isOver = draggedOverBin === bin.type;
                  const isDisabled = !!feedback?.show;

                  return (
                    <button
                      key={bin.type}
                      id={`bin-${bin.type}`}
                      data-bin={bin.type}
                      onClick={() => {
                        if (!isDisabled) {
                          playPouSound("click", muted);
                          handleClassification(bin.type);
                        }
                      }}
                      type="button"
                      disabled={isDisabled}
                      className={`relative flex flex-col items-center justify-end p-2 rounded-2xl border-4 border-slate-900 cursor-pointer pt-6 transition-all bg-gradient-to-b from-stone-100 to-amber-100/40 select-none ${
                        isOver 
                          ? "ring-4 ring-emerald-500 scale-105 shadow-[0_0_15px_rgba(16,185,129,0.3)] bg-emerald-50" 
                          : "shadow-[3px_3px_0px_rgba(15,23,42,1)] hover:-translate-y-0.5 active:shadow-[1px_1px_0px_rgba(15,23,42,1)] active:translate-y-0.5"
                      } ${isDisabled ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                      {/* Interactive Lid (Lid handle + main lid) */}
                      <motion.div
                        animate={isOver ? { y: -10, rotate: -12, scale: 1.05 } : { y: 0, rotate: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 350, damping: 15 }}
                        className="w-16 absolute top-1.5 z-10 select-none pointer-events-none"
                      >
                        {/* Lid Handle */}
                        <div className="w-4 h-1.5 mx-auto bg-slate-700 border-2 border-slate-900 rounded-t-sm" />
                        {/* Lid body */}
                        <div className={`w-full h-2.5 border-2 border-slate-900 rounded-t-md ${bin.type === "metal" ? "bg-slate-350" : bin.lidColor}`} />
                      </motion.div>

                      {/* Tapered garbage bin body with vertical ridges */}
                      {/* Uses clipping/dimensions to depict a highly graphical cartoon bin */}
                      <div className="w-14 h-16 relative flex flex-col items-center justify-between p-1 overflow-hidden select-none pointer-events-none rounded-b-xl border-x-4 border-b-4 border-slate-905 bg-slate-100">
                        {/* The core color backdrop representing category */}
                        <div className={`absolute inset-0 ${bin.bodyColor}`} />
                        
                        {/* Shadow layers for 3D depth */}
                        <div className="absolute inset-y-0 left-0 w-2.5 bg-white/10" />
                        <div className="absolute inset-y-0 right-0 w-2.5 bg-black/15" />

                        {/* Ridges */}
                        <div className="absolute inset-y-2 left-[20%] w-0.5 bg-black/15 rounded-full" />
                        <div className="absolute inset-y-2 left-[50%] w-0.5 bg-black/15 rounded-full" />
                        <div className="absolute inset-y-2 left-[80%] w-0.5 bg-black/15 rounded-full" />

                        {/* Central Category Symbol */}
                        <div className="z-10 bg-white/90 border border-slate-900 rounded-full w-7 h-7 flex items-center justify-center shadow-sm text-base mt-2">
                          <span className="leading-none select-none">
                            {bin.type === "plastic" ? "🥤" : bin.type === "glass" ? "🍾" : bin.type === "metal" ? "🥫" : "📦"}
                          </span>
                        </div>

                        {/* Tiny Category Text label inside the bin body */}
                        <span className={`z-10 text-[7px] font-black tracking-wider uppercase drop-shadow-md mb-0.5 truncate max-w-[48px] ${bin.type === "metal" ? "text-slate-900" : "text-white"}`}>
                          {bin.type === "plastic" ? "Plást." : bin.type === "glass" ? "Vidr." : bin.type === "metal" ? "Met." : "Pap."}
                        </span>
                      </div>

                      {/* Secondary textual label beneath the bin illustration */}
                      <div className="mt-2 text-center w-full">
                        <span className="text-[10px] font-black text-slate-800 uppercase block tracking-tight truncate leading-none">
                          {bin.label}
                        </span>
                        <span className="text-[8px] font-bold text-slate-500 block leading-tight mt-0.5">
                          {bin.name}
                        </span>
                      </div>

                      {/* Inside Magnet Indicator Drop feedback overlay text */}
                      {isOver && (
                        <div className="absolute inset-x-1 bottom-1 bg-emerald-500 border border-slate-900 py-0.5 rounded-lg text-[8px] font-black uppercase text-white animate-pulse">
                          🟢 Soltar
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer scorecard inside desk */}
            <div className="pt-3 mt-3 border-t-2 border-dashed border-slate-900/40 flex justify-between items-center text-[10px] font-black text-slate-800">
              <span className="flex items-center gap-1 leading-none">
                <Award className="w-3.5 h-3.5 text-slate-900" />
                <span>Precisión: </span>
                <strong className="text-emerald-700 font-extrabold">
                  {answersCount.total > 0 
                    ? Math.round((answersCount.correct / answersCount.total) * 100) 
                    : 100}%
                </strong>
              </span>

              <button
                onClick={() => {
                  playPouSound("click", muted);
                  shuffleNewGame();
                }}
                type="button"
                className="bg-white border-2 border-slate-900 py-1 px-2 rounded-lg text-[8px] font-black uppercase hover:bg-slate-50 cursor-pointer shadow-[1.5px_1.5px_0px_rgba(15,23,42,1)] active:translate-x-0.5 active:translate-y-0.5 leading-none flex items-center gap-1 font-sans"
              >
                <RotateCcw className="w-3 h-3 stroke-[3]" />
                <span>Reiniciar</span>
              </button>
            </div>

          </div>
        </div>
      ) : activeTab === "workshop" ? (
        <RecyclingWorkshop 
          onRewardStars={handleWorkshopStars} 
          onPurityChange={handleWorkshopPurity} 
        />
      ) : (
        /* 📖 ALBUM RECIPES BOOK */
        <div className="bg-[#f7eedc] text-slate-950 border-4 border-slate-900 rounded-[32px] p-5 space-y-6 shadow-[6px_6px_0px_rgba(15,23,42,1)] relative overflow-hidden">
          <div className="absolute inset-0 bg-[#e67e22]/5 bg-[size:8px_8px] pointer-events-none" />

          <div className="text-center max-w-xl mx-auto space-y-1 relative z-10">
            <h4 className="text-base font-black text-slate-900 uppercase tracking-wide">
              📖 Manual de Nutrición Sanitaria Pou
            </h4>
            <p className="text-[11px] font-bold text-slate-700 leading-relaxed">
              Descubre qué golosinas secas le encantan a Ambientalito y cómo fabrican materiales totalmente nuevos. Recuerda que no aceptamos restos orgánicos con líquidos, pues dañan el sistema.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
            {BINS_CONFIG.map((bin) => {
              const matchedItems = RECYCLABLE_ITEMS.filter(item => item.category === bin.type);
              
              return (
                <div key={bin.type} className="bg-white border-4 border-slate-900 rounded-2xl p-4 space-y-3 shadow-[3px_3px_0px_rgba(15,23,42,1)]">
                  <div className="flex items-center justify-between border-b-2 border-dashed border-slate-900 pb-1.5">
                    <div>
                      <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest">{bin.name}</span>
                      <h5 className="text-xs font-black text-slate-900 uppercase tracking-wider">{bin.label}</h5>
                    </div>
                    <span className="text-2xl bg-yellow-50 border-2 border-slate-900 p-1 rounded-xl block shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                      {bin.type === "plastic" ? "🥤" : bin.type === "glass" ? "🍾" : bin.type === "metal" ? "🥫" : "📦"}
                    </span>
                  </div>

                  <p className="text-[10px] font-semibold text-slate-700 leading-tight">
                    Recetas sólidas limpias perfectas para fundición ecológica o co-procesado sin moho.
                  </p>

                  <div className="space-y-1.5 mt-2">
                    <span className="text-[7.5px] font-black uppercase text-slate-400 tracking-wider block">Menú Favorito:</span>
                    <div className="space-y-1.5">
                      {matchedItems.map(item => (
                        <div key={item.id} className="p-2 bg-yellow-50/50 border-2 border-slate-900 rounded-xl text-[10px] font-bold text-slate-800 flex items-start gap-2">
                          <span className="text-lg bg-white w-6.5 h-6.5 rounded-lg border border-slate-950 flex items-center justify-center shrink-0 shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                            {item.icon}
                          </span>
                          <div>
                            <span className="font-extrabold text-slate-950 block">{item.name}</span>
                            <span className="text-[8.5px] font-semibold text-slate-500 block leading-tight">
                              Ciclo: {item.degradation}. {item.hint}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FOOTER GENERAL RULES BADGE */}
      <div className="p-3.5 bg-lime-50 border-4 border-slate-900 rounded-2xl flex items-start gap-2.5 text-slate-800 text-[10.5px] leading-relaxed shadow-[3px_3px_0px_rgba(15,23,42,1)]">
        <span className="text-xl mt-0.5 shrink-0 select-none">💡</span>
        <div>
          <strong className="text-slate-900 font-black uppercase tracking-wider block mb-0.5 leading-none">Cuidado Alimentario Sanitario</strong>
          Para que el veterinario permita reciclar estos platos, es estrictamente obligatorio entregarlos **limpios y secos**. El papel húmedo o plástico con restos de comida se pudre rápido y provoca gases dañinos en los hornos. ¡Ayuda a Pou a conservar su ecosistema! 🐸🌻
        </div>
      </div>

    </div>
  );
}
