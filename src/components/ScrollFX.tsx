"use client";

import { useLayoutEffect } from "react";
import { scheduleRefresh, useMotion, type MotionLibs } from "../lib/motion";

/*
 * Scroll animations for sections whose markup is a Server Component.
 * The section renders as static HTML (never hydrated); this leaf renders nothing and only
 * attaches a GSAP timeline to the section's DOM once the motion libraries have loaded.
 */

type Gsap = MotionLibs["gsap"];

// Deterministic scatter so the brand drift looks the same on every visit.
const rand = (i: number, k: number) => {
  const x = Math.sin(i * 91.7 + k * 13.3) * 43758.5453;
  return x - Math.floor(x);
};

const presets = {
  quote(gsap: Gsap) {
    gsap
      .timeline({ scrollTrigger: { trigger: "[data-kural]", start: "top 78%", end: "bottom 42%", scrub: 0.5 } })
      // Each word rises out of its own mask, so text is never shown at reduced contrast.
      .fromTo("[data-word]", { yPercent: 105 }, { yPercent: 0, stagger: 0.18, duration: 0.5, ease: "power2.out" })
      .fromTo("[data-quote-mark]", { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, stagger: 0.9 }, 0)
      .fromTo("[data-english]", { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.6, ease: "none" }, ">-0.1")
      .fromTo("[data-cite]", { y: 12, clipPath: "inset(100% 0 0 0)" }, { y: 0, clipPath: "inset(0% 0 0 0)", duration: 0.4 }, ">-0.2");
  },

  clients(gsap: Gsap) {
    // Logos fly in from deep behind the page and lock into the 2-3-2 arrangement.
    gsap.fromTo(
      gsap.utils.toArray<HTMLElement>("[data-client]"),
      {
        z: (i) => -900 - (i % 3) * 260,
        x: (i) => (i % 2 ? 1 : -1) * (120 + i * 30),
        y: (i) => (i % 3 === 0 ? -1 : 1) * 80,
        rotateY: (i) => (i % 2 ? -50 : 50),
        opacity: 0,
      },
      {
        z: 0,
        x: 0,
        y: 0,
        rotateY: 0,
        opacity: 1,
        ease: "power3.out",
        stagger: 0.06,
        scrollTrigger: { trigger: "[data-clients]", start: "top 92%", end: "center 55%", scrub: 0.6 },
      },
    );
  },

  brands(gsap: Gsap) {
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    // Logos float in from scattered points in depth and settle into the three-column wall.
    gsap.fromTo(
      "[data-brand]",
      {
        x: (i) => (rand(i, 1) - 0.5) * (mobile ? 260 : 620),
        y: (i) => (rand(i, 2) - 0.5) * 420,
        z: (i) => -500 - rand(i, 3) * 900,
        rotateX: (i) => (rand(i, 4) - 0.5) * 70,
        rotateY: (i) => (rand(i, 5) - 0.5) * 90,
        opacity: 0,
      },
      {
        x: 0,
        y: 0,
        z: 0,
        rotateX: 0,
        rotateY: 0,
        opacity: 1,
        ease: "power2.out",
        stagger: { each: 0.03, from: "random" },
        scrollTrigger: { trigger: "[data-brands]", start: "top 95%", end: "center 60%", scrub: 0.7 },
      },
    );
  },

  footer(gsap: Gsap) {
    // The signature is written left to right as the footer arrives, then its swash follows.
    gsap
      .timeline({ scrollTrigger: { trigger: "[data-signature]", start: "top 92%", end: "bottom 70%", scrub: 0.6 } })
      .fromTo("[data-signature-clip]", { attr: { width: 0 } }, { attr: { width: 620 }, ease: "none", duration: 1 })
      .fromTo("[data-signature] [data-swash]", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.4 }, ">-0.1")
      .fromTo("[data-bubble]", { scale: 0.4, opacity: 0, rotate: -12 }, { scale: 1, opacity: 1, rotate: 0, ease: "back.out(2)", duration: 0.3 }, 0.2);
  },
};

export type ScrollPreset = keyof typeof presets;

export function ScrollFX({ root, preset }: { root: string; preset: ScrollPreset }) {
  const { animate, libs } = useMotion();

  useLayoutEffect(() => {
    const el = document.getElementById(root);
    if (!animate || !libs || !el) return;
    const ctx = libs.gsap.context(() => presets[preset](libs.gsap), el);
    scheduleRefresh(libs);
    return () => {
      ctx.revert();
      scheduleRefresh(libs);
    };
  }, [animate, libs, root, preset]);

  return null;
}

/** Gives the fixed header a backdrop once the top of the hero has scrolled away. */
export function NavScrollState({ header }: { header: string }) {
  useLayoutEffect(() => {
    const sentinel = document.getElementById("top-sentinel");
    const el = document.getElementById(header);
    if (!sentinel || !el) return;
    const io = new IntersectionObserver(([e]) => el.toggleAttribute("data-scrolled", !e.isIntersecting));
    io.observe(sentinel);
    return () => io.disconnect();
  }, [header]);
  return null;
}
