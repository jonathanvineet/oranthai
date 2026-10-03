"use client";

import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import { company } from "../data/site";
import { scheduleRefresh, useMotion, useNearViewport } from "../lib/motion";
import { PencilBand } from "../components/Bands";
import { Orb, Star } from "../components/Decor";
import { MaskIcon } from "../components/Icon";

const HeroScene = lazy(() => import("../three/HeroScene"));

const range = ["Books", "Stationery", "Gifts", "Electronics"];

export function Hero() {
  const section = useRef<HTMLElement>(null);
  const band = useRef<HTMLDivElement>(null);
  const seal = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const { animate, webgl, stageReady, mobile, libs } = useMotion();
  const near = useNearViewport(section, "20% 0px");
  // The 3D pencil only takes over if the canvas arrives while the hero is still at rest;
  // otherwise the CSS band animation stays in charge for this visit.
  const [allow3d, setAllow3d] = useState(false);
  useEffect(() => {
    if (stageReady && window.scrollY < 40) setAllow3d(true);
  }, [stageReady]);
  const use3d = webgl && allow3d;
  const show3d = use3d && near;

  useLayoutEffect(() => {
    if (!animate || !libs) return;
    // On desktop the 3D pencil is coming: keep the static band until it arrives, so there is one handover, not two.
    if (webgl && !mobile && !stageReady) return;
    const { gsap } = libs;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section.current,
          start: "top top",
          end: "+=85%",
          pin: true,
          scrub: 0.6,
          onUpdate: (self) => {
            progress.current = self.progress;
          },
        },
      });
      // The band is invisible until the 3D pencil lands on it (handover at ~0.9-0.99).
      if (use3d) {
        tl.fromTo(band.current, { opacity: 0 }, { opacity: 1, duration: 0.09, ease: "none" }, 0.9);
        tl.to({}, { duration: 0.01 }, 0.99);
      } else {
        tl.fromTo(band.current, { scaleX: 0, transformOrigin: "left center" }, { scaleX: 1, duration: 1, ease: "power2.out" }, 0);
      }
      tl.to("[data-orb]", { yPercent: (i) => (i % 2 ? -18 : 14), ease: "none", duration: 1 }, 0);
    }, section);
    scheduleRefresh(libs);
    return () => {
      ctx.revert();
      scheduleRefresh(libs);
    };
  }, [animate, use3d, libs, webgl, mobile, stageReady]);

  return (
    <section
      id="top"
      ref={section}
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-[radial-gradient(120%_80%_at_50%_0%,#e6f0fb_0%,#d3e5f9_45%,#bbd6f5_100%)] py-20 md:pb-10 md:pt-20"
    >
      <span id="top-sentinel" aria-hidden className="absolute left-0 top-0 h-24 w-px" />
      <Orb className="-left-24 -top-24 size-72 bg-sky-200/80 md:size-[26rem]" />
      <Orb className="-right-28 top-1/3 size-64 bg-sky-200/70 md:size-96" />
      <Orb className="-left-44 bottom-[8%] size-72 bg-sky-50/70 md:size-96" />
      <Star className="left-[18%] top-[22%] size-5 text-sky-300" />
      <Star small className="right-[24%] top-[14%] size-6 text-sky-300" />
      <Star className="bottom-[18%] right-[12%] size-4 text-sky-300" />

      <div className="relative z-[1] flex w-full flex-col items-center px-4 text-center">
        <p className="kicker flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          {range.map((r, i) => (
            <span key={r} className="flex items-center gap-3">
              {i > 0 && <MaskIcon name="star-small" className="size-3 text-sky-300" />}
              {r}
            </span>
          ))}
        </p>
        <h1
          id="hero-title"
          className="m-0 mt-3 font-display text-[clamp(4rem,13vw,10.5rem)] font-semibold uppercase leading-[0.9] tracking-[0.02em] text-navy"
          style={{ fontVariationSettings: '"opsz" 144' }}
        >
          Oranthai
        </h1>
        <p className="mt-3 max-w-[34ch] text-balance text-sm font-medium uppercase tracking-[0.2em] text-accent-ink md:text-base">
          {company.legalName}
        </p>
      </div>

      <PencilBand ref={band} className="relative z-[1] mt-7 w-full md:mt-9" />

      <div className="relative z-[1] mt-8 flex flex-col items-center gap-6 px-4 md:mt-10">
        <div ref={seal} className="relative grid size-52 place-items-center md:size-60">
          <span aria-hidden className="absolute inset-[-10px] rounded-full border-2 border-dashed border-sky-300" />
          <span aria-hidden className="absolute inset-[-4px] rounded-full bg-accent/90" />
          <picture>
            <source type="image/avif" srcSet="/img/logo/seal-320.avif 320w, /img/logo/seal-640.avif 640w" sizes="(min-width: 768px) 240px, 208px" />
            <img
              src="/img/logo/seal-320.webp"
              srcSet="/img/logo/seal-320.webp 320w, /img/logo/seal-640.webp 640w"
              sizes="(min-width: 768px) 240px, 208px"
              width={240}
              height={240}
              alt="Words Worth Book House and Stationeries, Private Limited, circular seal"
              className="relative size-52 rounded-full md:size-60"
              fetchPriority="high"
            />
          </picture>
        </div>
        <a
          href="#stores"
          className="inline-flex items-center gap-2 rounded-full border-2 border-navy px-5 py-2.5 text-sm font-semibold text-navy no-underline transition-colors duration-300 hover:bg-navy hover:text-white active:scale-[0.98]"
        >
          <MaskIcon name="band-icon-pin" className="size-4" />
          Find a store
        </a>
      </div>

      {show3d && (
        <Suspense fallback={null}>
          <HeroScene progress={progress} bandRef={band} anchorRef={seal} mobile={mobile} />
        </Suspense>
      )}
    </section>
  );
}
