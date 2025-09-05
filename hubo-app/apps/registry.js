

export const appRegistry = [
    {
        id: 'helloworld',
        name: 'Hello World!',
        description: 'Just a Hello World!',
        icon: '../icons/hello_world.png',
        call: () => console.log('Hello Worldy!')
    },
    {
        id: 'helloworld2',
        name: 'Hello World2!',
        description: 'Just a Hello World!',
        icon: '../icons/hello_world.png',
        call: () => console.log('Hello World!')
    },
    {
        id: 'helloworld3',
        name: 'Hello World3!',
        description: 'Just a Hello World!',
        icon: '../icons/hello_world.png',
        call: () => console.log('Hello World!')
    },
    {
        id: 'helloworld4',
        name: 'Hello World4!',
        description: 'Just a Hello World!',
        icon: '../icons/hello_world.png',
        call: () => console.log('Hello World!')
    },
    {
        id: 'goodbyeworld',
        name: 'Goodbye World!',
        description: 'A twist on Hello World!',
        icon: '../icons/hello_world.png',
        call: () => console.log('Goodbye World!')
    },
    {
        id: 'another',
        name: 'Another',
        description: 'Another mock app',
        icon: '../icons/another.png',
        call: () => console.log('Another')
    }
];

export const smallDrawerApps = appRegistry.slice(0, 4);