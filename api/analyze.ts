import { GoogleGenerativeAI } from '@google/generative-ai';

// Inicializar SDK de Gemini con la API Key guardada en las Variables Ambientales de Vercel
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export default async function handler(req: any, res: any) {
  // Manejo de cabeceras CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { image, mimeType } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'No se proporcionó la imagen en base64' });
    }

    // Limpiar el prefijo data:image/...;base64, si viene incluido
    const base64Data = image.includes(',') ? image.split(',')[1] : image;
    const finalMimeType = mimeType || 'image/jpeg';

    // Usar el modelo multimodal de Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Analiza la imagen adjunta e identifica los residuos sólidos presentes. 
    Responde estrictamente en formato JSON con la siguiente estructura:
    {
      "detections": [
        {
          "label": "Nombre del residuo",
          "category": "Organico | Reciclable | No Reciclable | Peligroso",
          "confidence": 0.95,
          "box_2d": [ymin, xmin, ymax, xmax]
        }
      ],
      "recommendation": "Breve recomendación técnica de manejo ambiental"
    }`;

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: finalMimeType,
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const responseText = await result.response.text();

    // Limpiar bloques de código markdown si Gemini los devuelve (```json ... ```)
    const cleanedText = responseText.replace(/```json|```/g, '').trim();
    const data = JSON.parse(cleanedText);

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error procesando con Gemini:', error);
    return res.status(500).json({ 
      error: 'Error al analizar la imagen con la IA', 
      details: error.message 
    });
  }
}
