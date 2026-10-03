"use client";

import { lazy, Suspense, useLayoutEffect, useRef, useState } from "react";
import { customItems, customisations, taglines, type Item } from "../data/site";
import { scheduleRefresh, useMotion, useNearViewport } from "../lib/motion";
import { Heading } from "../components/Heading";
import { PenBand } from "../components/Bands";
import { Orb, Star, WavyDivider } from "../components/Decor";
import { MaskIcon } from "../components/Icon";
import { writingState } from "./customTiming";
import type { Tip } from "../three/CustomScene";

const CustomScene = lazy(() => import("../three/CustomScene"));

function Circle({ item, size = "size-28 md:size-32" }: { item: Item; size?: string }) {
  return (
    <figure className="m-0 flex w-40 shrink-0 flex-col items-center text-center">
      <span className={`${size} rounded-full border-4 border-white shadow-[0_0_0_3px_rgb(155_196_239/0.9),0_14px_30px_-14px_rgb(11_37_69/0.5)]`}>
        <picture>
          <source type="image/avif" srcSet={`/img/custom/${item.id}-240.avif`} />
          <img src={`/img/custom/${item.id}-240.webp`} width={128} height={128} alt={item.alt} loading="lazy" decoding="async" className="block size-full rounded-full object-cover" />
        </picture>
      </span>
      <figcaption className="mt-2">
        <span className="block font-display text-lg font-medium leading-tight">{item.name}</span>
        <span className="block font-display text-sm italic text-navy-700">{item.note}</span>
      </figcaption>
    </figure>
  );
}

