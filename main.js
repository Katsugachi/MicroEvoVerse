const canvas = document.getElementById("ecosystem");
const ctx = canvas.getContext("2d");

let paused = true;
let mutationRate = 0.005;
let cycle = 0;
let season = 0;
let weather = 'clear';

const statsEl = document.getElementById('stats');
document.getElementById('toggle').onclick = () => paused = !paused;
document.getElementById('mutateSlider').oninput = (e) => mutationRate = parseFloat(e.target.value);
document.getElementById('respawn').onclick = () => {
  creatures = Array.from({ length: 100 }, () => new Creature());
};

document.getElementById('startSim').onclick = () => {
  paused = false;
  tick();
};

// 🧠 Creature Class
class Creature {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = 4 + Math.random() * 4;
    this.speed = 0.5 + Math.random();
    this.color = `hsl(${Math.random() * 360}, 70%, 60%)`;
    this.brain = {
      social: Math.random(),
      shy: Math.random(),
    };
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
      this.x += (this.target.x - this.x) * 0.01;
      this.y += (this.target.y - this.y) * 0.01;
    }

    let climateFactor = 1;
    if (season === 3) climateFactor = 0.5;
    if (weather === 'drought') climateFactor *= 0.7;
    if (weather === 'windy') climateFactor *= 1.3;

    this.x += (Math.random() - 0.5) * this.speed * climateFactor;
    this.y += (Math.random() - 0.5) * this.speed * climateFactor;
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

let creatures = Array.from({ length: 100 }, () => new Creature());

// 🌤️ Terrain & Season Effects
function drawEnvironment() {
  const seasonColors = ['#2e8b57', '#f4e664', '#c85d32', '#dfefff'];
  ctx.fillStyle = seasonColors[season];
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (weather === 'rain' || weather === 'snow' || weather === 'clear') {
    ctx.fillStyle =
      weather === 'rain' ? 'rgba(0,255,255,0.2)' :
      weather === 'snow' ? 'rgba(255,255,255,0.2)' :
      'rgba(255,255,153,0.2)';

    for (let i = 0; i < 80; i++) {
      let x = Math.random() * canvas.width;
      let y = (cycle * 2 + i * 20) % canvas.height;
      ctx.beginPath();
      ctx.arc(x, y, weather === 'snow' ? 2 : 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ⏱️ Weather & Season Logic
function updateSeason(cycle) {
  season = Math.floor((cycle / 600) % 4);
  const weatherOptions = ['rain', 'clear', 'windy', 'drought', 'snow'];
  weather = weatherOptions[Math.floor(Math.sin(cycle / 100) * 2 + 2)];

  const seasonIcons = ['🌱', '☀️', '🍂', '❄️'];
  const weatherIcons = {
    rain: '🌧️', clear: '☀️', windy: '💨', drought: '🔥', snow: '❄️'
  };

  statsEl.textContent = `Season: ${seasonIcons[season]} | Weather: ${weatherIcons[weather]} | Creatures: ${creatures.length}`;
}

// 🔁 Main Loop
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
