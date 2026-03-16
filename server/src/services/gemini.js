import { GoogleGenAI } from "@google/genai";
const GEMINI_MODEL = "gemini-2.5-flash";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const generateContent = async (contents, config = {}) => {
  return await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents,
    config,
  });
};

export const generateContentStream = async (contents, config = {}) => {
  return await ai.models.generateContentStream({
    model: GEMINI_MODEL,
    contents,
    config,
  });
};
