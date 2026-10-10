const watchList = document.querySelector(".watch_list");
const favoriteList = document.querySelector(".favorite_list");
const favoritePicker = document.querySelector(".favorite_picker");
const firstFavorites = document.querySelectorAll(".first_favorites button");
const videoScreen = document.querySelector(".video_screen");
const videoFrame = document.querySelector(".video_screen iframe");
const playingTitle = document.querySelector(".playing_title");
// const youtubeLink = document.querySelector(".youtube_link");
const emptyMessage = document.querySelector(".empty_message");
const message = document.querySelector(".message");
const videoCard = document.querySelector("#video_card");
const addForm = document.querySelector(".add_video");
const videoInput = document.querySelector("#video_link");
const addButton = document.querySelector(".add_video button");

let videos = [];
let playingId = "";

try {
    videos = JSON.parse(localStorage.getItem("ans_videos")) || [];
} catch(error){
    message.textContent = "Can not read saved videos.";
}

function saveVideos(){
    try{
        localStorage.setItem("ans_videos", JSON.stringify(videos));
    } catch(error){
        message.textContent = "Your browser can not save this list.";
    }
}

function getVideoId(link){
    try{
        const url = new URL(link);
        let id="";

        if(url.hostname == "youtu.be"){
            id = url.pathname.split("/")[1];
        } else if(url.hostname=="youtube.com"||url.hostname=="www.youtube.com"||url.hostname=="m.youtube.com"){
            id = url.searchParams.get("v");

            if(!id){
                const parts = url.pathname.split("/");
                if(parts[1]=="shorts"||parts[1]=="embed"||parts[1]=="live"){
                    id=parts[2];
                }
            }
        }

        if(/^[a-zA-Z0-9_-]{11}$/.test(id)){
            return id;
        }
    } catch(error){
        return null;
    }
    return null;
}

function watchVideo(id,title){
    if(!/^[a-zA-Z0-9_-]{11}$/.test(id)){
        message.textContent = "Put your video ID in this favorite button first!";
        return;
    }
    playingId = id;
    videoScreen.hidden = false;
    playingTitle.textContent = title;
    videoFrame.src = "https://www.youtube.com/embed/" + id;
    youtubeLink.href = "https://www.youtube.com/watch?v=" + id;
    favoritePicker.open = false;

    videoScreen.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

for(let i=0; i < firstFavorites.length; i++){
    firstFavorites[i].addEventListener("click", function(){
        watchVideo(firstFavorites[i].CDATA_SECTION_NODE.id,firstFavorites[i],textContent.trim());
    });
}

function showVideos(){
    watchList.replaceChildren();
    favoriteList.replaceChildren();

    let watchCount = 0;

    for(let i=0; i < videos.length; i++){
        const video = videos[i];
        const card = videoCard.textContent.firstElementChild.cloneNode(true);

        card.querySelector(".video_title").textContent = video.title;
        card.querySelector("img").src = "https://i.ytimg.com/vi/" +video.id + "/hqdefault.jpg";
        
    }
}