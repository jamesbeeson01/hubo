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

    const toast = document.getElementById('toast');
    let toastTimer;

    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('show'), 1500);
    }

    async function triggerApp(id, text) {
        const result = await window.preload.appTrigger(id, text);
        if (result && result.message) showToast(result.message);
    }

    fillApps(smalldrawer, small=true);
    fillApps(allappscontainer);
    
    // Results state: what mode the text was read as, and which row Enter/click will run.
    let mode = 'none';
    let results = [];
    let highlighted = 0;

    function renderResults() {
        resultscontainer.innerHTML = '';
        results.forEach((app, i) => {
            const row = document.createElement('div');
            row.className = 'result' + (i === highlighted ? ' highlighted' : '');
            row.dataset.index = i;
            row.textContent = app.name;
            resultscontainer.appendChild(row);
        });
    }

    function setTitle(length) {
        document.getElementById('hubo').textContent = `Hub${'o'.repeat(Math.min(length + 1, 7))}`;
    }

    function clearOmnibox() {
        omnibox.value = '';
        mode = 'none';
        results = [];
        highlighted = 0;
        renderResults();
        setTitle(0);
    }

    // Enter and click both land here: open mode launches the app, prompt mode sends the text to it.
    function runResult(index) {
        const app = results[index];
        if (!app) return;
        const text = mode === 'prompt' ? omnibox.value : '';
        clearOmnibox();
        triggerApp(app.id, text);
    }

    // Keep focus in the omnibox when a row is pressed so the list doesn't hide before the click lands.
    resultscontainer.addEventListener('mousedown', (event) => event.preventDefault());

    resultscontainer.addEventListener('click', (event) => {
        const row = event.target.closest('.result');
        if (row) runResult(Number(row.dataset.index));
    });

    omnibox.addEventListener('focus', () => resultscontainer.classList.remove('hidden'));
    omnibox.addEventListener('blur', () => resultscontainer.classList.add('hidden'));

    document.body.addEventListener('click', (event) => {
        if (event.target.classList.contains('app')) {
            console.log('clicked result', event.target.id);
            const text = omnibox.value || 'hi';
            triggerApp(event.target.id, text);
        }
    });

    omnibox.addEventListener('input', async () => {
        const text = omnibox.value;
        setTitle(text.length);
        const found = await window.preload.updateSearch(text);
        if (omnibox.value !== text) return; // a newer keystroke superseded this lookup
        mode = found.mode;
        results = found.results;
        highlighted = 0;
        renderResults();

        if (!omnibox.value) omnibox.blur();
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

    // ctrl + k
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

    // Escape goes back one layer: hide the results (blur), then clear the text, then close the window
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            if (omnibox.value && document.activeElement === omnibox) {
                omnibox.blur();
            } else if (omnibox.value) {
                clearOmnibox();
            } else {
                window.preload.closeWindow();
            }
        }
    });

    // Up/Down move the highlight, Enter runs it
    omnibox.addEventListener('keydown', (e) => {
        if (!results.length) return;
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            const step = e.key === 'ArrowDown' ? 1 : -1;
            highlighted = (highlighted + step + results.length) % results.length;
            renderResults();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            runResult(highlighted);
        }
    });

    // Handle standard input characters (like "H", "`", etc.)
    document.addEventListener('keydown', (e) => {
        // Check if it's a standard printable character (not a shortcut or special key)
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
            // Focus omnibox if it's not already focused
            if (document.activeElement !== omnibox) {
                omnibox.input = '';
                omnibox.focus();
            }
        }
    });

});