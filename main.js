// 🌿 Simulation State
let creatures = [];
let isRunning = false;
let mutationRate = 0.05;
let seasonFrequency = 1200;
let seasonRate = 5;

let birthCount = 0;
let deathCount = 0;
let foodLevel = 200;
let currentSeason = "Spring";

let tick = 0;
let seasonNames = ["Spring", "Summer", "Autumn", "Winter"];

// 🎛️ DOM Elements
const creatureCountEl = document.getElementById("creatureCount");
const mutationSlider = document.getElementById("mutationSlider");
const seasonSlider = document.getElementById("seasonSlider");
const seasonRateSlider = document.getElementById("seasonRateSlider");

const mutationDisplay = document.getElementById("mutationDisplay");
const seasonDisplay = document.getElementById("seasonDisplay");
const seasonRateDisplay = document.getElementById("seasonRateDisplay");

const currentSeasonEl = document.getElementById("currentSeason");
const birthEl = document.getElementById("birthCount");
const deathEl = document.getElementById("deathCount");
const foodEl = document.getElementById("foodLevel");

// 🖼️ Canvas Setup
const canvas = document.getElementById("simulationCanvas");
const ctx = canvas.getContext("2d");

// 🔄 Event Listeners for Sliders
mutationSlider.addEventListener("input", () => {
  mutationRate = parseFloat(mutationSlider.value);
  mutationDisplay.textContent = mutationRate.toFixed(2);
});

seasonSlider.addEventListener("input", () => {
  seasonFrequency = parseInt(seasonSlider.value);
  seasonDisplay.textContent = seasonFrequency;
});

seasonRateSlider.addEventListener("input", () => {
  seasonRate = parseInt(seasonRateSlider.value);
  seasonRateDisplay.textContent = seasonRate;
});

// 🧪 Simulation Control Functions
function startSimulation() {
  if (!isRunning) {
    isRunning = true;
    requestAnimationFrame(simulationLoop);
  }
}

function pauseSimulation() {
  isRunning = false;
}

function resetSimulation() {
  isRunning = false;
  tick = 0;
  birthCount = 0;
  deathCount = 0;
  foodLevel = 200;
  creatures = [];
  updateStats();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function simulationLoop() {
  if (!isRunning) return;

  tick++;
  if (tick % (seasonFrequency / seasonRate) === 0) {
    changeSeason();
  }

  updateCreatures();
  updateStats();
  drawSimulation();

  requestAnimationFrame(simulationLoop);
}

// 🌦️ Change Season
function changeSeason() {
  const index = seasonNames.indexOf(currentSeason);
  currentSeason = seasonNames[(index + 1) % seasonNames.length];
  currentSeasonEl.textContent = currentSeason;
}

// 🧬 Creature Update Placeholder
function updateCreatures() {
  // Example logic: spawn, mutate, die — replace with real logic
  if (Math.random() < 0.01) {
    creatures.push({});
    birthCount++;
  }

  if (creatures.length > 0 && Math.random() < 0.005) {
    creatures.pop();
    deathCount++;
  }

  foodLevel += (Math.random() * 10 - 5);
  foodLevel = Math.max(0, Math.round(foodLevel));
}

// 📊 Update Stats Display
function updateStats() {
  creatureCountEl.textContent = creatures.length;
  birthEl.textContent = birthCount;
  deathEl.textContent = deathCount;
  foodEl.textContent = foodLevel;
}

// 🎨 Draw Creatures (placeholder)
function drawSimulation() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  creatures.forEach((c, i) => {
    ctx.fillStyle = "green";
    ctx.beginPath();
    ctx.arc(100 + i * 10 % canvas.width, 100 + Math.sin(i + tick / 50) * 20, 5, 0, 2 * Math.PI);
    ctx.fill();
  });
}
