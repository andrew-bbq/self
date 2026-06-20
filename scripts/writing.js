const UNTRANSLATED = "<!> Untranslated Nomai writing <!>\n(click to translate)";
const TRANSLATE_TIME = 0.7;
let uTime = 0;
let currentId = '';

// GLYPH SETUP BLOCK (FOR MY READABILITY)

const ABOUT_ME_SPIRAL_1_ID = "about-me-spiral-1";
const ABOUT_ME_SPIRAL_2_ID = "about-me-spiral-2";
const ABOUT_ME_SPIRAL_3_ID = "about-me-spiral-3";
const EDUCATION_SPIRAL_1_ID = "education-spiral-1";
const EDUCATION_SPIRAL_2_ID = "education-spiral-2";
const EXPERIENCE_SPIRAL_1_ID = "experience-spiral-1";
const EXPERIENCE_SPIRAL_2_ID = "experience-spiral-2";
const EXPERIENCE_SPIRAL_3_ID = "experience-spiral-3";
const PROJECTS_SPIRAL_1_ID = "projects-spiral-1";


// when {key} is translated, open {value}
const CHILD_SPIRAL_MAP = {
    [ABOUT_ME_SPIRAL_1_ID]: ABOUT_ME_SPIRAL_2_ID,
    [ABOUT_ME_SPIRAL_2_ID]: ABOUT_ME_SPIRAL_3_ID,
    [EDUCATION_SPIRAL_1_ID]: EDUCATION_SPIRAL_2_ID,
    [EXPERIENCE_SPIRAL_1_ID]: EXPERIENCE_SPIRAL_2_ID,
    [EXPERIENCE_SPIRAL_2_ID]: EXPERIENCE_SPIRAL_3_ID,
}

const DEFAULT_SPIRAL_FILTER = {
    baseFrequency: 0.8,
    numOctaves: 10,
    scale: 15,
};

const SPIRAL_DATA = [
    {
        pathId: ABOUT_ME_SPIRAL_1_ID,
        d: "M -81 82 Q -25 55 12 7 Q 57 -49 45 -148 Q 31 -217 -43 -225 Q -114 -230 -148 -182 Q -180 -130 -156 -91 Q -125 -55 -95 -55 Q -36 -58 -36 -98",
        viewBox: "-190 -250 260 350",
        filter: DEFAULT_SPIRAL_FILTER,
    },
    {
        pathId: ABOUT_ME_SPIRAL_2_ID,
        d: "M 62 28 Q 91 -4 121 -5 Q 160 -2 175 15 Q 194 46 179 79 Q 165 97 145 100 Q 130 102 117 94 Q 106 85 105 70 Q 109 46 132 40",
        viewBox: "52 -15 152 127",
        filter: DEFAULT_SPIRAL_FILTER,
    },
    {
        pathId: ABOUT_ME_SPIRAL_3_ID,
        d: "M 24.0416 -63.6396 Q 67 -61 89.0955 -82.0244 Q 114.4599 -111.5165 113.1306 -134.8238 Q 104.4139 -169.5516 70.6549 -182.2138 Q 48.3866 -185.2343 32.0863 -173.5869 Q 19.7607 -163.565 16.7668 -149.1069 Q 15.1817 -134.7721 24.6207 -124.241 Q 44.5477 -109.6016 65.0538 -121.6224",
        viewBox: "52 -15 152 127",
        filter: DEFAULT_SPIRAL_FILTER,
    },
    {
        pathId: EDUCATION_SPIRAL_1_ID,
        d: "M 40 0 Q 13 -56 25 -137 Q 33 -201 81 -264 Q 122 -322 206 -312 Q 264 -290 269 -230 Q 257 -134 197 -128 Q 160 -126 148 -153 Q 141 -184 148 -199",
        viewBox: "-10 -328 310 340",
        filter: DEFAULT_SPIRAL_FILTER,
    },
    {
        pathId: EDUCATION_SPIRAL_2_ID,
        d: "M 15 -125 Q 15 -140 6 -150 Q 3 -156 -7 -168 Q -26 -181 -54 -175 Q -78 -170 -87 -154 Q -93 -135 -84 -123 Q -74 -110 -57 -110 Q -33 -115 -34 -136",
        viewBox: "-95 -185 120 85",
        filter: {
            baseFrequency: 0.4,
            numOctaves: 5,
            scale: 7,
        },
    },
    {
        pathId: EXPERIENCE_SPIRAL_1_ID,
        d: "M -40 -33 Q 20 -71 18 -121 Q 16 -159 0 -176 Q -29 -197 -63 -185 Q -82 -173 -87 -153.6 Q -90 -138 -83 -125 Q -75 -113 -61 -111 Q -28 -114 -34 -147",
        viewBox: "-100 -200 160 200",
        filter: DEFAULT_SPIRAL_FILTER,
    },
    {
        pathId: EXPERIENCE_SPIRAL_2_ID,
        d: "M -51 -32 Q -61 -67 -81 -92 Q -112 -114 -135 -113 Q -170 -104 -182 -71 Q -185 -48 -174 -32 Q -164 -20 -149 -17 Q -135 -15 -124 -25 Q -105 -52 -125 -64",
        viewBox: "-205 -135 175 140",
        filter: DEFAULT_SPIRAL_FILTER,
    },
    {
        pathId: EXPERIENCE_SPIRAL_3_ID,
        d: "M -59 13 Q -91 -4 -122 -7 Q -160 -2 -175 15 Q -194 46 -179 79 Q -165 97 -145 100 Q -130 102 -117 94 Q -106 85 -105 70 Q -111 38 -134 43",
        viewBox: "-215 -30 180 155",
        filter: DEFAULT_SPIRAL_FILTER,
    },
];

