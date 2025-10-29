let openAppBTN = document.querySelector("#appointment");
let closeAppBTN = document.querySelector(".close_app");
const overlay2 = document.querySelector('#overlay2');

const apointment_cnt = gsap.timeline({
    paused: "true",
});

apointment_cnt.to(".appointment_cnt", 0.4, {
    autoAlpha: 1,
    delay: 0.1,
    x: 0,
});

apointment_cnt.from(
    ".close_app, .appointment_cnt h1, .appointment_cnt p, .appointment_cnt form, .appointment_cnt img",
    {
        duration: 0.5,
        opacity: 0,
        y: 15,
        stagger: {
            amount: 0.4,
        },
    },
    "-=.3"
);

function open_apointment_cnt() {
    apointment_cnt.play();
}
function close_apointment_cnt() {
    apointment_cnt.reverse();
}

openAppBTN.onclick = function () {
    open_apointment_cnt();
    overlay2.classList.add('active');
};

closeAppBTN.onclick = function () {
    close_apointment_cnt();
    overlay2.classList.remove('active');
};

overlay2.onclick = function () {
    close_apointment_cnt();
    overlay2.classList.remove('active');
};