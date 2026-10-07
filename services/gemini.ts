
import { GoogleGenAI, Type, Modality } from "@google/genai";

// Siempre creamos una instancia nueva para asegurar que use la API_KEY actual del proceso
export const getGeminiClient = () => {
  // En Vite, las variables deben ser accedidas de forma estática para que se reemplacen en el build
  let apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY;
  
  // Fallback para otros entornos (como el editor de AI Studio)
  if (!apiKey && typeof process !== 'undefined') {
    apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  }
  
  if (!apiKey) {
    console.error("❌ ERROR: No se encontró la VITE_GEMINI_API_KEY.");
  }
  
  return new GoogleGenAI({ apiKey: apiKey || '' });
};

export const chatWithPro = async (message: string, history: any[] = []) => {
  const ai = getGeminiClient();
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    history: history,
    config: {
      systemInstruction: "Eres Gumi, una criatura mágica y sabia. Habla con muchos emojis, sé muy cariñoso y breve con los niños. Tu amigo Pipo el robot también está aquí.",
    },
  });
  return await chat.sendMessage({ message });
};

export const textToSpeech = async (text: string, rate: 'slow' | 'normal' | 'fast' = 'slow'): Promise<string | undefined> => {
  const ai = getGeminiClient();
  const paceInstruction =
    rate === 'slow'  ? 'Habla lentamente, separando con claridad cada palabra y dejando pausas breves entre frases para que el niño pueda seguirte.' :
    rate === 'fast'  ? 'Habla más rápido que el ritmo normal, manteniendo una pronunciación clara y natural sin atropellar las palabras.' :
                       'Habla a un ritmo normal, cálido y tranquilo, con pausas naturales.';
  const styledText = `Habla exactamente en español y conserva la misma voz configurada. Suena cálido, alegre, amigable y natural, como un docente paciente que enseña a niños pequeños. ${paceInstruction} Evita sonar robótico, monótono o demasiado formal. Usa cambios naturales de entonación y energía para mantener la atención sin gritar ni exagerar: en las preguntas utiliza una entonación claramente interrogativa; al felicitar, transmite alegría y motivación; al explicar, usa un tono tranquilo, paciente y didáctico. Pronuncia correctamente cada palabra en español. La prioridad es que el niño comprenda fácilmente cada palabra y se sienta acompañado durante el aprendizaje. No agregues explicaciones antes o después del texto. Di exactamente esto: ${text}`;
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: styledText }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Puck' },
        },
      },
    },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
};

export const generateImagePro = async (prompt: string, options: { aspectRatio: string; imageSize: string }) => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: {
        aspectRatio: options.aspectRatio as any,
      },
    },
  });
  const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
  return part?.inlineData ? `data:image/png;base64,${part.inlineData.data}` : null;
};

export const editImageFlash = async (prompt: string, base64Image: string) => {
  const ai = getGeminiClient();
  const [header, data] = base64Image.split(',');
  const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data, mimeType } },
        { text: prompt },
      ],
    },
  });
  const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
  return part?.inlineData ? `data:image/png;base64,${part.inlineData.data}` : null;
};
