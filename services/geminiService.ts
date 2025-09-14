
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

let chat: Chat;

export const startChat = (): void => {
    chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: "You are Jarvas, a highly intelligent and versatile AI assistant. Your personality is helpful, slightly witty, and always professional. You can process information, perform searches, translate languages, and assist with a wide range of tasks. You support both English and Urdu.",
        },
    });
};

export const sendMessageToAI = async (message: string): Promise<AsyncGenerator<GenerateContentResponse>> => {
    if (!chat) {
        startChat();
    }
    return chat.sendMessageStream({ message });
};

export const searchWithGoogle = async (message: string): Promise<AsyncGenerator<GenerateContentResponse>> => {
    return ai.models.generateContentStream({
        model: "gemini-2.5-flash",
        contents: message,
        config: {
            tools: [{ googleSearch: {} }],
        },
    });
};
