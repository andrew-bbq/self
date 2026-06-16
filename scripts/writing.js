function writeAboutMe() {
    const spiral = document.getElementById("about-me-spiral-1");
    spiral.style.visibility = "visible";
    console.log(spiral.style.visibility);
    const path = spiral.querySelector(".nomai-writing-main-path");
    path.classList.remove("spiral-drawing");
    path.classList.add("spiral-drawing");
}
