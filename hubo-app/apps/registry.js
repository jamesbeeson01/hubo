import { noMemory } from "./default_ai.mjs";


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
        id: 'helloworld2',
        name: 'Hello World2!',
        description: 'Just a Hello World!',
        type: 'app',
        icon: '../icons/hello_world.png',
        call: () => console.log('Hello World!')
    },
    {
        id: 'helloworld3',
        name: 'Hello World3!',
        description: 'Just a Hello World!',
        type: 'app',
        icon: '../icons/hello_world.png',
        call: () => console.log('Hello World!')
    },
    {
        id: 'helloworld4',
        name: 'Hello World4!',
        description: 'Just a Hello World!',
        type: 'app',
        icon: '../icons/hello_world.png',
        call: () => console.log('Hello World!')
    },
    {
        id: 'goodbyeworld',
        name: 'Goodbye World!',
        description: 'A twist on Hello World!',
        type: 'app',
        icon: '../icons/hello_world.png',
        call: () => console.log('Goodbye World!')
    },
    {
        id: 'another',
        name: 'Another',
        description: 'Another mock app',
        type: 'app',
        icon: '../icons/another.png',
        call: () => console.log('Another')
    }
];

export const smallDrawerApps = appRegistry.slice(0, 4);

// export function defaultAICall(prompt) { appRegistry[0].call };