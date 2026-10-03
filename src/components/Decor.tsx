import { MaskIcon } from "./Icon";

/** Soft circles that sit partly off the section edges, as in the brochure. */
export function Orb({ className = "" }: { className?: string }) {
  return <span aria-hidden className={`pointer-events-none absolute -z-10 rounded-full ${className}`} data-orb />;
}

export function Star({ className = "", small = false }: { className?: string; small?: boolean }) {
  return <MaskIcon name={small ? "star-small" : "star-4pt"} className={`pointer-events-none absolute -z-10 ${className}`} />;
}

/** The brochure's underline swash, drawn in with stroke-dashoffset when its parent heading is revealed. */
export function Swash({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="85 106 78 8" preserveAspectRatio="none" className={`pointer-events-none absolute left-0 w-full ${className}`}>
      <path
        data-swash
        d="M85.6 110.85C104.02 106.6 128.03 113.4 162.46 108.3"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
        pathLength={1}
        style={{ strokeDasharray: 1, strokeDashoffset: "var(--swash, 0)" }}
      />
    </svg>
  );
}

export function WavyDivider({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="25 528 231 10" preserveAspectRatio="none" className={`block h-2.5 w-full ${className}`}>
      <path
        d="M25.5 532.92C35.07 529.14 44.63 529.14 54.2 532.92C63.77 536.69 73.33 536.69 82.9 532.92C92.47 529.14 102.04 529.14 111.6 532.92C121.17 536.69 130.74 536.69 140.3 532.92C149.87 529.14 159.44 529.14 169 532.92C178.57 536.69 188.14 536.69 197.7 532.92C207.27 529.14 216.84 529.14 226.4 532.92C235.97 536.69 245.54 536.69 255.11 532.92"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
