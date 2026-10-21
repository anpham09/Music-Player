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
const videoFile = document.querySelector("#video_file");
const localPlayer = document.querySelector(".local_player");
const localVideo = document.querySelector(".local_video");
const pipButton = document.querySelector(".pip_button");
const uploadMessage = document.querySelector(".upload_message");
const miniButton = document.querySelector(".mini_button");

let videos = [];
let playingId = "";
let videoDatabase = null;
let cardUrls = [];
let youtubeWindow = null;

try {
    videos = JSON.parse(localStorage.getItem("ans_videos")) || [];
} catch(error){
    message.textContent = "Can not read saved videos.";
}

function saveVideos(){
    const youtubeVideos =  [];
    const uploadedVideos = [];

    for(let i = 0; i < videos.length; i++){
        if(videos[i].file){
            uploadedVideos.push(videos[i]);
        } else {
            youtubeVideos.push(videos[i]);
        }
    }
    try{
        localStorage.setItem("ans_videos", JSON.stringify(youtubeVideos));
    } catch(error){
        message.textContent = "Your browser can not save this list.";
    }
    if(videoDatabase){
        try{
            const transaction = videoDatabase.transaction("uploads", "readwrite");
            const storage = transaction.objectStore("uploads");

            storage.put(uploadedVideos, "video_list");

            transaction.onabort = function(){
                uploadMessage.textContent = "Can not save uploaded videos. Browser storage may be full."
            };
        }catch(error){
            uploadMessage.textContent = "Can not save uploaded videos.";
        }
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

async function watchVideo(id,title, file){
    if(file){
        try{
            if(document.pictureInPictureElement == localVideo){
                await document.exitPictureInPicture();
            }
            localVideo.pause();
            if(localVideoUrl){
                URL.revokeObjectURL(localVideoUrl);
            }

            currentUpload = file;
            localVideoUrl = URL.createObjectURL(file);
            localVideo.src = localVideoUrl;
            localPlayer.hidden = false;
            pipButton.disabled = true;
            uploadMessage.textContent = title;
            favoritePicker.open = false;

            localPlayer.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        } catch(error){
            uploadMessage.textContent = "Close picture in picture and try again.";
        }
        return;
    }

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
    for(let i = 0; i < cardUrls.length; i++){
        URL.revokeObjectURL(cardUrls[i]);
    }
    cardUrls = [];
    watchList.replaceChildren();
    favoriteList.replaceChildren();

    let watchCount = 0;

    for(let i=0; i < videos.length; i++){
        const video = videos[i];
        if(video.file && !(video.file instanceof Blob)){
            continue;
        }
        const card = videoCard.content.firstElementChild.cloneNode(true);
        const thumbnail = card.querySelector("img");

        card.querySelector(".video_title").textContent = video.title;
        
        if(video.file){
            thumbnail.remove();

            const player = document.createElement("video");
            const fileUrl = URL.createObjectURL(video.file);

            player.src = fileUrl;
            player.controls = true;
            player.playsInline = true;
            player.preload = "metadata";
            player.className = "card_video";

            cardUrls.push(fileUrl);
            card.prepend(player);
        } else {
            thumbnail.src = "https://i.ytimg.com/vi/" + video.id + "/hqdefault.jpg";
        }
        card.querySelector(".watch_video").addEventListener("click", function(){
            watchVideo(video.id, video.title, video.file);
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
            if(video.file && currentUpload == video.file){
                localVideo.pause();
                localVideo.removeAttribute("src");
                localVideo.load();
                localPlayer.hidden = true;
                pipButton.disabled = true;
                videoFile.value = "";
                uploadMessage.textContent = "";

                URL.revokeObjectURL(localVideoUrl);
                localVideoUrl = "";
                currentUpload = null;
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

let localVideoUrl = "";
let currentUpload = null;

pipButton.disabled = true;

videoFile.addEventListener("change", async function(){
    const file = videoFile.files[0];

    if(!file){return;}

    try {
        if(document.pictureInPictureElement == localVideo){
            await document.exitPictureInPicture();
        }
        localVideo.pause();

        if(localVideoUrl){
            URL.revokeObjectURL(localVideoUrl);
        }
        localVideoUrl = URL.createObjectURL(file);
        localVideo.src = localVideoUrl;
        currentUpload = file;

        videos.push({
            title: file.name,
            file: file,
            favorite: false
        });
        saveVideos();
        showVideos();

        localPlayer.hidden = false;
        pipButton.disabled = true;
        uploadMessage.textContent = "";
    } catch(error){
        uploadMessage.textContent = "Close picture in picture and choose the file again.";
    }
});

localVideo.addEventListener("loadeddata", function(){
    if(document.pictureInPictureEnabled && localVideo.requestPictureInPicture){
        pipButton.disabled = false;
    } else {
        uploadMessage.textContent = "This browser does not support this picture-in-picture button.";
    }
});

pipButton.addEventListener("click", async function() {
    try{
        if(document.pictureInPictureElement == localVideo){
            await document.exitPictureInPicture();

        } else {
            await localVideo.requestPictureInPicture();
        }
        uploadMessage.textContent = "";
    } catch(error) {
        uploadMessage.textContent = "Can not open picture in picture. Try playing the video first.";
    }
});

localVideo.addEventListener("enterpictureinpicture", function(){
    pipButton.textContent = "Back to page";
});

localVideo.addEventListener("leavepictureinpicture", function(){
    pipButton.textContent = "Pic in pic";
});

localVideo.addEventListener("error", function(){
    pipButton.disabled = true;
    uploadMessage.textContent = "This video can not play. Try an MP4 file encoded with H.264.";
});

videoFile.disabled = true;
addButton.disabled = true;
const databaseRequest = indexedDB.open("ans_uploaded_videos", 2);

databaseRequest.onupgradeneeded = function(){
    const database = databaseRequest.result;
    if(!database.objectStoreNames.contains("uploads")){
        database.createObjectStore("uploads");
    }
};
databaseRequest.onsuccess = function(){
    videoDatabase = databaseRequest.result;

    const transaction = videoDatabase.transaction("uploads", "readonly");
    const storage = transaction.objectStore("uploads");
    const request = storage.get("video_list");

    request.onsuccess = function(){
        const savedVideos = request.result || [];
        for(let i = 0; i < savedVideos.length; i++){
            videos.push(savedVideos[i]);
        }

        showVideos();
        videoFile.disabled = false;
        addButton.disabled = false;
        uploadMessage.textContent = "";
    };
    request.onerror = function(){
        uploadMessage.textContent = "Can not load uploaded videos. Please reload the page.";
        addButton.disabled = false;
    };
};

databaseRequest.onerror = function(){
    uploadMessage.textContent = "Can not open video storage in this browser.";
    addButton.disabled = false;
}

miniButton.addEventListener("click", async function(){
    if(youtubeWindow && !youtubeWindow.closed){
        youtubeWindow.close();
        return;
    }
    try {
        youtubeWindow = await window.documentPictureInPicture.requestWindow({
            width: 480, height: 300
        });
        const miniWindow = youtubeWindow;

        const style = miniWindow.document.createElement("link");
        style.rel = "stylesheet";
        style.href = new URL("./css/videos.css", document.baseURI).href;
        miniWindow.document.head.appendChild(style);

        miniWindow.document.body.className = "youtube_mini";
        miniWindow.document.body.appendChild(videoFrame);

        miniButton.textContent = "Back to page";
        miniButton.setAttribute("aria-pressed", "true");

        miniWindow.addEventListener("pagehide", function(){
            videoScreen.appendChild(videoFrame);
            miniButton.textContent = "Mini Screen";
            miniButton.setAttribute("aria-pressed", "false");
            youtubeWindow = null;
        });

    } catch(error){
        message.textContent = "Can not open Mini Screen.";
        console.log(error);
    }
});