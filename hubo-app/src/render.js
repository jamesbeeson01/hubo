document.addEventListener('DOMContentLoaded', () => {
    const omnibox = document.getElementById('omnibox');
    const resultscontainer = document.getElementById('results-container');
    const closebtn = document.getElementById('close-btn');
    const belowmain = document.getElementById('below-main');
    const smallshadow = document.getElementById('small-drawer-shadow-btn');
    const smalldrawer = document.getElementById('small-drawer');
    const allshadow = document.getElementById('all-apps-shadow-btn');
    const allbtn = document.getElementById('all-apps-btn');
    const allapps = document.getElementById('all-apps');
    const allappscontainer = document.getElementById('all-apps-container');
    const helpinfo = document.getElementById('help-info');

    async function fillApps(container, small=false) {
        let apps = await window.preload.getApps(small);

        container.innerHTML = '';
        apps.forEach(app => {
            container.innerHTML += `<div id="${app.id}" class="app clickable">${app.name.charAt(0)}</div>`
        });
    }

    fillApps(smalldrawer, small=true);
    fillApps(allappscontainer);
    
    resultscontainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('result')) {
            console.log('clicked result', event.target.id);
            window.preload.appTrigger(event.target.id);
        }
    });

    document.body.addEventListener('click', (event) => {
        if (event.target.classList.contains('app')) {
            console.log('clicked result', event.target.id);
            window.preload.appTrigger(event.target.id);
        }
    });

    omnibox.addEventListener('input', async () => {
        const apps = await window.preload.updateSearch(omnibox.value);
        const length = apps.length;
        
        const hubo = document.getElementById('hubo');
        hubo.textContent = `Hub${'o'.repeat(length)}`;

        resultscontainer.innerHTML = '';
        apps.forEach(app => {
            resultscontainer.innerHTML += `<div id="${app.id}" class="result">${app.name}</div>`
        });
    });

    closebtn.addEventListener('click', () => {
        // fade out
        const body = document.getElementsByTagName('body')[0];
        body.style.transition = 'opacity 0.15s';
        body.style.opacity = '0';
        
        // close window
        body.addEventListener('transitionend', () => {
            window.preload.closeWindow();
        }, { once: true });
    });

    belowmain.addEventListener('mouseleave', () => {
        smallshadow.style.display = 'block';
        smalldrawer.style.display = 'none';
        allshadow.style.display = 'none';
    });

    smallshadow.addEventListener('click', () => {
        smallshadow.style.display = 'none';
        smalldrawer.style.display = 'flex';
        allshadow.style.display = 'block';
    });

    allshadow.addEventListener('click', () => {
        smallshadow.style.display = 'block';
        smalldrawer.style.display = 'none';
        allshadow.style.display = 'none';
        allapps.style.display = 'block';
    });

    allapps.addEventListener('mouseleave', () => {
        allapps.style.display = 'none';
    });

    allbtn.addEventListener('click', () => {
        allapps.style.display = 'block';
    });

    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            if (helpinfo.style.display === 'block') {
                helpinfo.style.display = 'none';
            } else {
                helpinfo.style.display = 'block';
            }
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            window.preload.backLog('escape pressed');
            // if (omnibox.focus or omnibox.value) {
            //   omnibox.value = '';
            //   omnibox.focus = no
            // } else {
            //   close window
            // }
            //omnibox.focus);
            // omnibox.select();
        }
    });

    // document.addEventListener('keydown', (e) => {
    //     if (e.key === 'up or down' && 'omnibox is focused') {
    //         e.preventDefault();
    //         // move up and down in the results menu
    //     }
    // });

    // document.addEventListener('keydown', (e) => {
    //     if (e.key === 'Enter' && 'something is selected in the menu') {
    //         e.preventDefault();
    //         window.preload.backLog('Enter pressed');
    //         // run the app
    //     }
    // });

    // document.addEventListener('keydown', (e) => {
    //     if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && omnibox.value) {
    //         e.preventDefault();
    //         // send input to default AI
    //     }
    // });
});