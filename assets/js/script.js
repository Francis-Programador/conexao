document.addEventListener('DOMContentLoaded', () => {
  const loader = document.getElementById('loader');
  const particles = document.getElementById('particle-bg');
  setTimeout(() => loader.classList.add('hidden'), 650);
  generateParticles(particles, 18);
});

function generateParticles(container, amount) {
  for (let i = 0; i < amount; i += 1) {
    const dot = document.createElement('div');
    dot.className = 'particle';
    const size = Math.random() * 4 + 3;
    dot.style.width = `${size}px`;
    dot.style.height = `${size}px`;
    dot.style.top = `${Math.random() * 100}%`;
    dot.style.left = `${Math.random() * 100}%`;
    dot.style.animationDuration = `${Math.random() * 18 + 12}s`;
    dot.style.opacity = `${Math.random() * 0.6 + 0.2}`;
    container.appendChild(dot);
  }
}

// ===============================
// YOUTUBE API CONFIG
// ===============================

const API_KEY = "AIzaSyAy8xb2BgIBNji8Oa98yzWp3wnwysqbuDg";

const CHANNEL_ID =
  "UCkBHzT6S1A2_QKj0Gh0hj_g";


// ===============================
// FORMATAR NÚMEROS
// ===============================

function formatNumber(num){

  num = Number(num);

  if(num >= 1000000){
    return (num / 1000000)
      .toFixed(1)
      .replace(".0","") + "M";
  }

  if(num >= 1000){
    return (num / 1000)
      .toFixed(1)
      .replace(".0","") + "K";
  }

  return num;

}


// ===============================
// CARREGAR STATS YOUTUBE
// ===============================

async function loadYouTubeStats(){

  try{

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${CHANNEL_ID}&key=${API_KEY}`
    );

    const data = await response.json();

    console.log("YouTube API:", data);

    // segurança
    if(!data.items || !data.items.length){
      console.log("Canal não encontrado");
      return;
    }

    const stats =
      data.items[0].statistics;

    const subscribers =
      stats.subscriberCount;

    const views =
      stats.viewCount;

    const videos =
      stats.videoCount;

    // atualizar HTML
    document.getElementById("yt-subs").innerText =
      formatNumber(subscribers);

    document.getElementById("yt-views").innerText =
      formatNumber(views);

    document.getElementById("yt-videos").innerText =
      formatNumber(videos);

  }

  catch(error){

    console.log(
      "Erro YouTube API:",
      error
    );

  }

}


// ===============================
// LOADER
// ===============================

window.addEventListener("load", () => {

  const loader =
    document.getElementById("loader");

  setTimeout(() => {

    loader.classList.add("hidden");

  }, 900);

});


// ===============================
// PARTICLES BG
// ===============================

const particleBg =
  document.getElementById("particle-bg");

if(particleBg){

  for(let i = 0; i < 22; i++){

    const particle =
      document.createElement("div");

    particle.classList.add("particle");

    const size =
      Math.random() * 8 + 4;

    particle.style.width =
      `${size}px`;

    particle.style.height =
      `${size}px`;

    particle.style.left =
      `${Math.random() * 100}%`;

    particle.style.top =
      `${Math.random() * 100}%`;

    particle.style.animationDuration =
      `${10 + Math.random() * 20}s`;

    particle.style.opacity =
      Math.random();

    particleBg.appendChild(particle);

  }

}


// ===============================
// START
// ===============================

loadYouTubeStats();