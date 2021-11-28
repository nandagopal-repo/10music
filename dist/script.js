/*----------------------------------------"flow"--------------------------------------

    1. Get tracks form deezer api:
        i. get array of trending playlist using fetch function,
        ii. Or get array of user seached songs.

    2. render tracks to the container:
        i. set id value of all songs from "1 to required" for easy acces like array.

    3.  i. store the tracks form fetch api in "global variable - tracks",
        ii. access the songs using "tracks.array -> indexNumber -> by step2",

    4. when user select the song by click:
        i. findSong - by using "trackNumber" stored in step2,
        ii. findSource - using "indexNumber-trackNumber" to find songName and songSource easily by
            its stored in "tracks-array",
        iii. playSong - by audio.play.

    5. update songProgess bar using "timeupdate" - event listener for audio element.

 ---------------------------------------------------------------------------------------*/



// container for all song:
const songsHoldingContainer = document.querySelector('#songHoldingContainer');
// search:
const searchInput = document.querySelector('#searchField');
// song info:
const songTitle = document.querySelector('#songTitle');
const audio = document.querySelector('#audio');
const progressBar = document.querySelector('#songProgress');
// navigation button:
const homeBtn = document.querySelector('#homeBtn');
const playPauseBtn = document.querySelector('#playPauseBtn');
const nextSongBtn = document.querySelector('#nextSongBtn');
const previousSongBtn = document.querySelector('#previousSongBtn');
const loader = document.querySelector('#loading');
// global variables:
let trackNumber = 0;
let isPlaying = "false";
let tracks = [];  //get tracks from fetch function:


// ---------------------------------------adjuct mobile vh unit---------------------------------
document.querySelector('body').style.height = `${window.innerHeight}px`
if(window.innerHeight < 600){
    document.querySelector('body').style.fontSize = "10px";
}
//----------------------------------------------------------------------------------------------


async function fetchFunction(url){
    loader.style.display = "block";
    loader.style.animation = "spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite";
    playPauseBtn.style.opacity = "0";
    return await fetch(url, {
        "method": "GET",
        "headers": {
            "x-rapidapi-key": "248910b086mshc9056d9b1a30ec9p18cfacjsn5ceed1648681",
            "x-rapidapi-host": "deezerdevs-deezer.p.rapidapi.com"
        }
    })
    .then(response => response.json())
    .then(response => {
        loader.style.animation = "spin 1.2s cubic-bezier(0.5, 0, 0.5, 1)";
        playPauseBtn.style.opacity = "1";
        loader.style.display = "none";
        return response;
    })
    .catch(err => {
        console.log(err);
        alert("Results not found!");
    });
}

function findSong(e){
    if(e.target.className === 'song-name' ||
        e.target.className === 'song-author-name' ||
        e.target.className === 'song-image' ||
        e.target.className === 'song-container'){
        trackNumber = e.target.id;
        findSource(trackNumber);
    }
}

function findSource(trackNumber){
    let songName =  tracks[trackNumber].title_short;
    let songSource =  tracks[trackNumber].preview;
    console.log(trackNumber,songName,"-",songSource)
    playSong(songName,songSource);
}

function playSong(name,source){
    songTitle.innerText = name;
    audio.setAttribute('src',`${source}`);
    audio.play();
    isPlaying = "true";
    playPauseBtn.setAttribute('src',"assert/pause.svg");
}

function getSearchedPlaylist(){
    if(searchInput.value === '' || searchInput.value === null) return;
    const url = `https://deezerdevs-deezer.p.rapidapi.com/search?q=${searchInput.value}`;
    loader.style.animation = "spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite";
    const searchTracks = fetchFunction(url);
    searchTracks.then(response => {
        let playList = response.data;
        renderTracks(playList,songsHoldingContainer);
        tracks.splice(0, tracks.length);
        playList.forEach(track=>{
            tracks.push(track);
        })
    });
    searchInput.value = '';
    homeBtn.style.display = "block";
}

function getPlaylist(){
    const url = `https://deezerdevs-deezer.p.rapidapi.com/playlist/1963962142`;
    const defaultTracks = fetchFunction(url);
    defaultTracks.then(response => {
        let playList = response.tracks.data;
        renderTracks(playList,songsHoldingContainer);
        tracks.splice(0, tracks.length); //empty previous tracks:
        playList.forEach(track=>{
            if(track.preview === "" || track.preview === null) return;
            tracks.push(track); //add tracks:
        });
    })
}
getPlaylist(); //loads when started:
console.log(tracks);


//------------------------------------ UI --------------------------------------------//
function renderTracks(tracks,container){
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    let i = 0; //track array id;
    tracks.forEach(track => {
        const songContainer = document.createElement('li');
        songContainer.classList.add('song-container');
        if(track.album.cover_small === '' || track.album.cover_small === null || track.preview === "") return;
        songContainer.innerHTML = `
            <img src="${track.album.cover_small}" id="${i}" alt="song image" class="song-image">
            <div>
                <h1 class="song-name" id="${i}">${track.title_short}</h1>
                <h2 class="song-author-name" id="${i}">${track.artist.name}</h2>
            </div>
        `;
        songContainer.setAttribute("id",i);
        i++;
        container.appendChild(songContainer);
    });
}

function updateProgressBar(e){
    const { duration, currentTime } = e.srcElement;
    const progressPercent = (currentTime / duration) * 100;
    progressBar.style.width = `${progressPercent}%`;
}



//---------------------------------------Event Listners-------------------------------------------//
// user to search songs by song name:
searchInput.addEventListener('keydown',(e)=>{
    if(e.keyCode === 13){
        getSearchedPlaylist();
        searchInput.blur();
    }
})

//user to play song from the screen;
songsHoldingContainer.addEventListener('click',findSong);

// navigations - playPause , nextsong, previoussong:
playPauseBtn.addEventListener('click',()=>{
    if(isPlaying === "true"){
        audio.pause();
        playPauseBtn.setAttribute('src',"assert/play.svg");
        isPlaying = "false";
    }
    else if(trackNumber === 0){
        findSource(trackNumber);
    }
    else{
        audio.play();
        playPauseBtn.setAttribute('src',"assert/pause.svg");
        isPlaying = "true";
    }
})

nextSongBtn.addEventListener('click',()=>{
    trackNumber++;
    if (trackNumber >= tracks.length ){
        trackNumber -= 1
        return
    }
    findSource(trackNumber);
});

previousSongBtn.addEventListener('click',()=>{
    trackNumber--;
    if(trackNumber < 0){
        trackNumber += 1
        return
    } 
    findSource(trackNumber);  
});

// user to go previous screen:
homeBtn.addEventListener('click',()=>{
    homeBtn.style.display = "none";
    getPlaylist()
});

// for update progressbar:
audio.addEventListener('timeupdate',updateProgressBar);






