// 🌱 Global Simulation Variables
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

const seasonNames = ["Spring", "Summer", "Autumn", "Winter"];

// 🎨 Canvas Setup
const canvas = document.getElementById("simulationCanvas");
const ctx = canvas.getContext("2d");

// 📊 DOM Elements
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

const govTypeEl = document.getElementById("governmentType");
const leaderCountEl = document.getElementById("leaderCount");
const workerCountEl = document.getElementById("workerCount");
const eliteCountEl = document.getElementById("eliteCount");

// 🎛️ Configuration Inputs
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

// 🚀 Simulation Controls
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

// 🔁 Simulation Loop
function simulationLoop() {
  if (!isRunning) return;

  tick++;
  if (tick % Math.floor(seasonFrequency / seasonRate) === 0) changeSeason();

  updateCreatures();
  assignGovernments();
  updateStats();
  drawSimulation();
  updateSharedStats();

  requestAnimationFrame(simulationLoop);
}

// 🌦️ Season Cycle
function changeSeason() {
  const i = seasonNames.indexOf(currentSeason);
  currentSeason = seasonNames[(i + 1) % seasonNames.length];
  currentSeasonEl.textContent = currentSeason;
}

// 🧪 Creature Blueprint
function createCreature(parentA = null, parentB = null) {
  const base = {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    speed: 2 + Math.random() * 3,
    size: 5 + Math.random() * 5,
    lifespan: 1000 + Math.random() * 2000,
    sense: 50 + Math.random() * 100
  };

  // Inherit if parents exist
  if (parentA && parentB) {
    base.speed = averageTrait(parentA.speed, parentB.speed, "speed");
    base.size = averageTrait(parentA.size, parentB.size, "size");
    base.lifespan = averageTrait(parentA.lifespan, parentB.lifespan, "lifespan");
    base.sense = averageTrait(parentA.sense, parentB.sense, "sense");
  }

  return {
    ...base,
    age: 0,
    direction: Math.random() * 2 * Math.PI,
    memory: [],
    disposition: Math.random() < 0.5 ? "friendly" : "aggressive",
    socialClass: "worker",
    government: "tribal",
    mate: null
  };
}

function averageTrait(a, b, key) {
  let value = (a + b) / 2;
  if (Math.random() < mutationRate) {
    value += (Math.random() - 0.5) * value * 0.2;
  }
  return Math.max(1, value);
}

// 🧠 Creature Update
function updateCreatures() {
  if (creatures.length < 30) creatures.push(createCreature());

  creatures.forEach(c => {
    c.age += 1;
    if (c.age > c.lifespan) {
      deathCount++;
      c.dead = true;
      return;
    }

    const targetX = canvas.width / 2;
    const targetY = canvas.height / 2;

    const dx = targetX - c.x;
    const dy = targetY - c.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < c.sense) {
      c.direction = Math.atan2(dy, dx);
    }

    c.x += Math.cos(c.direction) * c.speed;
    c.y += Math.sin(c.direction) * c.speed;

    c.x = Math.max(0, Math.min(canvas.width, c.x));
    c.y = Math.max(0, Math.min(canvas.height, c.y));

    tryMating(c);
  });

  creatures = creatures.filter(c => !c.dead);
}

// 💘 Mating System
function tryMating(creature) {
  if (creature.mate || creature.disposition === "aggressive") return;

  const nearby = creatures.find(other =>
    other !== creature &&
    !other.mate &&
    distance(creature, other) < creature.sense / 2 &&
    Math.abs(creature.size - other.size) < 2
  );

  if (nearby && Math.random() < 0.05) {
    creature.mate = nearby;
    nearby.mate = creature;

    birthCount++;
    creatures.push(createCreature(creature, nearby));
    creature.memory.push({ tick, event: "mated", id: nearby.id });
    nearby.memory.push({ tick, event: "mated", id: creature.id });
  }
}

function distance(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

// 🏛️ Governance Logic
function assignGovernments() {
  const elite = [];
  const leaders = [];
  const workers = [];

  creatures.forEach(c => {
    if (c.size > 8 && c.speed < 3) {
      c.socialClass = "leader";
      c.government = "democratic";
      leaders.push(c);
    } else if (c.speed > 4) {
      c.socialClass = "elite";
      c.government = "tribal";
      elite.push(c);
    } else {
      c.socialClass = "worker";
      workers.push(c);
    }
  });

  govTypeEl.textContent = dominantGovernment();
  leaderCountEl.textContent = leaders.length;
  workerCountEl.textContent = workers.length;
  eliteCountEl.textContent = elite.length;
}

function dominantGovernment() {
  const counts = { tribal: 0, democratic: 0, authoritarian: 0 };
  creatures.forEach(c => counts[c.government]++);
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

// 🌩️ Disaster Response
function triggerDisaster(type) {
  creatures.forEach(c => {
    if (type === "fire" && c.size < 7) c.lifespan -= 300;
    else if (type === "quake") {
      c.x += Math.random() * 30 - 15;
      c.y += Math.random() * 30 - 15;
    } else if (type === "flood" && c.speed < 3) c.dead = true;
    else if (type === "drought") foodLevel -= 50;
    else if (type === "plague") {
      if (Math.random() < 0.2) c.dead = true;
    }
  });
}

// 🎯 Stat Updates
function updateStats() {
  creatureCountEl.textContent = creatures.length;
  birthEl.textContent = birthCount;
  deathEl.textContent = deathCount;
  foodEl.textContent = Math.max(0, Math.round(foodLevel));
}

// 📊 Shared Stats for Graph Page
function updateSharedStats() {
  const liveTraits = {
    population: creatures.length,
    speed: avgTrait("speed"),
    size: avgTrait("size"),
    lifespan: avgTrait("lifespan"),
    sense: avgTrait("sense"),
    mutationRate,
    season: currentSeason,
    births: birthCount,
    deaths: deathCount,
    food: Math.max(0, Math.round(foodLevel))
  };

  localStorage.setItem("microEvoStats", JSON.stringify(liveTraits));
}

function avgTrait(key) {
  if (creatures.length === 0) return 0;
  const total = creatures.reduce((sum, c) => sum + (c[key] || 0), 0);
  return parseFloat((total / creatures.length).toFixed(2));
}