export function CustomOrders() {
  const section = useRef<HTMLElement>(null);
  const writing = useRef<SVGSVGElement>(null);
  const clips = useRef<(SVGRectElement | null)[]>([]);
  const words = useRef<(SVGTextElement | null)[]>([]);
  const progress = useRef(0);
  const tip = useRef<Tip>({ x: 0, y: 0, lift: 1 });
  const [current, setCurrent] = useState(-1);
  const { animate, webgl, stageReady, mobile, libs } = useMotion();
  const near = useNearViewport(section);
  const staged = animate && !mobile;

  useLayoutEffect(() => {
    if (!staged || !libs) return;
    const { gsap } = libs;
    let boxes: DOMRect[] = [];
    const measure = () => {
      boxes = words.current.map((w) => (w ? w.getBBox() : new DOMRect()));
    };
    document.fonts.ready.then(measure);
    measure();

    const apply = (p: number) => {
      progress.current = p;
      const { index, reveal, hold, started } = writingState(p);
      const svg = writing.current;
      const host = section.current;
      if (!svg || !host || !boxes.length) return;
      words.current.forEach((w, i) => {
        if (!w) return;
        w.style.opacity = i === index ? String(1 - Math.max(0, hold - 0.55) / 0.45) : "0";
        w.style.fillOpacity = String(i === index ? Math.max(0, reveal - 0.85) / 0.15 : 0);
      });
      clips.current.forEach((c, i) => {
        const b = boxes[i];
        if (!c || !b) return;
        c.setAttribute("x", String(b.x - 6));
        c.setAttribute("width", String(i === index && started ? b.width * reveal + 6 : 0));
      });
      // Writing point: end of the revealed part of the current word, gliding to the next word between them.
      const ctm = svg.getScreenCTM();
      const hr = host.getBoundingClientRect();
      if (!ctm) return;
      const b = boxes[index] ?? boxes[0];
      const next = boxes[Math.min(index + 1, boxes.length - 1)];
      const baseY = b.y + b.height * 0.7;
      let ux = started ? b.x + b.width * reveal : b.x;
      if (hold > 0 && index < boxes.length - 1) ux = ux + (next.x - ux) * hold;
      tip.current.x = ctm.a * ux + ctm.e - hr.left;
      tip.current.y = ctm.d * baseY + ctm.f - hr.top;
      tip.current.lift = started ? Math.sin(Math.min(1, hold) * Math.PI) : 0.6;
      const shown = started ? index : -1;
      setCurrent((c) => (c === shown ? c : shown));
    };

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section.current,
          start: "top top",
          end: "+=300%",
          pin: true,
          scrub: 0.5,
          onUpdate: (s) => apply(s.progress),
          onRefresh: (s) => {
            measure();
            apply(s.progress);
          },
        },
      });
      // Two rows of products cross past each other while the pen writes.
      tl.fromTo("[data-row='a']", { xPercent: -14 }, { xPercent: 10, ease: "none", duration: 1 }, 0).fromTo(
        "[data-row='b']",
        { xPercent: 12 },
        { xPercent: -12, ease: "none", duration: 1 },
        0,
      );
    }, section);
    apply(0);
    scheduleRefresh(libs);
    return () => {
      ctx.revert();
      scheduleRefresh(libs);
    };
  }, [staged, libs]);

  const rowA = customItems.slice(0, 4);
  const rowB = customItems.slice(4);

  return (
    <>
      <PenBand className="relative z-[1] -mb-[calc(var(--band-h)/2)] w-full" />
      <section
        id="custom"
        ref={section}
        aria-labelledby="custom-title"
        className="relative isolate overflow-hidden bg-[linear-gradient(170deg,#fbeecb_0%,#fdf2d6_50%,#fdf5de_100%)] md:h-[100dvh] md:min-h-[720px]"
      >
        <Orb className="-right-24 top-[18%] size-80 bg-orb" />
        <Orb className="-left-32 bottom-[6%] size-72 bg-peach" />
        <Star className="left-[42%] top-[13%] size-5 text-sky-300" />
        <Star small className="right-[9%] bottom-[22%] size-6 text-sky-300" />

        <div className="relative mx-auto flex h-full max-w-[1400px] flex-col px-4 pb-16 pt-20 md:px-8 md:pb-8 md:pt-24">
          <Heading id="custom-title" before="Custom" accent="orders">
            <p className="mt-3 max-w-[44ch] font-medium text-navy">Personalised with your name or logo, for schools, offices and events.</p>
          </Heading>

          {staged ? (
            <div className="relative flex flex-1 flex-col justify-between pt-4">
              <div data-row="a" className="flex justify-center gap-10">
                {rowA.map((it) => (
                  <Circle key={it.id} item={it} />
                ))}
              </div>
              <svg ref={writing} aria-hidden viewBox="0 0 1200 170" className="mx-auto h-[clamp(5rem,13vh,8.5rem)] w-full max-w-5xl overflow-visible">
                <defs>
                  {customisations.map((c, i) => (
                    <clipPath key={c} id={`write-${i}`}>
                      <rect ref={(el) => void (clips.current[i] = el)} x="0" y="-40" width="0" height="260" />
                    </clipPath>
                  ))}
                </defs>
                {customisations.map((c, i) => (
                  <text
                    key={c}
                    ref={(el) => void (words.current[i] = el)}
                    x="600"
                    y="125"
                    textAnchor="middle"
                    clipPath={`url(#write-${i})`}
                    className="font-display italic"
                    style={{ fontSize: 132, fill: "#0b2545", fillOpacity: 0, stroke: "#0b2545", strokeWidth: 1.6, opacity: 0, fontVariationSettings: '"opsz" 144' }}
                  >
                    {c}
                  </text>
                ))}
              </svg>
              <div data-row="b" className="flex justify-center gap-10">
                {rowB.map((it) => (
                  <Circle key={it.id} item={it} />
                ))}
              </div>
            </div>
          ) : (
            <ul className="mt-10 grid list-none grid-cols-2 justify-items-center gap-x-4 gap-y-8 p-0 sm:grid-cols-3 [&>li:last-child]:col-span-2 sm:[&>li:last-child]:col-span-1">
              {customItems.map((it) => (
                <li key={it.id}>
                  <Circle item={it} />
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8 md:mt-4">
            <WavyDivider className="max-w-md text-sky-300" />
            <h3 className="mb-0 mt-4 text-2xl">Customisations</h3>
            <ul className="m-0 mt-2 flex list-none flex-wrap gap-x-5 gap-y-2 p-0 text-sm font-semibold uppercase tracking-[0.14em]">
              {customisations.map((c, i) => {
                const writingNow = staged && i === current;
                return (
                  <li
                    key={c}
                    aria-current={writingNow ? "step" : undefined}
                    className={`-mx-2 flex items-center gap-2 rounded-full px-2 py-0.5 text-navy transition-colors duration-500 ${writingNow ? "bg-white/85" : ""}`}
                  >
                    <MaskIcon name="star-small" className="size-3 text-accent" />
                    {c}
                  </li>
                );
              })}
              <li className="-mx-2 flex items-center gap-2 px-2 py-0.5 text-navy">
                <MaskIcon name="star-small" className="size-3 text-accent" />
                And more
              </li>
            </ul>
            <p className="m-0 mt-3 font-display text-lg italic text-navy">{taglines.custom}.</p>
          </div>
        </div>

        {staged && webgl && stageReady && near && (
          <Suspense fallback={null}>
            <CustomScene progress={progress} tip={tip} hostRef={section} />
          </Suspense>
        )}
      </section>
    </>
  );
}
