document.addEventListener('DOMContentLoaded', function(){

    setupIntersectionObserver_introSound();

})

function initializePlot_introSound() {
    const introSound = new Audio('../data/introSound.wav');
    introSound.play();
}

function setupIntersectionObserver_introSound() {
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                initializePlot_introSound();
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        threshold: 0.5
    });

    const target = document.querySelector('.intro');
    observer.observe(target);
}

