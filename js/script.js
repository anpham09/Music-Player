const timeBar = document.querySelector(".time_bar");
const slider = document.querySelector(".slider");

const music = document.querySelector('#audio');
const songName = document.querySelector('.music_name');
const artist = document.querySelector('.artist');
const disk = document.querySelector('.disk');
const currentTime = document.querySelector('.current_time');
const songTime = document.querySelector('.song_time');
const playButton = document.querySelector('.play_button');
const forwardButton = document.querySelector('forward_button');
const backwardButton = document.querySelector('.backward_button');


function moveStars(){
    const min = Number(timeBar.min) || 0;
    const max = Number(timeBar.max) || 100;
    const progress = (timeBar.value - min) / (max-min);
    const position = timeBar.offsetLeft + 16 + progress * (timeBar.clientWidth -32);
    slider.style.setProperty("--star-position", position + "px");
}

timeBar.addEventListener("input", moveStars);
window.addEventListener("resize", moveStars);
moveStars();

let currentMusic = 0;
playButton.addEventListener('click', () =>{
    playButton.classList.toggle('pause');
    disk.classList.toggle('play');
})

const setMusic = (i) => {
    timeBar.value = 0;
    let song = songs(i);
}