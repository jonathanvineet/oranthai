import type React from "react";
import metrics from "../data/logo-metrics.json";

type Kind = "brands" | "clients";
type Metric = { aspect: number; density: number };

/**
 * Equalises logos by visual area rather than height: every logo gets the same box area,
 * nudged up for sparse marks and down for solid blocks, then clamped to its slot.
 */
export function logoSize(kind: Kind, id: string, area: number, maxW: number, maxH: number) {
  const m = (metrics[kind] as Record<string, Metric>)[id];
  if (!m) return { width: maxW, height: maxH };
  const a = area * Math.pow(0.45 / Math.max(0.1, m.density), 0.35);
  let w = Math.sqrt(a * m.aspect);
  let h = w / m.aspect;
  const s = Math.min(1, maxW / w, maxH / h);
  w *= s;
  h *= s;
  return { width: Math.round(w), height: Math.round(h) };
}

type Box = { area: number; maxW: number; maxH: number };

/** Logo sized by area. Pass `sm` for different phone sizing; both sizes are applied in CSS, so no JS is needed. */
export function Logo({ kind, id, name, area, maxW, maxH, sm, className = "" }: { kind: Kind; id: string; name: string; sm?: Box; className?: string } & Box) {
  const lg = logoSize(kind, id, area, maxW, maxH);
  const small = sm ? logoSize(kind, id, sm.area, sm.maxW, sm.maxH) : lg;
  const vars = { "--w": `${small.width}px`, "--h": `${small.height}px`, "--w-md": `${lg.width}px`, "--h-md": `${lg.height}px` } as React.CSSProperties;
  return (
    // display: contents lets the <img> itself be the grid item, so it centres in the badge and
    // percentage sizes resolve against the badge rather than an unsized inline <picture>.
    <picture className="contents">
      <source type="image/webp" srcSet={`/img/${kind}/${id}.webp`} />
      <img
        src={`/img/${kind}/${id}.png`}
        alt={`${name} logo`}
        width={lg.width}
        height={lg.height}
        style={vars}
        loading="lazy"
        decoding="async"
        draggable={false}
        className={`block h-[var(--h)] w-[var(--w)] max-w-none select-none object-contain md:h-[var(--h-md)] md:w-[var(--w-md)] ${className}`}
      />
    </picture>
  );
}
