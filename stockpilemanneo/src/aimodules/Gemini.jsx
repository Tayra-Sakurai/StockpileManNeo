import { GoogleGenAI } from "@google/genai";

/**
 * Gemini API Access
 * @type {import("@google/genai").GoogleGenAI}
 */
let aimodel;

if (globalThis.__aimodel) {
    aimodel = globalThis.__aimodel;
} else {
    aimodel = new GoogleGenAI({
        apiKey: import.meta.env.VITE_GEMINI_API_KEY,
    });
    globalThis.__aimodel = aimodel;
}

export default aimodel;
