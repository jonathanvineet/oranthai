import { customisations } from "../data/site";

// Pinned scroll choreography for custom orders (fractions of the pin distance).
export const CUSTOM_TIMING = {
  enter: [0, 0.07] as const,
  morph: [0.07, 0.18] as const,
  write: [0.2, 0.98] as const,
};

/** Which customisation is being written and how far through it the pen is. */
export function writingState(p: number) {
  const [a, b] = CUSTOM_TIMING.write;
  const x = Math.min(0.99999, Math.max(0, (p - a) / (b - a))) * customisations.length;
  const index = Math.floor(x);
  const local = x - index;
  // write for 70% of each slot, hold the finished word for the rest
  return { index, reveal: Math.min(1, local / 0.7), hold: Math.max(0, (local - 0.7) / 0.3), started: p >= a };
}
