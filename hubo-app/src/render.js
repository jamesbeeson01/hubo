document.addEventListener('DOMContentLoaded', () => {
    const closebtn = document.getElementById('close-btn');
    const smallshadow = document.getElementById('small-drawer-shadow-btn');
    const smalldrawer = document.getElementById('small-drawer');
    const allshadow = document.getElementById('all-apps-shadow-btn');
    const allapps = document.getElementById('all-apps');

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

    smallshadow.addEventListener('click', () => {
        smalldrawer.style.display = 'block';
        smallshadow.style.display = 'none';
        allshadow.style.display = 'block';
    });

    allshadow.addEventListener('click', () => {
        allshadow.style.display = 'none';
        allapps.style.display = 'block';
        allapps.style.position = 'fixed';
        smallshadow.style.display = 'block';
        smalldrawer.style.display = 'none';
    });

});