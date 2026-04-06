/**
 * Generates a deterministic pseudo-waveform from a seed string.
 * Same seed always produces the same bar heights — no storage needed.
 *
 * @param seed  A stable string (e.g. sound.id) to seed the RNG.
 * @param bars  Number of bars to generate.
 * @returns     Array of values in [0.15, 1.0].
 */
export function generateWaveform(seed: string, bars: number): number[] {
  // djb2 string hash → 32-bit unsigned integer seed
  let hash = 5381;
  for (let i = 0; i < seed.length; i++) {
    hash = (((hash << 5) + hash) ^ seed.charCodeAt(i)) >>> 0;
  }

  // LCG (Numerical Recipes constants), kept as unsigned 32-bit
  const a = 1664525;
  const c = 1013904223;
  let state = hash;

  return Array.from({ length: bars }, () => {
    state = ((a * state + c) >>> 0);
    const raw = state / 0xffffffff; // normalize to [0, 1)
    // Power curve clusters values toward mid-range, avoiding flat bars
    return 0.15 + Math.pow(raw, 0.6) * 0.85;
  });
}
