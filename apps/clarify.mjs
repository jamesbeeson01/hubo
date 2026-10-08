import { generateContentWrapper } from "./ai_wrapper.mjs";
import { Type } from "@google/genai";

export async function clarify(prompt) {
    const model = 'gemini-2.5-flash';

    const decision = await generateContentWrapper({
        model,
        contents: `Is this a clear question?\n\n ${prompt}`,
        config: {
            responseMimeType: "text/x.enum",
            responseSchema: {
                type: Type.STRING,
                enum: ["Clear", "Unclear"],
            },
        },
    });

    console.log('\n----------DECISION----------');
    console.log(decision.text);
    const instructions = decision.text == "Unclear" ? 'Ask 1 to 3 clarifying questions' : 'Answer succinctly and decisively';

    const response = await generateContentWrapper({
        model,
        contents: prompt,
        config: {
            systemInstruction: instructions
        }
    });

    console.log('\n----------RESPONSE----------');
    console.log(response.text);

}