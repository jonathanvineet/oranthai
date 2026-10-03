import { createContext, useCallback, useContext, useEffect, useState, type ReactNode, type RefObject } from "react";
import type { gsap as Gsap } from "gsap";
import type { ScrollTrigger as ScrollTriggerType } from "gsap/ScrollTrigger";
import type Lenis from "lenis";

/** GSAP, ScrollTrigger and Lenis are fetched after hydration so they stay off the critical path. */
export type MotionLibs = { gsap: typeof Gsap; ScrollTrigger: typeof ScrollTriggerType };
export type ScrollTrigger = ScrollTriggerType;

/**
 * Sections build their ScrollTriggers independently (and the hero rebuilds its pin once WebGL is ready),
 * so every create or teardown asks for one re-sort and refresh on the next frame. Pins earlier in the page
 * change the scroll positions of everything after them.
 */
let refreshFrame = 0;
export function scheduleRefresh(libs: MotionLibs) {
  cancelAnimationFrame(refreshFrame);
  refreshFrame = requestAnimationFrame(() => {
    libs.ScrollTrigger.sort();
    libs.ScrollTrigger.refresh();
  });
}

/** Media query state. Starts from `fallback` on the server and the first client render so hydration matches. */
function useMedia(query: string, fallback = false) {
  const [match, setMatch] = useState(fallback);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return match;
}

function detectWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

type MotionEnv = {
  /** Client has hydrated and measured the environment. */
  ready: boolean;
  /** Full choreography: smooth scroll, pins, 3D. False under prefers-reduced-motion. */
  animate: boolean;
  /** Animation libraries, null until loaded (and always null under reduced motion). */
  libs: MotionLibs | null;
  /** WebGL is available and allowed (not reduced motion). */
  webgl: boolean;
  /** The shared canvas has mounted, so 3D scenes may render. */
  stageReady: boolean;
  markStageReady: () => void;
  mobile: boolean;
  lenis: Lenis | null;
};

const MotionCtx = createContext<MotionEnv>({
  ready: false,
  animate: false,
  libs: null,
  webgl: false,
  stageReady: false,
  markStageReady: () => {},
  mobile: false,
  lenis: null,
});

export function MotionProvider({ children }: { children: ReactNode }) {
  const reduced = useMedia("(prefers-reduced-motion: reduce)", true);
  const mobile = useMedia("(max-width: 767px)");
  const [ready, setReady] = useState(false);
  const [webgl, setWebgl] = useState(false);
  const [stageReady, setStageReady] = useState(false);
  const markStageReady = useCallback(() => setStageReady(true), []);
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const [libs, setLibs] = useState<MotionLibs | null>(null);

  useEffect(() => {
    setWebgl(detectWebGL());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || reduced) return;
    let dead = false;
    let cleanup = () => {};
    Promise.all([import("gsap"), import("gsap/ScrollTrigger"), import("lenis")]).then(([{ gsap }, { ScrollTrigger }, { default: LenisCtor }]) => {
      if (dead) return;
      gsap.registerPlugin(ScrollTrigger);
      const l = new LenisCtor({ autoRaf: false, lerp: 0.11, wheelMultiplier: 0.9 });
      l.on("scroll", ScrollTrigger.update);
      const tick = (t: number) => l.raf(t * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(500, 33);
      const loaded = { gsap, ScrollTrigger };
      setLibs(loaded);
      // Late web fonts change text heights, which moves every trigger below them.
      document.fonts.ready.then(() => !dead && scheduleRefresh(loaded));
      setLenis(l);
      cleanup = () => {
        gsap.ticker.remove(tick);
        l.destroy();
      };
    });
    return () => {
      dead = true;
      cleanup();
      setLenis(null);
      setLibs(null);
    };
  }, [ready, reduced]);

  const animate = ready && !reduced;
  return (
    <MotionCtx.Provider value={{ ready, animate, libs, webgl: animate && webgl, stageReady, markStageReady, mobile, lenis }}>{children}</MotionCtx.Provider>
  );
}

export const useMotion = () => useContext(MotionCtx);

/** True while the element is within `margin` of the viewport. Used to mount and dispose 3D scenes. */
export function useNearViewport(ref: RefObject<Element | null>, margin = "60% 0px") {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin]);
  return near;
}

/** Plain mutable progress shared between a ScrollTrigger and a render loop, outside React state. */
export type Progress = { current: number };
