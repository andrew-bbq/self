const UNTRANSLATED = "<!> Untranslated Nomai writing <!>"
const ABOUT_ME = "Andrew Bennett is a software engineer currently at Expedia Group."

function writeAboutMe() {
    const spiral = document.getElementById("about-me-spiral-1");
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
