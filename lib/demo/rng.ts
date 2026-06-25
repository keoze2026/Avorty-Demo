/**
 * Tiny seeded PRNG so fixtures look randomized but reproduce identically
 * across reloads (and screenshots). We can't use `Math.random()` in the
 * SSR path anyway; this works on both server and client.
 *
 * Mulberry32 — small, fast, well-distributed enough for marketing fixtures.
 */

export function makeRng(seed: number) {
  let s = seed >>> 0;
  return function next(): number {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pick<T>(arr: readonly T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

export function range(rng: () => number, min: number, max: number): number {
  return min + rng() * (max - min);
}

export function intRange(rng: () => number, min: number, max: number): number {
  return Math.floor(range(rng, min, max + 1));
}

export function chance(rng: () => number, p: number): boolean {
  return rng() < p;
}
