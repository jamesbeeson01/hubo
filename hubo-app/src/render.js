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

    // phase 1
    smalldrawer.innerHTML = '<div class="app"><p>A</p></div>'.repeat(4);
    // phase 2
    // const drawerapps = await window.preload.getApps();
    // smalldrawer.innerHTML = '<div class="app"><p>A</p></div>'.repeat(apps.length);
    // phase 3
    // const drawerapps = window.preload.getApps();
    // smalldrawer.innerHTML = '';
    // drawerapps.forEach(app => {
    //     smalldrawer.innerHTML += `<div id="${app.id}" class="app">${app.name[0]}</div>`
    // });
    
    resultscontainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('result')) {
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
});