const canvas = document.getElementById("ecosystem");
const ctx = canvas.getContext("2d");

let paused = false;
let mutationRate = 0.005;
let cycle = 0;
let season = 0;
let weather = 'clear';

const statsEl = document.getElementById('stats');
document.getElementById('toggle').onclick = () => (paused = !paused);
document.getElementById('mutateSlider').oninput = (e) => mutationRate = parseFloat(e.target.value);
document.getElementById('respawn').onclick = () => {
  creatures = Array.from({ length: 100 }, () => new Creature());
};

// 🧬 Creature Class
class Creature {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = 4 + Math.random() * 4;
    this.speed = 0.5 + Math.random();
    this.color = `hsl(${Math.random() * 360}, 70%, 60%)`;
  }

  move() {
    this.x += (Math.random() - 0.5) * this.speed * (weather === 'windy' ? 2 : 1);
    this.y += (Math.random() - 0.5) * this.speed;
    this.x = Math.max(0, Math.min(canvas.width, this.x));
    this.y = Math.max(0, Math.min(canvas.height, this.y));
  }

  mutate() {
    this.size += (Math.random() - 0.5) * 1;
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

// 🌦️ Season & Weather Update
function updateSeason(cycle) {
  season = Math.floor((cycle / 600) % 4);
  const options = ['rain', 'clear', 'windy', 'drought'];
  weather = options[Math.floor(Math.sin(cycle / 100) * 2 + 2)];
  const seasonIcons = ['🌱', '☀️', '🍂', '❄️'];
  const weatherIcons = {
    rain: '🌧️', clear: '☀️', windy: '💨', drought: '🔥'
  };
  statsEl.textContent = `Season: ${seasonIcons[season]} | Weather: ${weatherIcons[weather]} | Creatures: ${creatures.length}`;
}

// 🔁 Simulation Loop
function tick() {
  if (!paused) {
    cycle++;
    updateSeason(cycle);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let creature of creatures) {
      creature.move();
      if (Math.random() < mutationRate + 0.001 * season) creature.mutate();
      creature.draw();
    }
  }

  requestAnimationFrame(tick);
}

tick();

