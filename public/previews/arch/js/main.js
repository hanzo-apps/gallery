import { preloader } from './preloader.js';
import { animateNav } from './nav.js';
import { marquee } from './marquee.js';

let locoScroll;
locoScroll = new LocomotiveScroll({
    el: document.querySelector("#main"),
    smooth: true,
    getDirection: true,
    mobile: {
        smooth: true,
        inertia: 0.8,
        getDirection: true,
    },
    tablet: {
        smooth: true,
        inertia: 0.8,
        getDirection: true,
    },
});

new ResizeObserver(() => locoScroll.update()).observe(
    document.querySelector("#main")
);

preloader();
animateNav();
marquee();