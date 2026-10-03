"use client";

import { lazy, Suspense, useCallback, useEffect, useState, type ReactNode } from "react";
import { MotionProvider, useMotion } from "./lib/motion";
import { Preloader } from "./sections/Preloader";

const Stage = lazy(() => import("./three/Stage"));

function Shell({ children }: { children: ReactNode }) {
  const { webgl, mobile } = useMotion();
  // WebGL waits for the intro so shader compilation never stalls the pencil drawing,
  // then for an idle moment (desktop) or the first scroll or touch (phones), so the
  // three.js download and shader compile never compete with first paint.
  const [introDone, setIntroDone] = useState(false);
  const onIntroDone = useCallback(() => setIntroDone(true), []);
  const [loadStage, setLoadStage] = useState(false);
  useEffect(() => {
    if (!webgl || !introDone || loadStage) return;
    if (mobile) {
      const go = () => setLoadStage(true);
      const events = ["pointerdown", "touchstart", "wheel", "keydown", "scroll"] as const;
      events.forEach((e) => addEventListener(e, go, { once: true, passive: true }));
      return () => events.forEach((e) => removeEventListener(e, go));
    }
    const ric = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 300));
    const id = ric(() => setLoadStage(true), { timeout: 1500 });
    return () => (window.cancelIdleCallback ?? clearTimeout)(id);
  }, [webgl, introDone, mobile, loadStage]);
  return (
    <>
      <Preloader onDone={onIntroDone} />
      {children}
      {loadStage && (
        <Suspense fallback={null}>
          <Stage mobile={mobile} />
        </Suspense>
      )}
    </>
  );
}

/**
 * Client boundary for the page: motion environment, intro, and the lazily loaded WebGL stage.
 * Sections arrive as server-rendered children, so static ones are never hydrated.
 */
export function ClientShell({ children }: { children: ReactNode }) {
  return (
    <MotionProvider>
      <Shell>{children}</Shell>
    </MotionProvider>
  );
}
