export function preloader() {
    const loader = gsap.timeline();
    const animateImgs = [1, 2, 3, 4, 5, 6].map((index) =>
        loader.from(`.animateImg${index}`, { y: "100%", duration: 0.8, delay: index === 1 ? 0 : -0.3 })
    );
    // For Home 01
    loader.to(".animateImg", { duration: 0.8, delay: -0.3, opacity: 0 });
    loader.to(".preloader", { y: "-100%", duration: 1.4, delay: -0.3, ease: Expo.easeOut });
    loader.from(".hero_heading h1", { y: 250, skewY: 20, delay: -.9, duration: 1 });
    // For Home 02
    loader.from("#hero p", { y: 20, opacity: 0, delay: -.9, duration: 1 });
    loader.from("#hero .btn", { y: 20, opacity: 0, delay: -.9, duration: 1 });
}
