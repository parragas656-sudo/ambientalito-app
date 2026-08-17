export default async function handler(req: any, res: any) {
  // Configuración de cabeceras CORS
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
    const { image, mimeType } = req.body || {};

    if (!image) {
      return res.status(400).json({ error: 'No se proporcionó la imagen en base64' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Falta configurar GEMINI_API_KEY en Vercel' });
    }

    const base64Data = image.includes(',') ? image.split(',')[1] : image;
    const finalMimeType = mimeType || 'image/jpeg';

    const promptText = `Analiza la imagen adjunta e identifica los residuos sólidos presentes.
Responde estrictamente en formato JSON válido con la siguiente estructura:
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

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: promptText },
              {
                inline_data: {
                  mime_type: finalMimeType,
                  data: base64Data,
                },
              },
            ],
          },
        ],
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: result.error?.message || 'Error en Gemini API' });
    }

    const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const cleanedText = rawText.replace(/```json|```/g, '').trim();
    const parsedData = JSON.parse(cleanedText);

    return res.status(200).json(parsedData);
  } catch (error: any) {
    return res.status(500).json({ error: 'Error procesando la petición', details: error.message });
  }
}
