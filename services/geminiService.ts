import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

let client: GoogleGenAI | null = null;
let chatSession: Chat | null = null;

export const initializeGemini = (apiKey: string, systemInstruction: string) => {
  client = new GoogleGenAI({ apiKey });
  
  chatSession = client.chats.create({
    model: 'gemini-3-flash-preview', 
    config: {
      systemInstruction: systemInstruction,
      temperature: 0.9, 
      topK: 40,
      topP: 0.95,
    },
  });
};

export const sendMessageStream = async function* (message: string, attachment?: { mimeType: string, data: string }) {
  if (!chatSession) {
    throw new Error("Sesi belum diinisialisasi. Harap masukkan API Key.");
  }

  try {
    let responseStream;

    // Jika ada attachment gambar
    if (attachment) {
      // Untuk gambar + text, kita harus kirim sebagai Part[]
      const parts = [
        { text: message },
        { inlineData: { mimeType: attachment.mimeType, data: attachment.data } }
      ];
      responseStream = await chatSession.sendMessageStream({ 
         parts: parts
      });
    } else {
      // Text only
      responseStream = await chatSession.sendMessageStream({ message });
    }
    
    for await (const chunk of responseStream) {
      const c = chunk as GenerateContentResponse;
      if (c.text) {
        yield c.text;
      }
    }
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};

export const resetSession = (apiKey: string, systemInstruction: string) => {
  initializeGemini(apiKey, systemInstruction);
};