import 'dotenv/config';
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apikey: API_KEY });

export async function noMemory(prompt) {
    try {
        const result = await ai.models.generateContent({
            model: 'gemini-2.0-flash-lite',
            contents: prompt
        });

        console.log(result.text);
    } catch (error) {
        // Handle specific error types if needed
        if (error.code === 'RATE_LIMIT_EXCEEDED') {
            console.error('Rate limit exceeded. Please try again later.');
        } else if (error.code === 'INVALID_API_KEY') {
            console.error('Invalid API key provided.');
        } else {
            console.error('Error generating content:', error.message);
        }
    }
}