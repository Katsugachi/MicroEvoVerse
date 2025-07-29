// utils/noise.js
import SimplexNoise from 'simplex-noise';
export const noise = new SimplexNoise();

export function getBiomeType(x, y) {
  const scale = 0.01;
  const value = noise.noise2D(x * scale, y * scale);
  if (value > 0.5) return "Grasslands";
  if (value > 0.1) return "Forest";
  if (value > -0.2) return "Coastal";
  return "Mountains";
}
