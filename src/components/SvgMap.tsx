import { forwardRef, useImperativeHandle, useRef } from "react";
import { branches } from "../data/site";
import { ROUTE, TN_OUTLINE, project } from "../data/tamilnadu";
import { STORES_TIMING, span } from "../sections/storesTiming";

const pt = (p: [number, number]) => {
  const [x, y] = project(p);
  return `${x.toFixed(3)} ${(-y).toFixed(3)}`;
};
const OUTLINE = "M" + TN_OUTLINE.map(pt).join("L") + "Z";
// Smooth route through the same waypoints the 3D curve uses.
const ROUTE_D = (() => {
  const P = ROUTE.map((p) => {
    const [x, y] = project(p);
    return [x, -y];
  });
  let d = `M${P[0][0]} ${P[0][1]}`;
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[i - 1] ?? P[i];
    const p1 = P[i];
    const p2 = P[i + 1];
    const p3 = P[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${p2[0]} ${p2[1]}`;
  }
  return d;
})();

export type SvgMapHandle = { update: (p: number) => void };

/** Flat SVG version of the stores map for phones, reduced motion and no-WebGL. */
export const SvgMap = forwardRef<SvgMapHandle, { tilted?: boolean; className?: string }>(function SvgMap({ tilted, className = "" }, ref) {
  const reveal = useRef<SVGPathElement>(null);
  const pins = useRef<(SVGGElement | null)[]>([]);

  useImperativeHandle(ref, () => ({
    update(p) {
      reveal.current?.style.setProperty("stroke-dashoffset", String(1 - span(p, STORES_TIMING.route)));
      branches.forEach((b, i) => {
        const r = span(p, STORES_TIMING.pins[b.id]);
        const g = pins.current[i];
        if (g) {
          g.style.opacity = String(Math.min(1, r * 2));
          g.style.transform = `translateY(${(1 - r) * 0.25}px) scale(${0.4 + 0.6 * r})`;
        }
      });
    },
  }));

  return (
    <div className={`[perspective:900px] ${className}`}>
      <svg
        viewBox="-2.35 -3.05 4.7 6.1"
        className="h-full w-full overflow-visible transition-transform duration-700"
        style={tilted ? { transform: "rotateX(32deg) rotateZ(-4deg)", transformOrigin: "50% 60%" } : undefined}
        role="img"
        aria-label="Map of Tamil Nadu with Oranthai stores in Mogappair and Nungambakkam in Chennai, and Thanjavur and Orathanadu in Thanjavur district"
      >
        <defs>
          <mask id="route-reveal" maskUnits="userSpaceOnUse" x="-3" y="-4" width="6" height="8">
            <path ref={reveal} d={ROUTE_D} fill="none" stroke="#fff" strokeWidth="0.2" pathLength={1} style={{ strokeDasharray: 1, strokeDashoffset: 0 }} />
          </mask>
        </defs>
        <path d={OUTLINE} transform="translate(0.06 0.09)" fill="#2a6fd2" />
        <path d={OUTLINE} fill="#f4f8fd" stroke="#0b2545" strokeOpacity="0.5" strokeWidth="0.02" strokeLinejoin="round" />
        <path d={ROUTE_D} fill="none" stroke="#0b2545" strokeWidth="0.035" strokeDasharray="0.07 0.06" mask="url(#route-reveal)" />
        {branches.map((b, i) => {
          const [x, y] = project([b.lon, b.lat]);
          return (
            <g key={b.id} transform={`translate(${x} ${-y})`}>
              <g ref={(el) => void (pins.current[i] = el)} style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}>
                <path d="M0 0 L-0.09 -0.24 A0.13 0.13 0 1 1 0.09 -0.24 Z" fill={b.headOffice ? "#0b2545" : "#1e63c6"} />
                <circle cy="-0.31" r="0.05" fill="#f4f8fd" />
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
});
