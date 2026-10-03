"use client";

import { lazy, Suspense, useLayoutEffect, useRef } from "react";
import { branches, taglines } from "../data/site";
import { scheduleRefresh, useMotion, useNearViewport } from "../lib/motion";
import { Heading } from "../components/Heading";
import { Orb, Star } from "../components/Decor";
import { MaskIcon } from "../components/Icon";
import { SvgMap, type SvgMapHandle } from "../components/SvgMap";
import { STORES_TIMING, span } from "./storesTiming";
import type { Leader } from "../three/StoresScene";

const StoresScene = lazy(() => import("../three/StoresScene"));

export function Stores() {
  const section = useRef<HTMLElement>(null);
  const map = useRef<HTMLDivElement>(null);
  const svgMap = useRef<SvgMapHandle>(null);
  const progress = useRef(0);
  const leaders = useRef<Leader[]>(branches.map(() => ({ line: null, badge: null })));
  const { animate, webgl, stageReady, mobile, libs } = useMotion();
  const near = useNearViewport(section);
  const use3d = webgl && stageReady && !mobile;

  useLayoutEffect(() => {
    const items = Array.from(section.current?.querySelectorAll<HTMLElement>("[data-branch]") ?? []);
    const apply = (p: number) => {
      progress.current = p;
      svgMap.current?.update(p);
      items.forEach((el, i) => el.toggleAttribute("data-active", span(p, STORES_TIMING.pins[branches[i].id]) > 0.45));
    };
    if (!animate) {
      apply(1);
      return;
    }
    if (!libs) return;
    const { gsap } = libs;
    apply(0);
    const ctx = gsap.context(() => {
      gsap.timeline({
        scrollTrigger: mobile
          ? { trigger: section.current, start: "top 55%", end: "bottom 75%", scrub: 0.4, onUpdate: (s) => apply(s.progress) }
          : { trigger: section.current, start: "top top", end: "+=240%", pin: true, scrub: 0.5, onUpdate: (s) => apply(s.progress) },
      });
    }, section);
    scheduleRefresh(libs);
    return () => {
      ctx.revert();
      scheduleRefresh(libs);
    };
  }, [animate, mobile, libs]);

  return (
    <section id="stores" ref={section} aria-labelledby="stores-title" className="relative isolate overflow-hidden bg-[linear-gradient(180deg,#bbd6f5_0%,#d3e5f9_55%,#d3e5f9_100%)] md:h-[100dvh] md:min-h-[680px]">
      <Orb className="-left-32 bottom-10 size-80 bg-sky-50/60" />
      <Orb className="-right-20 -top-24 size-72 bg-sky-200/70" />
      <Star className="right-[38%] top-[12%] size-5 text-sky-300" />

      <div className="relative mx-auto grid h-full max-w-[1400px] grid-cols-1 gap-8 px-4 pb-20 pt-24 md:grid-cols-12 md:gap-6 md:px-8 md:pb-10 md:pt-24">
        <div className="flex min-h-0 flex-col md:col-span-7">
          <Heading id="stores-title" before="Our" accent="stores">
            <p className="mt-4 max-w-[38ch] text-navy-700">Four branches across Tamil Nadu. Drop in at the one nearest you.</p>
          </Heading>
          <div ref={map} className="relative mx-auto mt-2 aspect-[4/5] w-full max-w-[520px] min-h-0 md:mt-0 md:aspect-auto md:max-w-none md:flex-1">
            {use3d ? (
              near && (
                <Suspense fallback={null}>
                  <StoresScene progress={progress} mapRef={map} sectionRef={section} leaders={leaders} />
                </Suspense>
              )
            ) : (
              <SvgMap ref={svgMap} tilted={animate} className="absolute inset-0" />
            )}
          </div>
        </div>

        <div className="flex flex-col justify-center md:col-span-5">
          <ol className="m-0 grid list-none grid-cols-2 gap-x-4 gap-y-8 p-0 md:grid-cols-1 md:gap-y-5">
            {branches.map((b, i) => (
              <li
                key={b.id}
                data-branch
                className={`group flex flex-col items-center gap-3 text-center transition-[opacity,transform] duration-700 ease-out-soft md:flex-row md:items-center md:gap-5 md:text-left ${
                  animate ? "md:-translate-x-2 md:data-[active]:translate-x-0" : ""
                } ${i % 2 ? "md:ml-24" : ""}`}
              >
                <div
                  ref={(el) => void (leaders.current[i].badge = el)}
                  className="relative grid size-24 shrink-0 place-items-center rounded-full md:size-28"
                >
                  <img
                    src={b.icon}
                    alt=""
                    width={112}
                    height={112}
                    loading="lazy"
                    decoding="async"
                    className={`size-full transition-[filter,opacity,transform] duration-700 ease-out-soft ${
                      animate ? "scale-90 opacity-50 grayscale group-data-[active]:scale-100 group-data-[active]:opacity-100 group-data-[active]:grayscale-0" : ""
                    }`}
                  />
                  {b.headOffice && (
                    <span className="absolute -bottom-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full border-2 border-white bg-accent px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-white">
                      <MaskIcon name="band-icon-star" className="size-3" />
                      Head office
                    </span>
                  )}
                </div>
                <div>
                  <p className="m-0 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-accent-ink">{b.region}</p>
                  <h3 className="m-0 font-display text-2xl italic md:text-3xl">{b.name}</h3>
                  <p className="m-0 font-display text-sm italic text-navy-700">
                    {b.landmark}
                    {b.placeholderLandmark && <span className="sr-only"> (illustration is a placeholder)</span>}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-10 flex items-center gap-3 font-display text-lg italic text-accent-ink md:mt-8 md:text-xl">
            <MaskIcon name="band-icon-pin" className="size-5 shrink-0" />
            {taglines.stores}.
          </p>
        </div>
      </div>

      {use3d && (
        <svg aria-hidden className="pointer-events-none absolute inset-0 hidden h-full w-full md:block" style={{ zIndex: 11 }}>
          {branches.map((b, i) => (
            <line
              key={b.id}
              ref={(el) => void (leaders.current[i].line = el)}
              stroke="#0b2545"
              strokeOpacity="0.55"
              strokeWidth="1.5"
              strokeDasharray="4 5"
              style={{ opacity: 0 }}
            />
          ))}
        </svg>
      )}
    </section>
  );
}
