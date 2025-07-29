import { getBiomeType, biomeColors } from './utils/noise.js';

export function spawnCreature() {
  const x = Math.random() * canvas.width;
  const y = Math.random() * canvas.height;
  const biome = getBiomeType(x, y);

  const creature = {
    x, y,
    biome,
    color: biomeColors[biome],
    speed: 1,
    visionRange: 100,
    fertility: 0.5,
    stealth: 0.2
  };
  creatures.push(creature);
}
