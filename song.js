const bar = document.querySelector(".time_bar");
const slider = document.querySelector(".slider");

function moveStars(){
    const min = Number(bar.min) || 0;
    const max = Number(bar.max) || 100;
    const progress = (bar.value - min) / (max-min);
    const position = bar.offsetLeft + 16 + progress * (bar.clientWidth -32);
    slider.style.setProperty("--star-position", position + "px");
}

bar.addEventListener("input", moveStars);
window.addEventListener("resize", moveStars);
moveStars();