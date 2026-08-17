import React, { useState } from "react";
import { 
  Lightbulb, 
  Hammer, 
  Check, 
  Clock, 
  Heart, 
  ChevronRight, 
  BadgeHelp, 
  Sparkles, 
  CheckCircle2, 
  Users, 
  Timer, 
  Award,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Project {
  id: string;
  title: string;
  description: string;
  materialCategory: "plastic" | "glass" | "metal" | "paper" | "organic";
  difficulty: "Fácil" | "Medio" | "Avanzado";
  timeEstimated: string;
  circularImpact: string;
  materialsNeeded: string[];
  steps: string[];
  tips?: string[];
  funFact: string;
  imageUrl: string;
}

const PROJECTS_DATA: Project[] = [
  {
    id: "p1",
    title: "Alcancía de Cerdito Reutilizada",
    description: "Transforma una simple botella plástica de refresco en una alcancía divertida para fomentar el ahorro y evitar el plástico de un solo uso.",
    materialCategory: "plastic",
    difficulty: "Fácil",
    timeEstimated: "20 min",
    circularImpact: "Extiende el ciclo de uso de botella PET por meses o años adicionales, evitando su desecho inmediato en vertederos.",
    materialsNeeded: [
      "1 Botella de plástico limpia (PET de 500ml o 1L)",
      "Cutter o tijeras de manualidades",
      "4 Tapas de botellas adicionales (para las patitas)",
      "Pintura acrílica de color a gusto o plumones permanentes",
      "Pegamento fuerte o cinta adhesiva doble cara"
    ],
    steps: [
      "Limpia y seca perfectamente la botella de plástico por dentro y por fuera.",
      "Con la ayuda de un cutter, corta una ranura de unos 3 cm de largo por 4 mm de ancho en el lomo lateral de la botella (para introducir las monedas).",
      "Pega las 4 tapas plásticas adicionales en la base opuesta del lomo para simular las dulces patitas del cerdito.",
      "Decora el cuerpo. Puedes pintar la botella de rosa u otro color, y dibujar los ojitos cerca del pico con plumón.",
      "Usa la tapa original de la botella como la hermosa trompa del cerdito y dibújale dos puntitos negros para los orificios de la nariz. ¡Listo para recibir monedas!"
    ],
    tips: [
      "Si la botella es translúcida, puedes dejarla así para observar cómo crece tu valioso ahorro día a día.",
      "Utiliza pegamento de silicona fría o cinta gruesa de doble contacto para asegurar mejor las tapas de las patas."
    ],
    funFact: "La palabra 'alcancía' viene del árabe 'al-kanziyya', que significa 'el tesoro'. Al reaprovechar plásticos, ¡tu tesoro ecológico es el doble de grande!",
    imageUrl: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "p2",
    title: "Macetero de Autorriego Ecológico",
    description: "Crea un contenedor hidropónico que riega tus plantas automáticamente utilizando gravedad y capilaridad, ideal para hierbas aromáticas.",
    materialCategory: "plastic",
    difficulty: "Fácil",
    timeEstimated: "15 min",
    circularImpact: "Fomenta la agricultura de autoconsumo urbano usando plásticos existentes en lugar de comprar macetas vírgenes.",
    materialsNeeded: [
      "1 Botella plástica transparente (PET de 1.5L o 2L)",
      "Tijeras resistentes o cutter",
      "Tira de cordón de algodón o lana gruesa (20-30 cm de largo)",
      "Tierra fértil para macetas",
      "Semillas o plántula pequeña de tu elección (ej. albahaca, menta)"
    ],
    steps: [
      "Corta la botella por la mitad con ayuda de las tijeras.",
      "Haz un agujero pequeño en el centro de la tapa de la botella (puedes calentar un clavo o usar la punta de las tijeras).",
      "Pasa el cordón de algodón por el agujero de la tapa, dejando unos 10 cm a cada lado, y enrosca la tapa de nuevo.",
      "Coloca la parte superior de la botella (con la tapa boca abajo) dentro de la mitad inferior, asegurándote de que el cordón toque el fondo.",
      "Llena la parte superior con tierra fértil, cuidando que el cordón de algodón quede rodeado por la tierra cerca del centro.",
      "Agrega agua en la base inferior y siembra tus semillas en la tierra. ¡Por capilaridad, la planta absorberá el agua necesaria sin ahogarse!"
    ],
    tips: [
      "Asegúrate de que el cordón sea de algodón 100%, ya que los materiales sintéticos no transportan tan bien el agua.",
      "Limpia el depósito de agua inferior cada 2 semanas para evitar la proliferación de algas."
    ],
    funFact: "Los sistemas de autorriego imitan el fenómeno natural de la capilaridad del suelo, reduciendo el consumo de agua hasta en un 60% comparado con el riego tradicional.",
    imageUrl: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "p3",
    title: "Portavelas Cozy de Mosaico",
    description: "Transforma envases de vidrio vacíos de mermelada o conservas en portavelas atmosféricos que emiten una luz cálida y colorida.",
    materialCategory: "glass",
    difficulty: "Fácil",
    timeEstimated: "25 min",
    circularImpact: "Evita la recolección energética intensiva de fundición de vidrio extendiendo al máximo la vida del recipiente en su estado original.",
    materialsNeeded: [
      "1 Frasco de vidrio transparente y limpio",
      "Papel de seda de diferentes colores (o trozos de papel translúcido)",
      "Pegamento escolar blanco templado con un poquito de agua (cola blanca)",
      "Pincel para aplicar el pegamento",
      "1 Vela pequeña tipo té o luces LED de batería"
    ],
    steps: [
      "Retira etiquetas del frasco lavándolo con agua caliente y bicarbonato de sodio.",
      "Rasga el papel de seda en trozos de diferentes formas geométricas o tiras con las manos.",
      "Aplica con el pincel una capa fina de pegamento diluido directamente sobre las paredes exteriores del frasco.",
      "Pega con cuidado los trozos de papel de seda de manera traslapada por toda la superficie exterior.",
      "Aplica una última capa de cola blanca por encima para sellar el papel y darle un acabado satinado uniforme. Deja secar por 1 hora.",
      "Introduce la vela pequeña en el interior del frasco. ¡Al encenderla tendrás una lámpara festiva con un diseño personalizado!"
    ],
    tips: [
      "Un cordel rústico o cinta de yute atados alrededor del cuello del frasco le darán un toque extra campestre sumamente elegante."
    ],
    funFact: "El vidrio se puede reciclar infinitamente sin perder pureza ni calidad, pero reusar directamente consume 0% de energía térmica, siendo una opción aún más verde.",
    imageUrl: "https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "p4",
    title: "Vasos Artesanales con Botellas",
    description: "Corta botellas de refrescos o bebidas de vidrio grueso para crear vasos minimalistas de alta durabilidad para tu cocina.",
    materialCategory: "glass",
    difficulty: "Avanzado",
    timeEstimated: "40 min",
    circularImpact: "Convierte residuos de botellas no retornables en cristalería funcional útil, logrando un ahorro rotundo de recursos domésticos.",
    materialsNeeded: [
      "Botella de vidrio grueso (por ejemplo, de refrescos artesanales u oliva)",
      "Cortador de botellas de vidrio común (o cordón grueso humedecido en alcohol e hilo de fricción)",
      "Lija para vidrio de diferentes granos (N° 120, 240 y 400)",
      "Agua helada en un balde grande y agua hirviendo"
    ],
    steps: [
      "Limpia la botella y retira todo pegamento superficial.",
      "Marca una línea continua recta alrededor de la botella a la altura que deseas tu vaso usando la herramienta de corte.",
      "Gira la marca sobre un chorrito controlado de agua caliente (casi hirviendo) durante 20 segundos, e inmediatamente gírala en agua helada por 10 segundos. Repite hasta que se separe debido al choque térmico.",
      "Lija pacientemente los bordes resultantes de manera circular usando primero la lija gruesa, luego la mediana y finalmente la fina para eliminar cualquier filo.",
      "Pasa tu dedo con cuidado para verificar que la superficie esté completamente redondeada y segura al tacto. ¡Lava el vaso y a servir!"
    ],
    tips: [
      "Siempre realiza este proyecto utilizando gafas de seguridad para evitar pequeños fragmentos de vidrio voladores.",
      "No uses demasiada fuerza al marcar la botella; un solo trazo firme es suficiente para guiar la fisura lineal con temperatura."
    ],
    funFact: "Un vaso de vidrio reusado puede durar generaciones. ¡Al fabricarlos tú mismo ahorras un importante impacto ambiental e industrial!",
    imageUrl: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "p5",
    title: "Organizador Imantado de Latas",
    description: "Recupera latas de conserva metálicas para fabricar contenedores de pared magnéticos para lápices, tijeras y herramientas de escritorio.",
    materialCategory: "metal",
    difficulty: "Medio",
    timeEstimated: "30 min",
    circularImpact: "Sustituye recipientes plásticos organizadores de escritorio aprovechando la alta rigidez estructural de la hojalata o el aluminio desechado.",
    materialsNeeded: [
      "2-3 Latas de conserva metálicas grandes y limpias",
      "Pintura en spray acrílica o sobrantes de pintura de pared",
      "Imanes potentes de neodimio (con pegamento epóxico) o soporte adhesivo magnético",
      "Abrelatas de corte liso (importante para evitar bordes filosos)"
    ],
    steps: [
      "Utiliza un abrelatas de corte de seguridad para remover la tapa de la lata dejando un borde liso sin filo peligroso.",
      "Lava y seca meticulosamente la lata de metal para remover residuos orgánicos y olores.",
      "Pinta la lata a tu gusto: puedes usar colores pastel o dejar el brillo metálico natural cubierto de un sellador.",
      "Pega los imanes de neodimio firmemente con adhesivo epóxico sobre el área de la costura trasera de la lata.",
      "Colócala en cualquier pizarra metálica o en la puerta del refrigerador. Ideal para colocar llaves, utensilios o bolígrafos."
    ],
    tips: [
      "Si los costados de la lata quedaron filosos, puedes cubrirlos con cinta decorativa de tela (washi tape) o fieltro.",
      "Si no tienes imanes, puedes unir 3 o 4 latas de diferentes tamaños con un cordel grueso para crear un set organizador multifuncional para tu mesa."
    ],
    funFact: "La hojalata es una lámina de acero recubierta de estaño que protege el alimento. ¡Este material es increíblemente duradero, rígido y 100% magnético!",
    imageUrl: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "p6",
    title: "Comedero Silvestre para Aves",
    description: "Crea un hermoso comedero colgante utilizando una lata de metal decorada, brindando alimento a las aves libres de tu vecindario.",
    materialCategory: "metal",
    difficulty: "Fácil",
    timeEstimated: "20 min",
    circularImpact: "Aprovecha el metal residual para beneficiar a la biodiversidad circundante y estimular el equilibrio de los ecosistemas urbanos.",
    materialsNeeded: [
      "1 Lata de conserva metálica estándar sin tapa",
      "Un palito de madera o cuchara de madera vieja de cocina (como posadero)",
      "Cuerda resistente, cinta de tela, o rafia de 1 metro",
      "Pintura acrílica de colores alegres",
      "Pegamento para manualidades o silicona"
    ],
    steps: [
      "Limpia la lata de conserva y dale un par de capas de pintura de exterior para protegerla del óxido de la lluvia.",
      "Pega el palito o la cuchara de madera de forma longitudinal saliendo unos 5 a 10 cm fuera de la boca de la lata (servirá de posadero para los pajaritos).",
      "Pasa una cuerda fuerte alrededor de la lata de manera que puedas colgarla de forma horizontal en la rama de un árbol.",
      "Llena la mitad interior de la lata con semillas mixtas para pájaros silvestres.",
      "Busca un rincón tranquilo de tu jardín o balcón para colgar el comedero y ¡disfruta de la visita de la hermosa fauna local!"
    ],
    tips: [
      "Puedes rellenar el comedero con semillas de girasol, mijo, avena y maíz quebrado.",
      "Cuélgalo a una altura adecuada que esté a salvo de depredadores domésticos como gatitos inquietos."
    ],
    funFact: "Las aves silvestres desempeñan un papel fundamental en la dispersión de semillas de plantas nativas y en el control orgánico de plagas en jardines urbanos.",
    imageUrl: "https://images.unsplash.com/photo-1452570053594-1b985d6ea890?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "p7",
    title: "Semilleros Biodegradables de Cartón",
    description: "Prepara recipientes iniciales de germinación para hortalizas usando cartón de huevo que se degrada directamente al sembrarlo en tierra.",
    materialCategory: "paper",
    difficulty: "Fácil",
    timeEstimated: "10 min",
    circularImpact: "Elimina el desecho de macetas de plástico de semillero ya que se descomponen orgánicamente aportando carbono al suelo.",
    materialsNeeded: [
      "1 Cartón de huevos de celulosa prensada (no de poliestireno plástico)",
      "Un punzón o aguja gruesa",
      "Tierra para semilleros bien abonada",
      "Semillas hortícolas de rápido crecimiento (tomate, pimiento, lechuga)"
    ],
    steps: [
      "Corta la tapa del cartón de huevo colocando la base sobre la mesa de trabajo.",
      "Con un punzón o tijera, haz un pequeño agujero de drenaje en la base de cada una de las copitas del cartón.",
      "Rellena cada cavidad con mezcla húmeda de tierra de semillero sin apretarla demasiado.",
      "Introduce 1 o 2 semillas según las indicaciones de siembra y cúbrelas con una capa delgada de tierra.",
      "Riega suavemente con un atomizador de agua para mantener la humedad sin saturar.",
      "Cuando broten las plántulas y alcancen 6-8 cm, simplemente recorta cada copita individual con tijera y siémbrala completa y directamente en la maceta final o jardín. El cartón se ablandará, nutrirá las raíces y desaparecerá ecológicamente."
    ],
    tips: [
      "Puedes rotular el tipo de semilla directamente con lápiz en el borde exterior del cartón para mantener orden en tu jardín urbano.",
      "La celulosa absorbe agua y mantiene un entorno óptimo para que la raíz germine sin shock de trasplante."
    ],
    funFact: "El cartón gris prensado está hecho principalmente de papel periódico reciclado y fibras vegetales. ¡Al enterrarlo, se convierte de nuevo en abono orgánico!",
    imageUrl: "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "p8",
    title: "Caja Organizadora de Cables",
    description: "Usa rollos de papel higiénico gastados y una caja de zapatos para ordenar la maraña de cables y cargadores de tu oficina.",
    materialCategory: "paper",
    difficulty: "Fácil",
    timeEstimated: "15 min",
    circularImpact: "Revaloriza el cartón hogareño común brindando una solución inteligente a la obsolescencia y el caos organizativo de accesorios tecnológicos.",
    materialsNeeded: [
      "1 Caja de zapatos vacía de cartón rígido",
      "10 a 16 tubos cilíndricos de cartón de rollo de papel higiénico",
      "Papel de regalo sobrante, pintura acrílica o pegatinas para forrar",
      "Cinta adhesiva de colores o pegamento escolar"
    ],
    steps: [
      "Forra la caja de zapatos de manera divertida por fuera para darle una apariencia decorativa elegante.",
      "Ordena los rollos de papel higiénico de manera vertical dentro de la caja de zapatos de forma continua, ajustándolos uno al lado del otro.",
      "Si queda espacio sobrante, puedes rellenarlo con trozos de cartón para evitar que los rollos se muevan.",
      "Enrolla tus cables USB, cargadores viejos e hilos de manera ordenada, introduciendo cada cable de forma vertical dentro de uno de los tubos.",
      "Tapa la caja y etiqueta el frente. ¡Se acabó el desorden de cables enredados e inaccesibles en los cajones de casa!"
    ],
    tips: [
      "Puedes escribir con plumón en el borde superior de cada rollo el tipo de cable que contiene (ej. 'Micro USB', 'Cargador C')."
    ],
    funFact: "Los tubos de cartón son uno de los desechos más comunes en las casas urbanas. ¡Consolidarlos extiende considerablemente el valor del papel antes de reciclarlo!",
    imageUrl: "https://images.unsplash.com/photo-1616440347437-b1c73416efc2?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "p9",
    title: "Composta Doméstica Básica",
    description: "Diseña un minicompostador casero para convertir los restos orgánicos de tu cocina en humus rico de alta calidad nutritiva para tus plantas.",
    materialCategory: "organic",
    difficulty: "Medio",
    timeEstimated: "35 min",
    circularImpact: "Reduce el volumen total de tus basuras municipales entre un 40% y 50% y mitiga emisiones de gas metano en vertederos públicos.",
    materialsNeeded: [
      "1 Contenedor de plástico grande con tapa (cubeta vieja, balde o bidón de 10L)",
      "Taladro con broca fina o un clavo caliente para make muchos hoyos de ventilación",
      "Materia verde (restos crudos de verdura, fruta, posos de café, hojas de té, cáscara de huevo)",
      "Materia marrón seca (hojas secas del jardín, cartón de huevo cortado chiquito, periódico triturado)",
      "Un par de tazas de tierra común de jardín"
    ],
    steps: [
      "Perfora una lluvia de agujeros en la parte lateral y tapa del balde plástico para propiciar una oxigenación constante (clave para que no dé mal olor).",
      "Coloca en la base inferior una capa inicial de 5 cm de materia seca marrón (ramas pequeñas y hojarasca) para drenar el excedente líquido.",
      "Añade encima una capa de restos verdes de cocina (materia orgánica fresca).",
      "Espolvorea una capa delgada de tierra de jardín que contiene consorcios bacterianos benéficos dispuestos a procesar todo.",
      "Cubre todo con otra capa de materia marrón seca (esto es vital para evitar los mosquitos del hogar y malos olores).",
      "Cada semana, mezcla suavemente el interior con un bastón metálico para oxigenar. Mantén la humedad equivalente a una esponja escurrida. En 2 o 3 meses tendrás tierra negra fértil de exquisito aroma a bosque húmedo."
    ],
    tips: [
      "Evita añadir huesos, carnes, lácteos, grasas o restos de comida cocinada con sal o aceite en este compostador casero rápido.",
      "Pica los trozos lo más pequeños posibles para acelerar el proceso biológico de las bacterias amigables."
    ],
    funFact: "Un tercio del alimento producido globalmente se desperdicia. Rediseñar este desecho como compost devuelve los micronutrientes vitales al suelo, completando el ciclo de la vida.",
    imageUrl: "https://images.unsplash.com/photo-1592150621744-aca64f48394a?auto=format&fit=crop&w=600&q=80"
  }
];

export default function CircularProjects() {
  const [activeCategory, setActiveCategory] = useState<"all" | "plastic" | "glass" | "metal" | "paper" | "organic">("all");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>("p1");
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [gatheredMaterials, setGatheredMaterials] = useState<Record<string, boolean>>({});
  const [expandedTips, setExpandedTips] = useState<boolean>(false);
  const [motivationState, setMotivationState] = useState<boolean>(false);

  const filteredProjects = activeCategory === "all" 
    ? PROJECTS_DATA 
    : PROJECTS_DATA.filter(p => p.materialCategory === activeCategory);

  const selectedProject = PROJECTS_DATA.find(p => p.id === selectedProjectId) || PROJECTS_DATA[0];

  const handleToggleMaterial = (matName: string) => {
    setGatheredMaterials(prev => ({
      ...prev,
      [matName]: !prev[matName]
    }));
  };

  const handleToggleStep = (stepIndex: number) => {
    const key = `${selectedProject.id}-${stepIndex}`;
    setCompletedSteps(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const totalStepsCount = selectedProject.steps.length;
  const completedStepsCount = selectedProject.steps.filter((_, idx) => completedSteps[`${selectedProject.id}-${idx}`]).length;
  const isProjectCompleted = completedStepsCount === totalStepsCount;

  const pctProgress = Math.round((completedStepsCount / totalStepsCount) * 100) || 0;

  const categoriesConfig = [
    { key: "all", label: "Todos", icon: "✨", bgActive: "bg-emerald-555 border-emerald-500 text-white" },
    { key: "plastic", label: "Plásticos", icon: "🥤", bgActive: "bg-blue-600 border-blue-500 text-white" },
    { key: "glass", label: "Vidrio", icon: "🍾", bgActive: "bg-teal-600 border-teal-500 text-white" },
    { key: "metal", label: "Metales", icon: "🥫", bgActive: "bg-slate-600 border-slate-500 text-white" },
    { key: "paper", label: "Papel/Cartón", icon: "📦", bgActive: "bg-amber-600 border-amber-500 text-white" },
    { key: "organic", label: "Orgánicos", icon: "🍎", bgActive: "bg-emerald-600 border-emerald-500 text-white" }
  ];

  return (
    <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden space-y-6 animate-fade-in" id="upcycling_root">
      {/* Dynamic Background Circular Glow effect */}
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[80px] opacity-15 pointer-events-none transition-all duration-500 bg-emerald-500" />
      
      {/* Header section with interactive instructions */}
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-200">
          <Lightbulb className="w-5 h-5 text-emerald-400 animate-pulse" />
        </div>
        <div>
          <h3 className="text-base font-bold font-display text-white">Proyectos de Suprarreciclaje Creativo</h3>
          <p className="text-xs text-slate-400 font-sans mt-0.5 leading-relaxed">
            Explora ideas interactivas de <strong>Economía Circular</strong> para dar una segunda vida de utilidad a tus envases domésticos comunes. ¡Diseña, crea e incrementa tu conciencia!
          </p>
        </div>
      </div>

      {/* Category navigation pill selector */}
      <div className="space-y-2">
        <label className="text-[10px] font-mono tracking-wider uppercase font-semibold text-slate-400 select-none block">
          Filtrar por Material de Envase
        </label>
        <div className="flex flex-wrap gap-1.5 p-1 bg-slate-950/40 rounded-2xl border border-white/5">
          {categoriesConfig.map((cat) => {
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => {
                  setActiveCategory(cat.key as any);
                  // Auto-select first matching project of selected category
                  const matches = cat.key === "all" 
                    ? PROJECTS_DATA 
                    : PROJECTS_DATA.filter(p => p.materialCategory === cat.key);
                  if (matches.length > 0) {
                    setSelectedProjectId(matches[0].id);
                  }
                }}
                className={`flex-1 min-w-[90px] py-2 px-3 rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  isActive 
                    ? cat.bgActive + " shadow-md"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                <span>{cat.icon}</span>
                <span className="text-[11px] font-bold">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid: Left Column (Filtered list of projects) & Right Column (Detail of selected project) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* Left lists cards list (col-span-5) */}
        <div className="md:col-span-5 space-y-2.5 max-h-[460px] overflow-y-auto custom-scrollbar pr-1">
          <label className="text-[10px] font-mono tracking-wider uppercase font-semibold text-slate-400 select-none block sticky top-0 bg-[#0c1322] py-1">
            Proyectos Disponibles ({filteredProjects.length})
          </label>
          {filteredProjects.map((proj) => {
            const isSelected = selectedProjectId === proj.id;
            return (
              <button
                key={proj.id}
                type="button"
                onClick={() => {
                  setSelectedProjectId(proj.id);
                  // Reset temporary state of tips expansion
                  setExpandedTips(false);
                }}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex gap-3.5 items-start relative group ${
                  isSelected
                    ? "bg-slate-900 border-emerald-500/50 shadow-md shadow-emerald-950/20"
                    : "bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10"
                }`}
              >
                {/* Project Image Thumbnail */}
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/10 relative bg-slate-900">
                  <img
                    src={proj.imageUrl}
                    alt={proj.title}
                    className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  {/* Visual state indicators */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 transition truncate">
                      {proj.title}
                    </span>
                    
                    {/* Category material indicator bubble */}
                    <span className="text-[8.5px] px-1.5 py-0.5 rounded-md font-mono bg-white/5 font-semibold text-slate-400 shrink-0">
                      {proj.materialCategory === "plastic" && "🥤 Plast"}
                      {proj.materialCategory === "glass" && "🍾 Vidrio"}
                      {proj.materialCategory === "metal" && "🥫 Metal"}
                      {proj.materialCategory === "paper" && "📦 Papel"}
                      {proj.materialCategory === "organic" && "🍎 Orgán"}
                    </span>
                  </div>

                  <p className="text-[10.5px] text-slate-400 leading-snug font-sans mt-1 line-clamp-2">
                    {proj.description}
                  </p>

                  {/* Badges footer */}
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-450">
                    <span className="flex items-center gap-1 font-semibold text-slate-350">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {proj.timeEstimated}
                    </span>
                    <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold ${
                      proj.difficulty === "Fácil" 
                        ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                        : proj.difficulty === "Medio"
                        ? "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                        : "bg-red-500/10 text-red-300 border border-red-500/20"
                    }`}>
                      {proj.difficulty}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right detail panel card detail columns (col-span-12) */}
        <div className="md:col-span-7 bg-slate-950/50 rounded-2.5xl border border-white/5 overflow-hidden flex flex-col min-h-[460px]">
          
          {/* Active project header image banner */}
          <div className="relative h-44 w-full overflow-hidden border-b border-white/5 bg-slate-900">
            <img
              src={selectedProject.imageUrl}
              alt={selectedProject.title}
              className="w-full h-full object-cover grayscale-[15%] hover:grayscale-0 transition-all duration-550"
              referrerPolicy="no-referrer"
            />
            {/* Elegant overlay gradient to dim bottom text */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent" />
            
            {/* Floating category & difficulty badge */}
            <div className="absolute bottom-4 left-4 flex gap-2">
              <span className="text-[9px] px-2.5 py-1 rounded-full font-mono bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 backdrop-blur-md uppercase tracking-wider">
                {selectedProject.materialCategory === "plastic" && "🥤 Plásticos"}
                {selectedProject.materialCategory === "glass" && "🍾 Vidrio"}
                {selectedProject.materialCategory === "metal" && "🥫 Metales"}
                {selectedProject.materialCategory === "paper" && "📦 Papel/Cartón"}
                {selectedProject.materialCategory === "organic" && "🍎 Orgánicos"}
              </span>
              <span className={`text-[9px] px-2.5 py-1 rounded-full font-mono font-bold border backdrop-blur-md uppercase tracking-wider ${
                selectedProject.difficulty === "Fácil"
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                  : selectedProject.difficulty === "Medio"
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                  : "bg-red-500/20 text-red-300 border-red-500/30"
              }`}>
                {selectedProject.difficulty}
              </span>
            </div>
          </div>

          {/* Active project header text detail info */}
          <div className="p-5 border-b border-white/5 bg-slate-900/40">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="space-y-1">
                <h3 className="text-base font-black text-white tracking-wide font-display">
                  {selectedProject.title}
                </h3>
                <p className="text-[11.5px] text-slate-300 leading-relaxed font-sans">
                  {selectedProject.description}
                </p>
              </div>
            </div>

            {/* Micro details pill rows */}
            <div className="flex flex-wrap gap-2.5 mt-4 items-center">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/5 rounded-xl text-[10px] text-slate-300 font-sans">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tiempo Estimado: <strong className="text-white font-mono">{selectedProject.timeEstimated}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/5 rounded-xl text-[10px] text-slate-300 font-sans">
                <Award className="w-3.5 h-3.5 text-blue-400" />
                <span>Impacto Circular: <strong className="text-emerald-300 font-mono">Muy Alto</strong></span>
              </div>
            </div>
          </div>

          {/* Body Content scrolls */}
          <div className="p-5 flex-1 overflow-y-auto custom-scrollbar space-y-5 max-h-[340px]">
            
            {/* Circular Economy Context Panel */}
            <div id="project_circular_context" className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
              <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> ¿Cómo ayuda esto a la Economía Circular?
              </h4>
              <p className="text-[11px] leading-relaxed text-slate-200 font-sans mt-1.5">
                {selectedProject.circularImpact}
              </p>
            </div>

            {/* Checklist 1: Materials and Ingredients */}
            <div className="space-y-2.5">
              <h4 className="text-[10.5px] font-mono tracking-wider uppercase font-semibold text-slate-350 flex items-center gap-1.5">
                🛠️ Materiales Necesarios (Marca los que tengas)
              </h4>
              <p className="text-[10px] text-slate-450 font-sans mt-0.5">
                Consigue estos materiales antes de empezar el suprarreciclaje para optimizar la faena:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedProject.materialsNeeded.map((mat, idx) => {
                  const isChecked = !!gatheredMaterials[mat];
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleToggleMaterial(mat)}
                      className={`text-left p-2.5 rounded-xl border text-[11px] leading-tight font-sans transition-all flex items-start gap-2.5 cursor-pointer ${
                        isChecked 
                          ? "bg- emerald-500/10 border-emerald-500/30 text-emerald-250 font-medium"
                          : "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all text-[8px] ${
                        isChecked 
                          ? "bg-emerald-500 border-emerald-400 text-white" 
                          : "border-slate-500 bg-slate-950/40"
                      }`}>
                        {isChecked && "✓"}
                      </span>
                      <span>{mat}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Checklist 2: Steps to follow */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-[10.5px] font-mono tracking-wider uppercase font-semibold text-slate-350 flex items-center gap-1.5">
                  📖 Instrucciones de Fabricación Paso a Paso
                </h4>
                <div className="text-[10.5px] font-mono font-bold text-emerald-400">
                  {completedStepsCount} de {totalStepsCount} completados
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-900 border border-white/5 rounded-full overflow-hidden h-2.5 relative">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-300"
                  style={{ width: `${pctProgress}%` }}
                />
              </div>

              <div className="space-y-2">
                {selectedProject.steps.map((step, idx) => {
                  const isStepDone = !!completedSteps[`${selectedProject.id}-${idx}`];
                  return (
                    <div
                      key={idx}
                      onClick={() => handleToggleStep(idx)}
                      className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-start gap-4 select-none leading-relaxed text-[11.5px] ${
                        isStepDone 
                          ? "bg-slate-900/60 border-emerald-500/30 text-slate-400 line-through decoration-slate-600/60 font-sans"
                          : "bg-white/5 border-white/5 text-slate-200 hover:bg-white/8 font-sans"
                      }`}
                    >
                      {/* Step Number Sphere indicator */}
                      <span className={`w-5.5 h-5.5 rounded-full text-[10px] font-extrabold flex items-center justify-center shrink-0 transition-all ${
                        isStepDone 
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                          : "bg-slate-800 text-slate-400 border border-slate-700 font-mono"
                      }`}>
                        {isStepDone ? "✓" : idx + 1}
                      </span>
                      
                      <div className="flex-1">
                        {step}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Special tips dropdown panel */}
            {selectedProject.tips && selectedProject.tips.length > 0 && (
              <div className="border border-white/5 rounded-2xl overflow-hidden bg-white/[0.02]">
                <button
                  type="button"
                  onClick={() => setExpandedTips(!expandedTips)}
                  className="w-full p-4 flex items-center justify-between text-left cursor-pointer hover:bg-white/5"
                >
                  <span className="text-[10.5px] font-mono font-black uppercase text-amber-300 flex items-center gap-1.5">
                    💡 Consejos del Especialista Ambientalito
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-all ${expandedTips ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {expandedTips && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-4 pb-4 overflow-hidden border-t border-white/5 text-[11px] leading-relaxed text-slate-300 font-sans space-y-2 pt-2.5"
                    >
                      {selectedProject.tips.map((tip, idx) => (
                        <p key={idx} className="flex items-start gap-1.5">
                          <span className="text-amber-400 shrink-0 select-none">•</span>
                          <span>{tip}</span>
                        </p>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Fun Fact Card section */}
            <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 text-[11px] font-sans text-blue-200 leading-relaxed">
              <span className="font-bold text-blue-300 leading-none flex items-center gap-1.5 mb-1 text-[10px] font-mono uppercase tracking-wider">
                🌟 ¿Sabías Qué?
              </span>
              {selectedProject.funFact}
            </div>

          </div>

          {/* Footer success celebration banner */}
          <div className="p-4 bg-slate-900 border-t border-white/5 flex items-center justify-between gap-4">
            <div className="min-w-0">
              {isProjectCompleted ? (
                <div className="flex items-center gap-2 text-[11.5px] font-bold text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>¡Proyecto completado! Excelente aporte circular. 💚</span>
                </div>
              ) : (
                <div className="text-[10px] text-slate-400 leading-normal font-sans">
                  Completa los pasos anteriores marcando las casillas conforme los ejecutas.
                </div>
              )}
            </div>

            {isProjectCompleted && (
              <button
                type="button"
                onClick={() => {
                  setMotivationState(true);
                  setTimeout(() => setMotivationState(false), 3000);
                }}
                className="text-[10px] font-bold bg-emerald-550 hover:bg-emerald-600 border border-emerald-450 hover:border-emerald-500 text-white rounded-lg px-3 py-1.5 flex items-center gap-1.5 transition-all select-none cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-white active:scale-125" />
                {motivationState ? "¡Viva la Pachamama! 🌱" : "Celebrar Logro"}
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
