const UNTRANSLATED = "<!> Untranslated Nomai writing <!>";
const TRANSLATE_TIME = 0.7;
let uTime = 0;
let currentId = '';

const ID_TO_MESSAGE_MAP = {
    "about-me-spiral-1": "This is the about me section.\nI will write about myself here",
    "education-spiral-1": "Andrew has a bachelor's degree in computer science and\na certificate in game design from the University of Wisconsin, Madison.",
    "education-spiral-2": "His GPA was good... probably\n:P",
}

const translated = {};

function writeSpiral(id) {
    const activeSpirals = document.getElementsByClassName("active-spiral");
    [...activeSpirals].forEach((activeSpiral) => {
        removeSpiralDrawing(activeSpiral);
        activeSpiral.classList.remove("active-spiral");
    });
    writeSubSpiral(id);
}

function removeSpiralDrawing(spiral) {
    const mainPath = spiral.querySelector(".nomai-writing-main-path");
    const glowPath = spiral.querySelector(".nomai-writing-blur");
    mainPath.classList.remove("spiral-drawing");
    glowPath.classList.remove("spiral-drawing");
}

// write a spiral without closing other spirals
function writeSubSpiral(id) {
    const spiral = document.getElementById(id);
    spiral.classList.add("active-spiral");
    spiral.style.visibility = "visible";
    const mainPath = spiral.querySelector(".nomai-writing-main-path");
    const glowPath = spiral.querySelector(".nomai-writing-blur");
    mainPath.classList.remove("spiral-drawing");
    mainPath.classList.add("spiral-drawing");
    glowPath.classList.remove("spiral-drawing");
    glowPath.classList.add("spiral-drawing");
}

function translateSpiral(id) {
    if (!translated[id]) {
        uTime = 0.0;
        translated[id] = true;
        const spiral = document.getElementById(id);
        const mainPath = spiral.querySelector(".nomai-writing-main-path");
        const glowPath = spiral.querySelector(".nomai-writing-blur");
        mainPath.classList.add("read");
        glowPath.classList.add("read");
        mainPath.classList.remove("unread");
        glowPath.classList.remove("unread");
    } else {
        uTime = TRANSLATE_TIME;
    }
    showSpiralText(id);
}

function showSpiralText(id) {
    currentId = id;
}

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789{}[]!@#$%^&*()_+-=";
function randChar() {
    return CHARS.charAt(Math.floor(Math.random() * CHARS.length));
}

function randString(length) {
    return Array.from({length}, randChar).join('');
}

export function updateWriting(delta) {
    let content = ID_TO_MESSAGE_MAP[currentId];
    const text = document.getElementById("translator-text");
    if (uTime > TRANSLATE_TIME) {
        text.textContent = content;
    }
    uTime += delta;
    if (!translated[currentId]) {
        text.textContent = UNTRANSLATED;
        return;
    }
    const toReplace = Math.min(1.0, uTime / TRANSLATE_TIME) * content.length / 2;
    const randomLength = (content.length / 2) - toReplace;
    const middle = content.slice(randomLength, content.length - randomLength);
    text.textContent = randString(randomLength) + middle + randString(randomLength);
}

// expose functions for onclick/events
window.writeSpiral = writeSpiral;
window.translateSpiral = translateSpiral;
window.showSpiralText = showSpiralText;
