import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useMotion } from "../lib/motion";

// Must match the inline script in index.html, which sets html[data-nointro] before first paint
// (intro already seen this session, reduced motion, or ?nointro) so the overlay never shows.
const SEEN_KEY = "oranthai-intro-seen";
const skipIntro = () => document.documentElement.hasAttribute("data-nointro");

/**
 * A pencil writes the wordmark, rules a line across the screen, and the page splits open along it.
 * The whole sequence is CSS keyframes (see .intro in styles.css) so it starts with the first paint,
 * before any JavaScript runs. React only removes it when it ends, or early on a key press.
 */
export function Preloader({ onDone }: { onDone: () => void }) {
  const { ready, animate } = useMotion();
  const [done, setDone] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!done && (skipIntro() || (ready && !animate))) setDone(true);
  }, [ready, animate, done]);

  useLayoutEffect(() => {
    if (done) onDone();
  }, [done, onDone]);

  useEffect(() => {
    const el = root.current;
    if (done || !el) return;
    const finish = () => {
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {
        /* storage unavailable: the intro simply plays again next time */
      }
      setDone(true);
    };
    // Follow the CSS clock itself: resolves at once if the intro ended before hydration.
    const last = el
      .getAnimations({ subtree: true })
      .find((a) => (a as CSSAnimation).animationName === "intro-bottom");
    let alive = true;
    if (last) last.finished.then(() => alive && finish(), () => {});
    else finish();
    addEventListener("keydown", finish, { once: true });
    return () => {
      alive = false;
      removeEventListener("keydown", finish);
    };
  }, [done]);

  if (done) return null;

  return (
    <div ref={root} aria-hidden data-preloader className="intro fixed inset-0" style={{ zIndex: "var(--z-preloader)" }}>
      <div className="intro__top absolute inset-x-0 top-0 h-1/2 bg-linen" />
      <div className="intro__bottom absolute inset-x-0 bottom-0 h-1/2 bg-linen" />
      <svg viewBox="0 0 1000 220" className="intro__mark absolute left-1/2 top-1/2 w-[var(--intro-w)] -translate-x-1/2 -translate-y-[78%] overflow-visible">
        <text
          x="500"
          y="166"
          textAnchor="middle"
          // Fixed length so the pencil path in CSS (1% to 99% of the box) always matches the glyphs.
          textLength={980}
          lengthAdjust="spacing"
          className="intro__word font-display uppercase"
          style={{ fontSize: 172, fontWeight: 600, letterSpacing: "0.02em", fontVariationSettings: '"opsz" 144', fill: "#0b2545", stroke: "#0b2545", strokeWidth: 2 }}
        >
          Oranthai
        </text>
      </svg>
      <div className="intro__rule absolute inset-x-0 top-1/2 h-[3px] origin-left -translate-y-1/2 bg-accent" />
      <div className="intro__pencil pointer-events-none absolute left-0 top-0">
        {/* the graphite tip sits on this element's origin; the body trails up and to the right */}
        <div className="band band--pencil absolute right-0 top-0 h-3.5 w-44 origin-right -translate-y-1/2 rotate-[135deg]" style={{ ["--band-h" as string]: "14px", filter: "none" }}>
          <span className="band__eraser" />
          <span className="band__ferrule" />
          <span className="band__body" />
          <span className="band__tip" />
        </div>
      </div>
    </div>
  );
}
