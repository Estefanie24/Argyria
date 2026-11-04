let audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function playCrystalNote(freq, type = 'sine', duration = 0.5) {
  initAudio();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

  gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
  constructor() {
    this.reset();
  }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 0.5;
    this.speedY = Math.random() * -0.5 - 0.1;
    this.opacity = Math.random() * 0.5 + 0.2;
  }
  update() {
    this.y += this.speedY;
    if (this.y < 0) this.reset();
  }
  draw() {
    ctx.fillStyle = `rgba(0, 240, 255, ${this.opacity})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

for (let i = 0; i < 40; i++) particles.push(new Particle());

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(animateParticles);
}
animateParticles();

const navBtns = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.mode-section');

navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    navBtns.forEach(b => b.classList.remove('active'));
    sections.forEach(s => s.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`${btn.dataset.tab}-mode`).classList.add('active');
  });
});

// Mode 1: Breathing & Concentration Anchor
const breathNode = document.getElementById('breath-node');
const breathInstruction = document.getElementById('breath-instruction');
const focusScoreEl = document.getElementById('focus-score');

let holdTimer = null;
let focusScore = 0;

function startHold() {
  initAudio();
  breathNode.classList.add('holding');
  breathInstruction.innerText = "Holding attention... Breathe deeply.";
  playCrystalNote(261.63, 'sine', 2.0);

  holdTimer = setInterval(() => {
    focusScore += 10;
    focusScoreEl.innerText = focusScore;
  }, 200);
}

function endHold() {
  breathNode.classList.remove('holding');
  breathInstruction.innerText = "Tap and hold as long as necessary to anchor your attention.";
  clearInterval(holdTimer);
}

breathNode.addEventListener('mousedown', startHold);
breathNode.addEventListener('mouseup', endHold);
breathNode.addEventListener('touchstart', (e) => { e.preventDefault(); startHold(); });
breathNode.addEventListener('touchend', endHold);

// Mode 2: Grid Memory Sequence Controls
const crystalBtns = document.querySelectorAll('.crystal-btn');
const startMemBtn = document.getElementById('start-memory-btn');
const pauseMemBtn = document.getElementById('pause-memory-btn');
const stopMemBtn = document.getElementById('stop-memory-btn');
const memStatus = document.getElementById('memory-status');

const freqs = [329.63, 392.00, 440.00, 523.25];
let sequence = [];
let playerStep = 0;
let isPlayingSeq = false;
let isPaused = false;
let seqTimeout = null;
let seqInterval = null;

function flashCrystal(id) {
  crystalBtns[id].classList.add('active');
  playCrystalNote(freqs[id], 'triangle', 0.4);
  setTimeout(() => crystalBtns[id].classList.remove('active'), 300);
}

function playSequence() {
  if (isPaused) return;
  isPlayingSeq = true;
  playerStep = 0;
  memStatus.innerText = "Observe Sequence...";
  let i = 0;

  seqInterval = setInterval(() => {
    if (isPaused) return;
    if (sequence.length === 0) {
      clearInterval(seqInterval);
      return;
    }
    flashCrystal(sequence[i]);
    i++;
    if (i >= sequence.length) {
      clearInterval(seqInterval);
      seqInterval = null;
      seqTimeout = setTimeout(() => {
        if (sequence.length > 0) {
          isPlayingSeq = false;
          memStatus.innerText = "Repeat the Pattern!";
        }
      }, 400);
    }
  }, 600);
}

startMemBtn.addEventListener('click', () => {
  if (isPaused) {
    isPaused = false;
    pauseMemBtn.innerText = "Pause";
    memStatus.innerText = "Resuming... Repeat the Pattern!";
    return;
  }
  sequence = [Math.floor(Math.random() * 4)];
  isPaused = false;
  startMemBtn.disabled = true;
  pauseMemBtn.disabled = false;
  stopMemBtn.disabled = false;
  pauseMemBtn.innerText = "Pause";
  playSequence();
});

pauseMemBtn.addEventListener('click', () => {
  if (!sequence.length) return;
  isPaused = !isPaused;
  if (isPaused) {
    if (seqInterval) clearInterval(seqInterval);
    if (seqTimeout) clearTimeout(seqTimeout);
    isPlayingSeq = false;
    pauseMemBtn.innerText = "Resume";
    memStatus.innerText = "Sequence Paused";
  } else {
    pauseMemBtn.innerText = "Pause";
    memStatus.innerText = "Resuming...";
    setTimeout(playSequence, 500);
  }
});

stopMemBtn.addEventListener('click', () => {
  if (seqInterval) {
    clearInterval(seqInterval);
    seqInterval = null;
  }
  if (seqTimeout) {
    clearTimeout(seqTimeout);
    seqTimeout = null;
  }
  sequence = [];
  playerStep = 0;
  isPlayingSeq = false;
  isPaused = false;
  
  crystalBtns.forEach(btn => btn.classList.remove('active'));
  
  startMemBtn.disabled = false;
  pauseMemBtn.disabled = true;
  stopMemBtn.disabled = true;
  pauseMemBtn.innerText = "Pause";
  memStatus.innerText = "Game Stopped. Press Start to Begin.";
});

crystalBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    if (isPlayingSeq || isPaused || sequence.length === 0) return;
    const id = parseInt(btn.dataset.id);
    flashCrystal(id);

    if (id === sequence[playerStep]) {
      playerStep++;
      if (playerStep === sequence.length) {
        memStatus.innerText = "Correct! Advancing...";
        sequence.push(Math.floor(Math.random() * 4));
        seqTimeout = setTimeout(playSequence, 1000);
      }
    } else {
      memStatus.innerText = "Try Again! Press Start.";
      sequence = [];
      startMemBtn.disabled = false;
      pauseMemBtn.disabled = true;
      stopMemBtn.disabled = true;
    }
  });
});

// Mode 3: Ambient Resonance
let droneOsc = null;
let droneGain = null;
let chimesInterval = null;

const toggleDroneBtn = document.getElementById('toggle-drone');
const toggleChimesBtn = document.getElementById('toggle-chimes');

toggleDroneBtn.addEventListener('click', () => {
  initAudio();
  if (droneOsc) {
    droneGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1);
    setTimeout(() => { droneOsc.stop(); droneOsc = null; }, 1000);
    toggleDroneBtn.classList.remove('active');
  } else {
    droneOsc = audioCtx.createOscillator();
    droneGain = audioCtx.createGain();
    droneOsc.frequency.setValueAtTime(432, audioCtx.currentTime);
    droneOsc.type = 'sine';
    droneGain.gain.setValueAtTime(0.01, audioCtx.currentTime);
    droneGain.gain.exponentialRampToValueAtTime(0.15, audioCtx.currentTime + 2);
    droneOsc.connect(droneGain);
    droneGain.connect(audioCtx.destination);
    droneOsc.start();
    toggleDroneBtn.classList.add('active');
  }
});

toggleChimesBtn.addEventListener('click', () => {
  initAudio();
  if (chimesInterval) {
    clearInterval(chimesInterval);
    chimesInterval = null;
    toggleChimesBtn.classList.remove('active');
  } else {
    toggleChimesBtn.classList.add('active');
    chimesInterval = setInterval(() => {
      const randomFreq = freqs[Math.floor(Math.random() * freqs.length)] * 2;
      playCrystalNote(randomFreq, 'sine', 1.5);
    }, 1200);
  }
});
