let currentSong = new Audio();
let songs = [];
let currFolder;

function secToMinSec(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  const mins = Math.floor(seconds / 60);
  const remSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(mins).padStart(2, "0");
  const formattedSeconds = String(remSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
  let response = await a.text();

  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];

  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  let songUL = document
    .querySelector(".lib-songs")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML =
      songUL.innerHTML +
      `
        <li>
          <img class="invert" src="svg/music.svg" alt="">
          <div class="info">
            <div>${song.replaceAll("%20", " ")}</div>
            <div>Ayush</div>
          </div>
          <div class="play">
            <img id="playbtn" class="invert" src="svg/play.svg" alt="">
          </div>       
        </li>
        `;
  }

  // Attach event listener to each song
  Array.from(
    document.querySelector(".lib-songs").getElementsByTagName("li")
  ).forEach((element) => {
    element.addEventListener("click", (e) => {
      playMusic(element.querySelector(".info").firstElementChild.innerHTML);
    });
  });

  return songs;
}

const playMusic = (track, pause = false) => {
  currentSong.src = `${currFolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "svg/pause.svg";
  }
  document.querySelector(".vol-ctrl").style.left =
    currentSong.volume * 100 + "%";
  document.querySelector(".seek-vol-fill").style.width =
    currentSong.volume * 100 + "%";
  document.querySelector(".song-info").innerHTML = decodeURI(track);
  document.querySelector(".song-time").innerHTML = "00:00";
  document.querySelector(".song-duration").innerHTML = "00:00";
};

async function displayAlbums() {
  let a = await fetch(`http://127.0.0.1:3000/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anc = div.getElementsByTagName("a");

  let cardContainer = document.querySelector(".card-container");

  let array = Array.from(anc);
  for (let index = 0; index < anc.length; index++) {
    const e = array[index];

    if (e.href.includes("/songs")) {
      let folder = e.href.split("/").slice(-2)[0];

      // get metadata of the folder
      let a = await fetch(
        `http://127.0.0.1:3000/songs/${folder}/info.json`
      );
      let response = await a.json();

      cardContainer.innerHTML =
        cardContainer.innerHTML +
        `<div data-folder="${folder}" class="card">
        <div class="play-btn">
        <img src="svg/play.svg" alt="" />
        </div>
        <img src="songs/${folder}/cover.jpeg" alt=""/>
        <h2>${response.title}</h2>
        <p>${response.description}</p>
        </div>`;
    }
  }

  // load playlist when card is clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      console.log(item.currentTarget.dataset.folder)
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0]);
    });
  });
}

async function main() {
  // getting array of songs
  await getSongs("songs/ncs");
  playMusic(songs[0], true);

  // Displaying all albums
  displayAlbums();

  // Attaching event listener to play. next and previous
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "svg/pause.svg";
    } else {
      currentSong.pause();
      play.src = "svg/play.svg";
    }
  });

  // Listen for timeUpdate event
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".song-time").innerHTML = secToMinSec(
      currentSong.currentTime
    );
    document.querySelector(".song-duration").innerHTML = secToMinSec(
      currentSong.duration
    );
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
    document.querySelector(".seek-fill").style.width =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // Add an event listener to seekbar
  document.querySelector(".pseudo-seek").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    document.querySelector(".seek-fill").style.width = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = 0;
  });
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = -100 + "%";
  });

  // previous and next
  previous.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    } else {
      currentSong.currentTime = 0;
      currentSong.play();
    }
  });
  next.addEventListener("click", () => {
    currentSong.pause();
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]) + 1;
    console.log(songs.length);
    if (index < songs.length) {
      playMusic(songs[index]);
    } else {
      playMusic(songs[0]);
    }
  });

  // volume control
  document.querySelector(".pseudo-vol").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".vol-ctrl").style.left = percent + "%";
    document.querySelector(".seek-vol-fill").style.width = percent + "%";
    if (percent < 0) {
      currentSong.volume = 0;
    } else {
      currentSong.muted = false;
      currentSong.volume = percent / 100;
    }
    if (currentSong.volume == 0) {
      vol.src = "svg/mute.svg";
    } else {
      vol.src = "svg/volume.svg";
    }
  });

  document.querySelector("#vol").addEventListener("click", () => {
    if (currentSong.muted == true) {
      currentSong.muted = false;
      vol.src = "svg/volume.svg";
      document.querySelector(".vol-ctrl").style.left =
        currentSong.volume * 100 + "%";
      document.querySelector(".seek-vol-fill").style.width =
        currentSong.volume * 100 + "%";
    } else {
      currentSong.muted = true;
      vol.src = "svg/mute.svg";
    }
  });
}

main();
