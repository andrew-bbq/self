const UNTRANSLATED = "<!> Untranslated Nomai writing <!>";

const ID_TO_MESSAGE_MAP = {
    "about-me-spiral-1": "Andrew Bennett is a software engineer!",
    "education-spiral-1": "Andrew has a bachelor's degree in computer science and\na certificate in game design from the University of Wisconsin, Madison.\nI forget but I think his GPA was around 3.8 or give or take."
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
    console.log(spiral.style.visibility);
    const mainPath = spiral.querySelector(".nomai-writing-main-path");
    const glowPath = spiral.querySelector(".nomai-writing-blur");
    mainPath.classList.remove("spiral-drawing");
    mainPath.classList.add("spiral-drawing");
    glowPath.classList.remove("spiral-drawing");
    glowPath.classList.add("spiral-drawing");
}

function translateSpiral(id) {
    translated[id] = true;
    showSpiralText(id);
}

function showSpiralText(id) {
    const text = document.getElementById("translator-text");
    if (!translated[id]) {
        text.textContent = UNTRANSLATED;
        return;
    }
    text.textContent = ID_TO_MESSAGE_MAP[id];
}
