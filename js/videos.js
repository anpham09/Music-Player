const watchList = document.querySelector(".watch_list");
const favoriteList = document.querySelector(".favorite_list");
const favoritePicker = document.querySelector(".favorite_picker");
const videoScreen = document.querySelector(".video_screen");
const videoFrame = document.querySelector(".video_screen iframe");
const playingTitle = document.querySelector(".playing_title");
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
    favoritePicker.open = false;

    videoScreen.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


function showVideos(){
    watchList.replaceChildren();
    favoriteList.replaceChildren();

    let watchCount = 0;

    for(let i=0; i < videos.length; i++){
        const video = videos[i];
        const card = videoCard.content.firstElementChild.cloneNode(true);

        card.querySelector(".video_title").textContent = video.title;
        card.querySelector("img").src = "https://i.ytimg.com/vi/" +video.id + "/hqdefault.jpg";
        card.querySelector(".watch_video").addEventListener("click", function(){
            watchVideo(video.id, video.title);
        });

        const favoriteButton = card.querySelector(".save_favorite");
        favoriteButton.hidden = video.favorite;

        favoriteButton.addEventListener("click", function(){
            video.favorite = true;
            saveVideos();
            showVideos();
        });

        card.querySelector(".remove_video").addEventListener("click", function(){
            if(playingId == video.id){
                videoFrame.removeAttribute("src");
                videoScreen.hidden = true;
                playingId = "";
            }
            videos.splice(i, 1);
            saveVideos();
            showVideos();
        });

        if(video.favorite){
            favoriteList.appendChild(card);
        } else {
            watchList.appendChild(card);
            watchCount++;
        }
    }
    emptyMessage.hidden = watchCount > 0;
}
showVideos();

addForm.addEventListener("submit", async function(event){
    event.preventDefault();

    const id = getVideoId(videoInput.value.trim());
    if(!id){
        message.textContent = "Please paste a YouTube video link.";
        return;
    }

    for(let i = 0; i < videos.length; i++){
        if(videos[i].id ==id){
            message.textContent = "This video is already in your list.";
            return;
        }
    }
    addButton.disabled = true;
    message.textContent = "Getting the video title...";

    try {
        const link = "https://www.youtube.com/watch?v=" + id;
        const response = await fetch("https://noembed.com/embed?url=" + encodeURIComponent(link));
        if(!response.ok){throw new Error("Request failed");}
        //this is so hard aaaarhghghghghhg. no lets think its just an easy pie!
        const data = await response.json();
        if(data.error || !data.title){throw new Error("Video not found");}
        videos.push({
            id: id, title: data.title, favorite: false
        });

        message.textContent = "Added to Watch Later list!!!";
        saveVideos();
        showVideos();
        addForm.reset();
    } catch(error){
        message.textContent = "Could not get this video. Check the link and try again. "
    } finally {
        addButton.disabled = false;
    }
});