const NOMAI_SVG_DEFS = ({ baseFrequency, numOctaves, scale }) => `
    <defs>
        <filter id="scribble">
            <feTurbulence type="turbulence" baseFrequency="${baseFrequency}" numOctaves="${numOctaves}" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="${scale}" xChannelSelector="R"
                yChannelSelector="G" />
        </filter>
        <filter id="glow">
            <feGaussianBlur stdDeviation="8" />
        </filter>
    </defs>
`;

const NOMAI_SCAN_GROUP = (pathId) => `
    <g class="nomai-scan-group">
        <line class="nomai-scan-line" x1="0" y1="-20" x2="0" y2="20">
            <animateMotion dur="1.5s" repeatCount="indefinite" rotate="auto" keyPoints="0;1;0"
                keyTimes="0;0.5;1" calcMode="linear">
                <mpath href="#${pathId}-main" />
            </animateMotion>
        </line>
        <line class="nomai-scan-line" x1="0" y1="-25" x2="0" y2="25">
            <animateMotion dur="1.5s" repeatCount="indefinite" rotate="auto" keyPoints="1;0;1"
                keyTimes="0;0.5;1" calcMode="linear">
                <mpath href="#${pathId}-main" />
            </animateMotion>
        </line>
        <line class="nomai-scan-line" x1="0" y1="-15" x2="0" y2="15">
            <animateMotion dur="2s" repeatCount="indefinite" rotate="auto" keyPoints="1;0;1" keyTimes="0;0.5;1"
                calcMode="linear">
                <mpath href="#${pathId}-main" />
            </animateMotion>
        </line>
    </g>
`;

function createSpiralPaths(pathId, d) {
    return `
        <path id="${pathId}-main" class="nomai-writing-main-path unread" pathLength="1" filter="url(#scribble)" d="${d}" />
        <path class="nomai-writing-blur unread" pathLength="1" filter="url(#glow)" d="${d}" />
    `;
}

function createSpiralSvg({ viewBox, pathId, d, filter }) {
    return `
        <svg viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            ${NOMAI_SVG_DEFS(filter)}
            ${createSpiralPaths(pathId, d)}
            ${NOMAI_SCAN_GROUP(pathId)}
        </svg>
    `;
}

function setupSpiral(spiralData) {
    const { pathId, d, viewBox, filter } = spiralData;
    const spiral = document.getElementById(pathId);
    spiral.innerHTML = createSpiralSvg({
        viewBox,
        pathId,
        d,
        filter,
    });
    spiral.onmouseover = () => showSpiralText(pathId);
    spiral.onclick = () => translateSpiral(pathId);
}

SPIRAL_DATA.forEach(setupSpiral);

// END GLYPH SETUP BLOCK

const ID_TO_MESSAGE_MAP = {
    [ABOUT_ME_SPIRAL_1_ID]: "Andrew Bennett is a software engineer from Wisconsin.\nHe lives in Seattle right now.",
    [ABOUT_ME_SPIRAL_2_ID]: "He likes to write Kotlin and Rust.\nNo idea why this page is raw JS and HTML...\nDisgusting.",
    [ABOUT_ME_SPIRAL_3_ID]: "Feel free to reach out to awbennett@wisc.edu.\nGithub: andrew-bbq\nLinkedIn: /in/andruwu",
    [EDUCATION_SPIRAL_1_ID]: "Andrew has a bachelor's degree in computer science\nand a certificate in game design\nfrom the University of Wisconsin, Madison (2018-2021).",
    [EDUCATION_SPIRAL_2_ID]: "His GPA was good... probably.",
    [EXPERIENCE_SPIRAL_1_ID]: "Andrew is currently at Expedia Group (2023-present).\nHe is on the Incentives team,\nworking on awarding rewards points at scale.",
    [EXPERIENCE_SPIRAL_2_ID]: "He worked at Amazon on the Prime team from 2021-2023,\nalso on customer retention and award flows.",
    [EXPERIENCE_SPIRAL_3_ID]: "... and from 2018-2021, Andrew did web development\npart-time through college (yay PHP!)",
}

const translated = {};

function writeSpiral(id) {
    const activeSpirals = document.getElementsByClassName("active-spiral");
    [...activeSpirals].forEach((activeSpiral) => {
        removeSpiralDrawing(activeSpiral);
        activeSpiral.classList.remove("active-spiral");
        activeSpiral.style.visibility = "hidden";
    });
    writeSubSpiral(id);

    // TODO: Trace through dependencies and open them if this is translated
    openSubSpirals(id);
}

function openSubSpirals(id) {
    if (!translated[id]) {
        return;
    }
    const toOpen = [];
    let curr = CHILD_SPIRAL_MAP[id];
    while (curr) {
        toOpen.push(curr);
        if (!translated[curr]) {
            break;
        }
        curr = CHILD_SPIRAL_MAP[curr];
    }
    toOpen.forEach(writeSubSpiral);
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
    openSubSpirals(id);
}

function showSpiralText(id) {
    currentId = id;
}

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789{}[]!@#$%^&*()_+-=";
function randChar() {
    return CHARS.charAt(Math.floor(Math.random() * CHARS.length));
}

function randString(segment) {
    return Array.from(segment, (char) => char === "\n" ? char : randChar()).join('');
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
    const randomPrefix = randString(content.slice(0, randomLength));
    const randomSuffix = randString(content.slice(content.length - randomLength));
    text.textContent = randomPrefix + middle + randomSuffix;
}

// expose functions for onclick/events
window.writeSpiral = writeSpiral;
window.translateSpiral = translateSpiral;
window.showSpiralText = showSpiralText;
