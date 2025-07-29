const canvas = document.getElementById('ecosystem');
const ctx = canvas.getContext('2d');
const WIDTH = canvas.width;
const HEIGHT = canvas.height;

let cycle = 0;
let season = 0;
let weather = 'clear';

// Biome map using random elevation
let terrain = Array.from({ length: WIDTH }, (_, x) =>
  Array.from({ length: HEIGHT }, (_, y) => Math.random())
);

function updateSeason(cycle) {
  season = Math.floor((cycle / 600) % 4);
  const options = ['rain', 'clear', 'windy', 'drought'];
  weather = options[Math.floor(Math.sin(cycle / 100) * 2 + 2)];
}

// Helper: elevation-based fertility
function fertilityAt(x, y) {
  return terrain[Math.floor(x)][Math.floor(y)];
}

class Creature {
  constructor() {
    this.x = Math.random() * WIDTH;
    this.y = Math.random() * HEIGHT;
    this.hunger = 0;
    this.speed = Math.random() * 2 + 0.5;
    this.dna = Array.from({ length: 12 }, () => 'ATCG'[Math.floor(Math.random() * 4)]).join('');
    this.color = `hsl(${(this.dna.match(/A/g) || []).length * 30}, 100%, 50%)`;
    this.al
