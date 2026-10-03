// A deliberately simplified Tamil Nadu outline as [lon, lat] pairs, clockwise from Pulicat.
// Stylised art for the stores map, not a survey-accurate boundary. No map tiles are used.
export const TN_OUTLINE: [number, number][] = [
  [80.32, 13.55], [80.05, 13.58], [79.75, 13.37], [79.42, 13.27], [79.0, 13.05], [78.62, 12.88],
  [78.28, 12.95], [77.95, 12.75], [77.72, 12.85], [77.47, 12.58], [77.6, 12.2], [77.45, 11.95],
  [77.05, 11.8], [76.62, 11.7], [76.25, 11.55], [76.35, 11.3], [76.65, 11.0], [76.85, 10.8],
  [76.9, 10.55], [77.15, 10.25], [77.15, 9.9], [77.2, 9.55], [77.2, 9.2], [77.2, 8.75],
  [77.22, 8.35], [77.55, 8.08], [78.1, 8.5], [78.15, 8.8], [78.45, 9.1], [78.9, 9.25],
  [79.3, 9.28], [79.0, 9.6], [79.1, 9.9], [79.3, 10.3], [79.85, 10.28], [79.84, 10.77],
  [79.8, 11.2], [79.77, 11.75], [79.83, 11.93], [80.0, 12.25], [80.19, 12.62], [80.29, 13.08],
];

/** Route the pencil draws, Chennai to Thanjavur, through the interior. */
export const ROUTE: [number, number][] = [
  [80.2, 12.9], [79.75, 12.25], [79.5, 11.75], [79.3, 11.25], [79.06, 10.87],
];

export const MAP_CENTRE: [number, number] = [78.3, 10.83];

/** Equirectangular projection into map units centred on the state (1 unit ~ 1 degree). */
export function project([lon, lat]: [number, number]): [number, number] {
  return [(lon - MAP_CENTRE[0]) * 0.98, lat - MAP_CENTRE[1]];
}
