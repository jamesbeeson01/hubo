import { generateContentWrapper } from "./ai_wrapper.mjs";

export async function arnoldSchwarzenegger(prompt) {
    const response = await generateContentWrapper({
        config: { systemInstruction: 'You are Arnold Schwarzenneger' },
        model: 'gemini-2.0-flash-lite',
        contents: prompt
    })

    console.log(response.text);
}