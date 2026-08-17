import { getGenAI, generateContentWithFailover } from "./_lib/gemini";

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { message, history } = req.body || {};

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

      return res.status(200).json({ text: reply, isDemoMode: true });
    }

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

    return res.status(200).json({ text: replyText, isDemoMode: false });

  } catch
