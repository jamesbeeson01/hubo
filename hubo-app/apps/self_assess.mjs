import { generateContentWrapper } from "./ai_wrapper.mjs";

export async function selfAssess(prompt) {
    const model = 'gemini-2.5-flash';

    const firstresponse = await generateContentWrapper({
        model,
        contents: prompt
    });

    console.log('\n--------FIRST RESPONSE--------');
    console.log(firstresponse.text);

    let contents = [
        {
            role: 'user',
            parts: [{ text: prompt }]
        },
        {
            role: 'model',
            parts: [{ text: firstresponse.text }]
        },
        {
            role: 'user',
            parts: [{ text: 'What are some ways you could improve your last response?' }]
        }
    ];

    const feedback = await generateContentWrapper({
        model,
        contents
    })

    console.log('\n--------FEEDBACK--------');
    console.log(feedback.text);

    contents = [...contents, 
        {
            role: 'model',
            parts: [{ text: feedback.text }]
        },
        {
            role: 'user',
            parts: [{ text: 'respond again to my initial prompt while implementing your feedback' }]
        }
    ];

    const finalresponse = await generateContentWrapper({
        model,
        contents
    });

    console.log('\n--------FINAL RESPONSE--------');
    console.log(finalresponse.text);
}