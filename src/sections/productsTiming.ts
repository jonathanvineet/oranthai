import { products } from "../data/site";

const N = products.length;

/** Scroll progress to ring position in slots (0 = Books in front). Dwells on each product, then turns. */
export function ringAngle(p: number) {
  const x = Math.min(1, Math.max(0, p)) * (N - 1);
  const i = Math.floor(x);
  const f = x - i;
  // hold for the first 45% of each step, turn through the rest
  const t = Math.min(1, Math.max(0, (f - 0.45) / 0.55));
  return i + t * t * (3 - 2 * t);
}

export const activeIndex = (p: number) => Math.round(ringAngle(p)) % N;
