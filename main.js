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

const canvas = document.getElementById("simulationCanvas");
const ctx = canvas.getContext("2d");

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
  if (tick % Math.floor(seasonFrequency / seasonRate) === 0) changeSeason();

  updateCreatures();
  assignGovernments();
  updateStats();
  drawSimulation();
  updateSharedStats();

  requestAnimationFrame(simulationLoop);
}

function changeSeason() {
  const i = seasonNames.indexOf(currentSeason);
  currentSeason = seasonNames[(i + 1) % seasonNames.length];
  currentSeasonEl.textContent = currentSeason;
}

function createCreature(parentA = null, parentB = null) {
  const base = {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    speed: 2 + Math.random() * 3,
    size: 5 + Math.random() * 5,
    lifespan: 1000 + Math.random() * 2000,
    sense: 50 + Math.random() * 100
  };

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

function updateCreatures(creature) {
  const nearestFood = findNearestFood(creature);

  if (nearestFood) {
    const dx = nearestFood.x - creature.x;
    const dy = nearestFood.y - creature.y;
    const angle = Math.atan2(dy, dx);

    // Move toward food
    creature.x += Math.cos(angle) * creature.speed;
    creature.y += Math.sin(angle) * creature.speed;

    // Eat if close
    if (Math.hypot(dx, dy) < creature.size) {
      creature.energy += nearestFood.energy;
      food.splice(food.indexOf(nearestFood), 1);
    }
  } else {
    // Wander — keeps things lively
    creature.direction += (Math.random() - 0.5) * 0.4;
    creature.x += Math.cos(creature.direction) * creature.speed;
    creature.y += Math.sin(creature.direction) * creature.speed;
  }

  // Decay over time — must keep eating
  creature.energy -= 0.05;
  creature.age++;

  if (creature.energy <= 0) {
    creatures.splice(creatures.indexOf(creature), 1); // RIP
  }
}


function findTarget(creature) {
  let nearby = creatures.filter(other => {
    if (other === creature || other.dead) return false;
    return distance(creature, other) < creature.sense;
  });

  let mate = nearby.find(o => canMate(creature, o));
  if (mate) return mate;

  let leader = nearby.find(o => o.socialClass === "leader");
  if (leader) return leader;

  if (foodLevel > 0) return { x: canvas.width / 2, y: canvas.height / 2 };

  return null;
}

function canMate(a, b) {
  return !a.mate && !b.mate &&
         a.disposition === "friendly" &&
         Math.abs(a.size - b.size) < 2 &&
         Math.abs(a.speed - b.speed) < 2;
}

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
      c.government = "tribal";
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

function updateStats() {
  creatureCountEl.textContent = creatures.length;
  birthEl.textContent = birthCount;
  deathEl.textContent = deathCount;
  foodEl.textContent = Math.max(0, Math.round(foodLevel));
}

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

function evolveCreature(creature) {
  if (tick % 500 === 0) {
    creature.speed += 0.1;
    creature.stealth += 0.1;
    // Maybe shift government preference or language lexicon
  }
}

function applyRepulsion(creature) {
  for (const other of creatures) {
    if (creature === other) continue;
    const dx = creature.x - other.x;
    const dy = creature.y - other.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 40) {
      creature.x += dx * 0.02;
      creature.y += dy * 0.02;
    }
  }
}  

function spawnFood(count) {
  for (let i = 0; i < count; i++) {
    food.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      energy: 10 + Math.random() * 5
    });
  }
}


function checkInteractions(creature) {
  if (creature.interactionCooldown > 0) {
    creature.interactionCooldown--;
    return;
  }

  for (const other of creatures) {
    if (creature === other || other.isInteracting) continue;
    const dx = other.x - creature.x;
    const dy = other.y - creature.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 60 && Math.random() < 0.02) {
      creature.isInteracting = true;
      other.isInteracting = true;

      creature.emotion = "excited";
      other.emotion = "excited";

      creature.interactionCooldown = 30;
      other.interactionCooldown = 30;

      // Optional: slight bounce away
      creature.x -= dx * 0.1;
      creature.y -= dy * 0.1;
    }
  }

  if (creature.interactionCooldown === 0) {
    creature.isInteracting = false;
    if (creature.interactionCooldown === 0 && creature.isInteracting === true) {
  creature.speed += 0.5;
  creature.isInteracting = false;
}

  }
}
function drawSimulation() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  creatures.forEach(c => {
    if (c.socialClass === "leader") ctx.fillStyle = "gold";
    else if (c.socialClass === "elite") ctx.fillStyle = "silver";
    else ctx.fillStyle = "green";

    ctx.beginPath();
    ctx.arc(c.x, c.y, c.size, 0, 2 * Math.PI);
    ctx.fill();

    // Optional direction line
    ctx.strokeStyle = "black";
    ctx.beginPath();
    ctx.moveTo(c.x, c.y);
    ctx.lineTo(c.x + Math.cos(c.direction) * c.size * 2, c.y + Math.sin(c.direction) * c.size * 2);
    ctx.stroke();
  });
}
