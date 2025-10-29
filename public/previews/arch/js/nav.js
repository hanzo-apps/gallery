export function animateNav() {
    const hamburger = document.querySelector(".open_nav");
    const button = document.querySelector('.hamburger');
    const overlay = document.querySelector('#overlay');
    const navigation = createNavigationTimeline();

    function toggleNavigation() {
        if (navigation.progress() === 1) {
            navigation.reverse().eventCallback('onReverseComplete', () => {
                overlay.classList.remove('active');
            });
        } else {
            navigation.play();
            overlay.classList.add('active');
        }
        button.classList.toggle('-menu-open');
    }

    function createNavigationTimeline() {
        return gsap.timeline({ paused: true })
            .from(".navigation_menu", {
                autoAlpha: 0,
                delay: 0.1,
                ease: Expo.easeOut,
                duration: .8,
                xPercent: 20,
            })
            .from(".navigation_cnt", {
                opacity: 0,
                x: 40,
            }, "-=.5");
    }

    hamburger.addEventListener('click', toggleNavigation);
    overlay.addEventListener('click', toggleNavigation);
}