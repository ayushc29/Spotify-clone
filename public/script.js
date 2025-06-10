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
  let a = await fetch(`${folder}/`);
  let response = await a.text();

  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];

  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      // Use decodeURIComponent for better space handling
      songs.push(decodeURIComponent(element.href.split(`${folder}/`)[1]));
    }
  }

  let songUL = document.querySelector(".lib-songs").getElementsByTagName("ul")[0];
  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML += `
      <li>
        <img class="invert" src="svg/music.svg" alt="">
        <div class="info">
          <div>${song}</div>
          <div>Ayush</div>
        </div>
        <div class="play">
          <img id="playbtn" class="invert" src="svg/play.svg" alt="">
        </div>       
      </li>
    `;
  }

  // Attach event listener to each song
  Array.from(document.querySelector(".lib-songs").getElementsByTagName("li")).forEach((element, index) => {
    element.addEventListener("click", () => {
      playMusic(songs[index]);
    });
  });

  return songs;
}

const playMusic = (track, pause = false) => {
  currentSong.src = `${currFolder}/${track}`;
  if (!pause) {
    currentSong.play();
    play.src = "svg/pause.svg";
  }
  document.querySelector(".vol-ctrl").style.left = currentSong.volume * 100 + "%";
  document.querySelector(".seek-vol-fill").style.width = currentSong.volume * 100 + "%";
  document.querySelector(".song-info").innerHTML = track;
  document.querySelector(".song-time").innerHTML = "00:00";
  document.querySelector(".song-duration").innerHTML = "00:00";
};

async function displayAlbums() {
  let a = await fetch(`/public/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anc = div.getElementsByTagName("a");

  let cardContainer = document.querySelector(".card-container");

  let array = Array.from(anc);
  for (let index = 0; index < anc.length; index++) {
    const e = array[index];
    if (e.href.includes("/public/songs")) {
      // Extract folder name
      let folderName = e.href.split("/").slice(-2)[0];

      // Fetch info.json for folder metadata
      let a = await fetch(`/public/songs/${folderName}/info.json`);
      let response = await a.json();

      cardContainer.innerHTML += `
        <div data-folder="/public/songs/${folderName}" class="card">
          <div class="play-btn">
            <img src="svg/play.svg" alt="" />
          </div>
          <img src="/public/songs/${folderName}/cover.jpeg" alt=""/>
          <h2>${response.title}</h2>
          <p>${response.description}</p>
        </div>`;
    }
  }

  // Add click event on each card to load songs
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (event) => {
      const folder = event.currentTarget.dataset.folder;
      songs = await getSongs(folder);
      playMusic(songs[0]);
    });
  });
}

async function main() {
  // Initialize with default folder
  await getSongs("/public/songs/ncs");
  playMusic(songs[0], true);

  await displayAlbums();

  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "svg/pause.svg";
    } else {
      currentSong.pause();
      play.src = "svg/play.svg";
    }
  });

  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".song-time").innerHTML = secToMinSec(currentSong.currentTime);
    document.querySelector(".song-duration").innerHTML = secToMinSec(currentSong.duration);
    document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    document.querySelector(".seek-fill").style.width = (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

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
    document.querySelector(".left").style.left = "-100%";
  });

  previous.addEventListener("click", () => {
    let currentTrack = decodeURIComponent(currentSong.src.split("/").slice(-1)[0]);
    let index = songs.indexOf(currentTrack);
    if (index > 0) {
      playMusic(songs[index - 1]);
    } else {
      currentSong.currentTime = 0;
      currentSong.play();
    }
  });

  next.addEventListener("click", () => {
    let currentTrack = decodeURIComponent(currentSong.src.split("/").slice(-1)[0]);
    let index = songs.indexOf(currentTrack) + 1;
    if (index < songs.length) {
      playMusic(songs[index]);
    } else {
      playMusic(songs[0]);
    }
  });

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
    vol.src = currentSong.volume === 0 ? "svg/mute.svg" : "svg/volume.svg";
  });

  document.querySelector("#vol").addEventListener("click", () => {
    if (currentSong.muted) {
      currentSong.muted = false;
      vol.src = "svg/volume.svg";
      document.querySelector(".vol-ctrl").style.left = currentSong.volume * 100 + "%";
      document.querySelector(".seek-vol-fill").style.width = currentSong.volume * 100 + "%";
    } else {
      currentSong.muted = true;
      vol.src = "svg/mute.svg";
    }
  });
}

main();