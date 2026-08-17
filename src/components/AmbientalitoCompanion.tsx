import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Sparkles, Send, Loader2, Trash2, HelpCircle, Mic, MicOff } from "lucide-react";
import { SapoLogo } from "./SapoLogo";

interface ChatMessage {
  id: string;
  sender: "user" | "ambientalito";
  text: string;
  timestamp: Date;
}

const SUGGESTION_CHIPS = [
  { text: "🥤 ¿Cómo reciclar plástico PET?", label: "Plástico PET" },
  { text: "🥬 Compostaje de orgánicos", label: "Compostaje" },
  { text: "🌡️ ¿Qué es el CO2 equivalente?", label: "CO2eq" },
  { text: "🍾 Ciclo infinito del vidrio", label: "Vidrio" }
];

export const AmbientalitoCompanion: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "ambientalito",
      text: "¡Hola, colega ecológico! 🐸🍀 Soy Ambientalito, tu Ingeniero Ambiental Senior. Pregúntame lo que quieras sobre reciclaje moderno, compostaje, huella de carbono o cómo tratar algún residuo específico. ¡Juntos mantendremos nuestro planetita limpio! 🌍♻️",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isJumping, setIsJumping] = useState<boolean>(false);
  const [showNotification, setShowNotification] = useState<boolean>(true);
  const [notificationText, setNotificationText] = useState<string>("¡Hola! Haz click en mí para charlar con un Ingeniero Ambiental Senior. 🐸💬");
  const [userClosedNotification, setUserClosedNotification] = useState<boolean>(false);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  const [isListening, setIsListening] = useState<boolean>(false);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "es-EC"; // Ecuador/Spanish
      
      rec.onstart = () => {
        setIsListening(true);
        setRecognitionError(null);
      };

      rec.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const text = finalTranscript || interimTranscript;
        if (text) {
          setInputText(text);
        }
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        if (event.error === "not-allowed") {
          setRecognitionError("Acceso al micrófono denegado. Habilítalo en tu navegador para hablar.");
        } else if (event.error === "no-speech") {
          // ignore silent timeouts
        } else {
          setRecognitionError(`Error de voz: ${event.error}`);
        }
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setRecognitionError("Tu navegador no soporta dictado por voz. Prueba usando Google Chrome.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setInputText("");
      setRecognitionError(null);
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.error("Failed to start SpeechRecognition", e);
        setRecognitionError("No se pudo activar el micrófono.");
      }
    }
  };

  // Auto scroll to bottom of chat when messages change
  useEffect(() => {
    if (isChatOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isChatOpen]);

  // Periodic reminder notifications every 180 seconds (3 minutes) to avoid spamming the screen
  useEffect(() => {
    const reminders = [
      "¿Tienes dudas sobre cómo reciclar un empaque? ¡Pregúntame! 📦🐸",
      "¡El aluminio es 95% más eficiente si lo reciclamos! 🥫✨",
      "¿Sabías que reciclar cartón salva bosques de coníferas? 🌲🍀",
      "¡Dame un toque para resolver tu dilema ecológico! 🐸💚"
    ];

    const timer = setInterval(() => {
      if (isOpen && !isChatOpen && !userClosedNotification) {
        const randomMsg = reminders[Math.floor(Math.random() * reminders.length)];
        setNotificationText(randomMsg);
        setShowNotification(true);
        triggerJump();
      }
    }, 180000);

    return () => clearInterval(timer);
  }, [isOpen, isChatOpen, userClosedNotification]);

  const triggerJump = () => {
    setIsJumping(true);
    setTimeout(() => {
      setIsJumping(false);
    }, 600);
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isTyping) return;

    if (isListening) {
      recognitionRef.current?.stop();
    }

    // Save user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);
    triggerJump();

    const getLocalChatbotReply = (message: string): string => {
      const lowerMsg = message.toLowerCase();
      
      if (lowerMsg.includes("hola") || lowerMsg.includes("buen")) {
        return "¡Hola, guardián de la Tierra! 🐸🍀 Desde mi oficina de Ingeniería Ambiental local, te doy una cálida bienvenida. ¿Qué inquietudes ecológicas o sobre reciclaje tienes hoy? ¡Juntos cuidaremos la Pachamama! ♻️🌍";
      }
      
      if (lowerMsg.includes("plástico") || lowerMsg.includes("pet") || lowerMsg.includes("botella")) {
        return "¡Tengo grandes consejos sobre plásticos! 🥤🐸 Como Ingeniero Ambiental, te comento que el plástico PET se compra a ~$0.38 por kilo en Ecuador. Recuerda: límpialo, resecálalo, quítale la etiqueta y aplástalo para que rinda más en los puntos de acopio comunitarios. ¡Cuidemos nuestros océanos! 🌊♻️";
      }
      
      if (lowerMsg.includes("papel") || lowerMsg.includes("cartón") || lowerMsg.includes("caja")) {
        return "¡Ah, el reciclado de celulosa! 📦🌱 En Ecuador el cartón rinde a unos $0.12 por kilo de ganancia. Al reciclarlo preservamos miles de hectáreas forestales y reducimos el consumo de agua dulce de manera espectacular. ¡Asegúrate siempre de que las cajas estén bien secas! 🌳💚";
      }
      
      if (lowerMsg.includes("metal") || lowerMsg.includes("lata") || lowerMsg.includes("aluminio")) {
        return "¡Increíble consulta técnica! 🥫⚡ El aluminio es el metal mimado del reciclaje en Ecuador, pagándose hasta en $1.10 por kilo. Al reciclarlo ahorramos el 95% de la energía de minería. Aplástalas con cuidado para facilitar su acopio en los centros autorizados. 🐸🏅";
      }
      
      if (lowerMsg.includes("vidrio") || lowerMsg.includes("cristal")) {
        return "¡El vidrio tiene un ciclo de vida infinito! 🍾✨ Se paga a unos $0.03 por kilo en centros especializados ecuatorianos, pero su mayor beneficio es reducir la fundición mineral de alta temperatura en las vidrieras. Sácale las chapitas metálicas y deposítala limpia y entera. 💎♻️";
      }
      
      if (lowerMsg.includes("compost") || lowerMsg.includes("orgánico") || lowerMsg.includes("fruta") || lowerMsg.includes("comida")) {
        return "¡Abono, la delicia del jardín! 🌱🐸 Aunque no se lo comercialice por kilo ($0.00), compostar los restos orgánicos en casa evita que produzcan gas metano en los rellenos sanitarios de El Inga o Las Iguanas. ¡Es la forma más noble de fertilizar nuestras macetas de forma natural! 🍏🌻";
      }
      
      if (lowerMsg.includes("precio") || lowerMsg.includes("ganar") || lowerMsg.includes("acopio") || lowerMsg.includes("reembolso") || lowerMsg.includes("dinero") || lowerMsg.includes("kilo") || lowerMsg.includes("dólar") || lowerMsg.includes("ecuador")) {
        return "¡Claro que sí! 💵🐸 Los precios referenciales por kilo actuales en el mercado informal y formal de reciclaje en Ecuador son:\n\n• Aluminio/Metales: ~$1.10 / kg 🥫\n• Plástico PET/Soplado: ~$0.38 / kg 🥤\n• Cartón y Papel: ~$0.12 / kg 📦\n• Vidrio: ~$0.03 / kg 🍾\n\n¡Llevar tus acumulados te dará un buen estímulo económico extra de forma 100% circular!";
      }

      const fallbacks = [
        "¡Esa es una pregunta ecológica maravillosa! 🐸🌱 Como ingenieros ambientales ecuatorianos, buscamos cerrar el ciclo de vida de cada residuo. ¿Tienes alguna pregunta específica sobre plásticos, cartón o los valores de reembolso en nuestro país?",
        "¡Súper consulta de sostenibilidad! 🐸💚 Recuerda que el mejor residuo es el que no se genera (Reducir), pero para el resto, ¡hagamos reciclaje limpio y seco para sanar nuestra Pachamama! 😊♻️",
        "¡Me encanta tu energía verde! 🐸🍀 Recuerda que puedes alimentar a Ambientalito depositando tus simulaciones cotidianas en el estanque de juegos para elevar tus estadísticas corporativas. ¡De gotita en gotita formamos un diluvio del bien! 🌊🌱"
      ];
      return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    };

    const runLocalChatSimulation = () => {
      const textResponse = getLocalChatbotReply(textToSend);
      const responseMsg: ChatMessage = {
        id: `ambientalito-${Date.now()}`,
        sender: "ambientalito",
        text: textResponse + " \n\n*(Procesado localmente con éxito en Modo Offline/APK)* 🐸✨",
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, responseMsg]);
    };

    // If running inside local Android files protocol (file://), bypass raw API call entirely
    if (window.location.protocol === "file:") {
      console.log("Local protocol file: detected in companion. Activating local chatbot simulator.");
      setTimeout(() => {
        runLocalChatSimulation();
        setIsTyping(false);
      }, 800);
      return;
    }

    try {
      // Map frontend messages to backend history array format [{role: "user" | "model", text: ""}]
      // Filter out welcome message to save tokens & focus on relevant history
      const formattedHistory = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({
          role: m.sender === "user" ? "user" : "model",
          text: m.text
        }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: formattedHistory
        })
      });

      if (!response.ok) {
        console.warn(`Server responded with ${response.status}. Initiating offline chatbot fallback.`);
        runLocalChatSimulation();
        setIsTyping(false);
        return;
      }

      const data = await response.json();
      
      const responseMsg: ChatMessage = {
        id: `ambientalito-${Date.now()}`,
        sender: "ambientalito",
        text: data.text || "¡Uy! Parece que algo se me cruzó por el lago. ¿Puedes repetirme la inquietud? 🐸💦",
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, responseMsg]);
    } catch (e) {
      console.warn("Chatbot backend post failed. Performing robust keyword matching client-side.", e);
      try {
        runLocalChatSimulation();
      } catch (err) {
        const errorMsg: ChatMessage = {
          id: `error-${Date.now()}`,
          sender: "ambientalito",
          text: "¡Oh, disculpa! 🐸 Acabo de tener un pequeño corte de señal en la laguna. Sin embargo, no te detengas: recuerda lavar, seca y clasificar tus envases. ¡El planetita es nuestro mayor tesoro! 🍀💚",
          timestamp: new Date()
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome",
        sender: "ambientalito",
        text: "¡Chat reiniciado! 🐸✨ Todo listo para tus nuevas consultas de Ingeniería Ambiental. ¿De qué hablaremos hoy, guardián planetario?",
        timestamp: new Date()
      }
    ]);
  };

  const handleRestoreCompanion = () => {
    setIsOpen(true);
    setShowNotification(true);
    setNotificationText("¡De vuelta al servicio ecológico! 🐸🍀");
  };

  if (!isOpen) {
    return (
      <button
        onClick={handleRestoreCompanion}
        title="Restaurar a Ambientalito 🐸"
        className="fixed bottom-4 right-4 z-50 bg-slate-900/90 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 w-12 h-12 rounded-full flex items-center justify-center shadow-[4px_4px_0px_rgba(16,185,129,0.3)] hover:scale-110 active:scale-95 transition-all duration-300 group cursor-pointer"
      >
        <span className="text-xl group-hover:animate-bounce">🐸</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end max-w-[340px] sm:max-w-[400px]">
      
      {/* 1. CHAT WINDOW PANEL */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 350, damping: 26 }}
            className="w-[290px] sm:w-[350px] md:w-[380px] h-[480px] bg-slate-950/95 backdrop-blur-xl border-2 border-emerald-500/30 rounded-[28px] overflow-hidden flex flex-col shadow-[0_12px_40px_rgba(0,0,0,0.6)] border-b-emerald-400 mb-4"
          >
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 px-4 py-3.5 border-b border-white/5 flex items-center justify-between select-none shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-1 bg-emerald-550/10 rounded-xl border border-emerald-500/30">
                  <SapoLogo className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xs font-black font-display text-white tracking-wide uppercase leading-tight">
                    Ambientalito AI
                  </h3>
                  <span className="text-[9px] font-mono font-medium text-emerald-400 tracking-wider">
                    Ingeniero Ambiental Senior 🐸🍀
                  </span>
                </div>
              </div>

              {/* Header Action Buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={clearChat}
                  title="Vaciar Chat"
                  className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-rose-400 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsChatOpen(false)}
                  title="Minimizar Chat"
                  className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Suggestions Bar */}
            {messages.length <= 1 && (
              <div className="px-3 py-2 bg-slate-900/40 border-b border-white/5 flex flex-wrap gap-1.5 shrink-0">
                {SUGGESTION_CHIPS.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(chip.text)}
                    className="text-[10px] font-medium bg-slate-900 hover:bg-emerald-950/40 border border-white/5 hover:border-emerald-500/30 text-slate-300 hover:text-emerald-350 px-2 py-1 rounded-lg transition-all duration-250 cursor-pointer"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            )}

            {/* Chat Message List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar bg-slate-950/20">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"} items-end gap-2`}
                >
                  {m.sender === "ambientalito" && (
                    <div className="p-0.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20 shrink-0">
                      <SapoLogo className="w-5 h-5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] rounded-2xl p-3 text-xs leading-relaxed ${
                      m.sender === "user"
                        ? "bg-emerald-600 text-white rounded-br-none"
                        : "bg-slate-900 text-slate-100 rounded-bl-none border border-white/5"
                    }`}
                  >
                    {m.text}
                    <div className="text-[9px] text-slate-400 text-right mt-1 opacity-70">
                      {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start items-center gap-2">
                  <div className="p-0.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20 shrink-0 animate-bounce">
                    <SapoLogo className="w-5 h-5" />
                  </div>
                  <div className="bg-slate-900 border border-white/5 rounded-2xl p-3 text-slate-400 flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-450" />
                    <span className="text-[10px] uppercase font-mono font-bold tracking-wider">Pensando...</span>
                  </div>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Mic recognition error message banner */}
            {recognitionError && (
              <div className="px-3 py-1.5 bg-rose-500/10 border-t border-rose-500/20 text-[10px] text-rose-300 italic text-center shrink-0">
                ⚠️ {recognitionError}
              </div>
            )}

            {/* Chat Input form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputText);
              }}
              className="p-3 bg-slate-900 border-t border-white/5 flex gap-1.5 items-center shrink-0 select-none"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isListening ? "Escuchando tu voz..." : "Pregúntale a Ambientalito..."}
                className={`flex-1 bg-slate-950 border rounded-full py-2 px-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-all ${
                  isListening ? "border-rose-500/50 bg-rose-950/10 ring-1 ring-rose-500/30" : "border-white/10"
                }`}
              />

              {/* Speech to Text Dictation Button */}
              <button
                type="button"
                onClick={toggleListening}
                title={isListening ? "Detener dictado por voz" : "Dictar con voz (Español)"}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                  isListening
                    ? "bg-rose-550 text-white animate-pulse shadow shadow-rose-550/20 hover:bg-rose-600"
                    : "bg-slate-950 border border-white/10 hover:border-emerald-500/30 text-slate-300 hover:text-emerald-450 hover:bg-slate-900"
                }`}
              >
                {isListening ? (
                  <Mic className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
                ) : (
                  <Mic className="w-3.5 h-3.5" />
                )}
              </button>

              <button
                type="submit"
                disabled={!inputText.trim() || isTyping}
                title="Enviar mensaje"
                className="w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white flex items-center justify-center transition-colors shadow shadow-emerald-500/10 cursor-pointer shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. DYNAMIC NOTIFICATION BALLOON */}
      <AnimatePresence>
        {showNotification && !isChatOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="mb-3 bg-slate-950/95 backdrop-blur-xl border-2 border-emerald-500/30 text-white rounded-2xl p-4 shadow-[4px_4px_20px_rgba(0,0,0,0.5)] relative pointer-events-auto border-b-emerald-400 select-none pr-7 max-w-[280px]"
          >
            {/* Speech bubble pointer */}
            <div className="absolute bottom-[-10px] right-6 w-4 h-4 bg-slate-950 border-r-2 border-b-2 border-emerald-500/30 rotate-45" />

            {/* Close hint button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowNotification(false);
                setUserClosedNotification(true);
              }}
              className="absolute top-2 right-2 text-slate-500 hover:text-white rounded-full p-0.5 hover:bg-white/10 transition-colors cursor-pointer"
              title="Cerrar"
            >
              <X className="w-3 h-3" />
            </button>

            {/* Notification Content */}
            <div onClick={() => { setIsChatOpen(true); setShowNotification(false); }} className="cursor-pointer space-y-1">
              <span className="text-[8px] uppercase font-bold text-emerald-400 font-mono tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 animate-spin duration-3000 text-emerald-450" />
                Ing. Ambiental Senior
              </span>
              <p className="text-xs text-slate-100 font-sans leading-relaxed">
                "{notificationText}"
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. FLOATING MASCOT BUTTON COMPONENT */}
      <motion.div
        animate={isJumping ? {
          y: [-15, -40, 0],
          scaleY: [0.85, 1.15, 1],
          scaleX: [1.1, 0.9, 1]
        } : {
          y: [0, -6, 0],
          rotate: [-1.5, 1.5, -1.5]
        }}
        transition={isJumping ? {
          duration: 0.55,
          ease: "easeOut"
        } : {
          y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        }}
        className="pointer-events-auto flex items-center gap-2 group cursor-pointer select-none"
        onClick={() => {
          setIsChatOpen((prev) => !prev);
          setShowNotification(false);
        }}
      >
        <span className="hidden sm:inline-block bg-emerald-500/20 text-emerald-300 text-[9px] uppercase font-bold font-mono py-1 px-2.5 rounded-full border border-emerald-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow shadow-emerald-500/5">
          {isChatOpen ? "Minimizar 🌸" : "Preguntar Ing. 🐸🍀"}
        </span>

        {/* Mascot Avatar */}
        <div className="relative">
          {/* Inner ring glowing aura */}
          <div className="absolute inset-0 bg-emerald-500/25 rounded-full filter blur-md animate-pulse opacity-75" />

          {/* Sapo Logo Container */}
          <div className="relative bg-slate-900 p-2 border-2 border-slate-800 rounded-full shadow-[0px_8px_20px_rgba(0,0,0,0.5)] transform hover:scale-115 active:scale-90 transition-transform duration-200">
            <SapoLogo className="w-14 h-14" />
            
            {/* Small floating bubble count or notification badge */}
            <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full animate-ping" />
            <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />

            {/* Direct Close Button to minimize completely */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              title="Ocultar"
              className="absolute -top-1 -right-1 bg-rose-500 text-white p-0.5 rounded-full border border-rose-300 hover:bg-rose-600 transition shadow hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center w-4 h-4 opacity-0 group-hover:opacity-100"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      </motion.div>

    </div>
  );
};
