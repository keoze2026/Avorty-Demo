/**
 * Time-bucket rotation for demo fixtures.
 *
 * Every fixture that wants to "evolve" derives its seed from
 * `currentBucket()` — a stable integer that changes every 2 hours. Inside a
 * bucket the demo is fully deterministic (same numbers across reloads, same
 * cache, same charts); when the boundary crosses, every bucket-keyed value
 * rolls forward to a different seed and the headline numbers shift.
 *
 * This is what gives the demo its "alive" feel for prospects who open it
 * more than once a day: they don't see a static screenshot, they see a
 * busy operator with different daily totals every couple hours.
 */

import { makeRng } from "./rng";

/** Rotation window — 2h. Twelve distinct "looks" per day. */
const BUCKET_MS = 2 * 60 * 60 * 1000;

/** Stable integer that changes every BUCKET_MS milliseconds. */
export function currentBucket(): number {
  return Math.floor(Date.now() / BUCKET_MS);
}

/**
 * Returns a `0..1` pseudo-random value that is constant for the duration
 * of the current bucket and changes when the bucket rolls over.
 *
 * `salt` ensures different call sites get uncorrelated values (so the
 * "today total" and the "wallet balance" don't move in lockstep).
 */
export function bucketRandom(salt: number): number {
  return makeRng(currentBucket() * 1_000 + salt)();
}

/** Convenience: linearly map bucketRandom into a numeric range. */
export function bucketRange(salt: number, min: number, max: number): number {
  return min + bucketRandom(salt) * (max - min);
}

/** Convenience: integer in [min, max] inclusive, stable within a bucket. */
export function bucketInt(salt: number, min: number, max: number): number {
  return Math.floor(bucketRange(salt, min, max + 1));
}
