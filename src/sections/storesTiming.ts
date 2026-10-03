// Scroll choreography for the stores map, shared by the DOM section and the 3D scene.
// Values are fractions of the pinned scroll distance.
export const STORES_TIMING = {
  tilt: [0, 0.12] as const,
  pins: {
    mogappair: [0.12, 0.2],
    nungambakkam: [0.22, 0.3],
    thanjavur: [0.64, 0.72],
    orathanadu: [0.76, 0.84],
  } as Record<string, readonly [number, number]>,
  route: [0.32, 0.62] as const,
};

export const span = (p: number, [a, b]: readonly [number, number]) => Math.min(1, Math.max(0, (p - a) / (b - a)));
