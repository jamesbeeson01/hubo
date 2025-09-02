document.addEventListener('DOMContentLoaded', () => {
    const closebtn = document.getElementById('close-btn');
    if(closebtn) {
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
    }
});