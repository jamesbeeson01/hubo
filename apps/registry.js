import { noMemory } from "./default_ai.mjs";
import { arnoldSchwarzenegger } from "./arnold_schwarzenegger.mjs";
import { selfAssess } from "./self_assess.mjs";
import { clarify } from "./clarify.mjs";
import { tone } from "./tone.mjs";
import { twentyTwentyTwenty } from "./twenty_twenty_twenty.mjs";


export const appRegistry = [
    {
        id: 'nomemory',
        name: 'No Memory AI',
        description: 'A standard AI response that cannot recall past information or chat history',
        type: 'ai',
        icon: '../icons/no_memory.png',
        call: (prompt) => noMemory(prompt)
    },
    {
        id: 'arnold_schwarzenegger',
        name: 'Arnold Schwarzenegger',
        description: 'Simple header. Talks like Arnold Schwarzenegger',
        type: 'ai',
        icon: '../icons/hello_world.png',
        call: (prompt) => arnoldSchwarzenegger(prompt)
    },
    {
        id: 'self_assess',
        name: 'Self Assess',
        description: 'Chain that assesses response and responds again',
        type: 'ai',
        icon: '../icons/hello_world.png',
        call: (prompt) => selfAssess(prompt)
    },
    {
        id: 'clarify',
        name: 'Clarify',
        description: 'Router that either responds normally or asks for clarification',
        type: 'ai',
        icon: '../icons/hello_world.png',
        call: (prompt) => clarify(prompt)
    },
    {
        id: 'tone',
        name: 'Tone',
        description: 'Function caller determines temperature it should respond with',
        type: 'ai',
        icon: '../icons/hello_world.png',
        call: () => tone()
    },
    {
        id: 'twenty_twenty_twenty',
        name: '20-20-20',
        description: 'Every 20 minutes, covers the screen for 20 seconds so you look away. Click again to turn off',
        type: 'app',
        icon: '../icons/hello_world.png',
        call: () => twentyTwentyTwenty()
    },
    {
        id: 'icon_maker',
        name: 'Icon Maker',
        description: 'Creates an icon using AI, sizes it appropriately, and places it in the icons folder',
        type: 'app',
        icon: '../icons/another.png',
        call: () => console.log('Icon Maker not yet implemented')
    }
];

// The AI that receives prompts by default. Change this id to pin a different AI.
export const PINNED_AI_ID = 'nomemory';

export const smallDrawerApps = appRegistry.slice(0, 4);

// export function defaultAICall(prompt) { appRegistry[0].call };