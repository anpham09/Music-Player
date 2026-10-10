const timeBar = document.querySelector(".time_bar");
const slider = document.querySelector(".slider");
const playToggle = document.querySelector(".play_toggle");
const music = document.querySelector('#audio');
const songName = document.querySelector('.music_name');
const artist = document.querySelector('.artist');
const disk = document.querySelector('.disk');
const currentTime = document.querySelector('.current_time');
const songTime = document.querySelector('.song_time');
const playButton = document.querySelector('.play_button');
const forwardButton = document.querySelector('.forward_button');
const backwardButton = document.querySelector('.backward_button');

const cassetteButton = document.querySelector(".cassette_button");
const songList = document.querySelector(".song_list");


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
playToggle.addEventListener("change", function(){
    if(playToggle.checked){
        playMusic();
    } else {
        music.pause();
    }
});

music.addEventListener("play", function(){
    playToggle.checked = true;
});
music.addEventListener("pause", function(){
    playToggle.checked = false;
})

const setMusic = function (i) {
    timeBar.value = 0;
    let song = songs[i];
    currentMusic = i; //see how to make this random everytime
    music.src = song.path;

    songName.innerHTML = song.name;
    artist.innerHTML = song.artist;
    disk.style.backgroundImage = `url('${song.cover}')`;

    currentTime.innerHTML =  '00:00';
    
};
music.addEventListener("loadedmetadata", function(){
    timeBar.max = music.duration;
    songTime.innerHTML = formatTime(music.duration);
    moveStars();
})
setMusic(0);

function formatTime(time){
    let min = Math.floor(time / 60);
    if(min < 10){
        min = `0${min}`;
    }
    let sec = Math.floor(time % 60);
    if(sec < 10){
        sec = `0${sec}`;
    }
    return `${min} : ${sec}`;
}

music.addEventListener("timeupdate", function() {
    timeBar.value = music.currentTime;
    currentTime.innerHTML = formatTime(music.currentTime);
    moveStars();
});
music.addEventListener("ended", function(){
    forwardButton.click();
});

timeBar.addEventListener('change', ()=>{
    music.currentTime = timeBar.value;
})

function playMusic(){
    music.play().catch(function(error){
        playToggle.checked = false;
        console.log("Cannot play this song:", error);
    });
}

forwardButton.addEventListener('click', function(){
    if(currentMusic >= songs.length -1){
        currentMusic = 0;
    } else{
        currentMusic++;
    }
    setMusic(currentMusic);
    playMusic();
});
backwardButton.addEventListener('click', function(){
    if(currentMusic <= 0){
        currentMusic = songs.length -1;
    } else{
        currentMusic--;
    }
    setMusic(currentMusic);
    playMusic();
});

cassetteButton.addEventListener("click", function(){
    songList.hidden = !songList.hidden;
    cassetteButton.setAttribute("aria-expanded", !songList.hidden);
});

for(let i = 0; i < songs.length; i++){
    const button = document.createElement("button");
    button.className = "song_choice";
    button.textContent = songs[i].name + " - " + songs[i].artist;

    button.addEventListener("click", function(){
        setMusic(i);
        playMusic();
        songList.hidden = true;
        cassetteButton.setAttribute("aria-expanded", "false");
        cassetteButton.focus();
    });

    songList.appendChild(button);
}
setMusic(0);