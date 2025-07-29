const canvas = document.getElementById("ecosystem");
const ctx = canvas.getContext("2d");

let paused = true;
let mutationRate = 0.005;
let seasonFrequency = 600;
let weatherChaos = 2;
let creatureCount = 100;
let cycle = 0;
let season = 0;
let weather = 'clear';

const statsEl = document.getElementById('stats');

document.getElementById("startSim").onclick = () => {
  paused = false;
  tick();
};

document.getElementById("toggle").onclick = () => paused = !paused;
document.getElementById("mutateSlider").oninput = e => mutationRate = parseFloat(e.target.value);
document.getElementById("seasonSpeed").oninput = e => seasonFrequency = parseInt(e.target.value);
document.getElementById("weatherChaos").oninput = e => weatherChaos = parseInt(e.target.value);
document.getElementById("creatureCount").oninput = e => {
  creatureCount = parseInt(e.target.value);
  creatures = Array.from({ length: creatureCount }, () => new Creature());
};
document.getElementById("respawn").onclick = () => {
  creatures = Array.from({ length: creatureCount }, () => new Creature());
};

// 🧬 Intelligent Creature Class
class Creature {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = 4 + Math.random() * 4;
    this.speed = 0.5 + Math.random();
    this.color = `hsl(${Math.random() * 360}, 70%, 60%)`;
    this.goal = { x: Math.random() * canvas.width, y: Math.random() * canvas.height };
    this.brain = { social: Math.random(), shy: Math.random() };
    this.target = null;
  }

  updateTarget(creatures) {
    const nearby = creatures.filter(c =>
      c !== this &&
      Math.hypot(c.x - this.x, c.y - this.y) < 50
    );
    if (nearby.length && this.brain.social > 0.5) {
      this.target = nearby[0];
    } else if (nearby.length && this.brain.shy > 0.5) {
      let dx = this.x - nearby[0].x;
      let dy = this.y - nearby[0].y;
      this.x += dx * 0.05;
      this.y += dy * 0.05;
    } else {
      this.target = null;
    }
  }

  move(creatures) {
    this.updateTarget(creatures);
    if (this.target) {
      this.goal = { x: this.target.x, y: this.target.y };
    } else if (Math.random() < 0.01) {
      this.goal.x = Math.random() * canvas.width;
      this.goal.y = Math.random() * canvas.height;
    }

    let dx = this.goal.x - this.x;
    let dy = this.goal.y - this.y;
    let dist = Math.hypot(dx, dy);
    if (dist > 1) {
      let climateFactor = 1;
      if (season === 3) climateFactor = 0.5;
      if (weather === 'drought') climateFactor *= 0.7;
      if (weather === 'windy') climateFactor *= 1.3;
      this.x += (dx / dist) * this.speed * climateFactor;
      this.y += (dy / dist) * this.speed * climateFactor;
    }

    this.x = Math.max(0, Math.min(canvas.width, this.x));
    this.y = Math.max(0, Math.min(canvas.height, this.y));
  }

  mutate() {
    this.size += (Math.random() - 0.5);
    this.speed += (Math.random() - 0.5) * 0.1;
    this.color = `hsl(${Math.random() * 360}, 70%, 60%)`;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

let creatures = Array.from({ length: creatureCount }, () => new Creature());

function drawEnvironment() {
  const seasonColors = ['#2e8b57', '#f4e664', '#c85d32', '#dfefff'];
  ctx.fillStyle = seasonColors[season];
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle =
    weather === 'rain' ? 'rgba(0,255,255,0.2)' :
    weather === 'snow' ? 'rgba(255,255,255,0.2)' :
    weather === 'clear' ? 'rgba(255,255,153,0.2)' : null;

  if (ctx.fillStyle) {
    for (let i = 0; i < 80; i++) {
      let x = Math.random() * canvas.width;
      let y = (cycle * 2 + i * 20) % canvas.height;
      ctx.beginPath();
      ctx.arc(x, y, weather === 'snow' ? 2 : 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function updateSeason(cycle) {
  season = Math.floor((cycle / seasonFrequency) % 4);
  const options = ['rain', 'clear', 'windy', 'drought', 'snow'];
  const chaosShift = Math.floor(Math.sin(cycle / 100) * weatherChaos + weatherChaos);
  weather = options[chaosShift % options.length];

  const seasonIcons = ['🌱', '☀️', '🍂', '❄️'];
  const weatherIcons = {
    rain: '🌧️', clear: '☀️', windy: '💨', drought: '🔥', snow: '❄️'
  };

  statsEl.textContent = `Season: ${seasonIcons[season]} | Weather: ${weatherIcons[weather]} | Creatures: ${creatures.length}`;
}

function tick() {
  if (!paused) {
    cycle++;
    updateSeason(cycle);
    drawEnvironment();

    for (let creature of creatures) {
      creature.move(creatures);
      if (Math.random() < mutationRate + 0.001 * season) creature.mutate();
      creature.draw();
    }
  }
  requestAnimationFrame(tick);
}
