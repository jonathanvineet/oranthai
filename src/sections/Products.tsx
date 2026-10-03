"use client";

import { lazy, Suspense, useLayoutEffect, useRef, useState } from "react";
import { products } from "../data/site";
import { scheduleRefresh, useMotion, useNearViewport, type ScrollTrigger } from "../lib/motion";
import { Heading } from "../components/Heading";
import { Orb, Star } from "../components/Decor";
import { activeIndex } from "./productsTiming";

const ProductRing = lazy(() => import("../three/ProductRing"));

function Thumb({ id, alt, size }: { id: string; alt: string; size: number }) {
  return (
    <picture>
      <source type="image/avif" srcSet={`/img/products/${id}-240.avif 240w, /img/products/${id}-480.avif 480w`} sizes={`${size}px`} />
      <img
        src={`/img/products/${id}-240.webp`}
        srcSet={`/img/products/${id}-240.webp 240w, /img/products/${id}-480.webp 480w`}
        sizes={`${size}px`}
        width={size}
        height={size}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="block size-full rounded-full object-cover"
      />
    </picture>
  );
}

export function Products() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const trigger = useRef<ScrollTrigger | null>(null);
  const [active, setActive] = useState(0);
  const track = useRef<HTMLOListElement>(null);
  const { animate, webgl, stageReady, mobile, lenis, libs } = useMotion();
  const near = useNearViewport(section);
  const ring = webgl && stageReady && !mobile;
  // Phones: the row of products pans sideways while the section is pinned, ending on the last product.
  const pan = animate && mobile;

  useLayoutEffect(() => {
    const row = track.current;
    if (!pan || !libs || !row) return;
    const { gsap } = libs;
    const items = Array.from(row.children) as HTMLElement[];
    const mark = (p: number) => {
      const i = Math.round(p * (items.length - 1));
      items.forEach((el, k) => el.toggleAttribute("data-active", k === i));
    };
    mark(0);
    const distance = () => items[items.length - 1].offsetLeft - items[0].offsetLeft;
    const ctx = gsap.context(() => {
      gsap.to(row, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: section.current,
          start: "top top",
          end: () => `+=${distance() * 1.15}`,
          pin: true,
          scrub: 0.5,
          invalidateOnRefresh: true,
          onUpdate: (s) => mark(s.progress),
        },
      });
    }, section);
    scheduleRefresh(libs);
    return () => {
      ctx.revert();
      items.forEach((el) => el.removeAttribute("data-active"));
      scheduleRefresh(libs);
    };
  }, [pan, libs]);

  useLayoutEffect(() => {
    if (!ring || !libs) return;
    const { gsap } = libs;
    const ctx = gsap.context(() => {
      gsap.timeline({
        scrollTrigger: {
          trigger: section.current,
          start: "top top",
          end: "+=320%",
          pin: true,
          scrub: 0.5,
          onUpdate: (s) => {
            progress.current = s.progress;
            setActive((prev) => {
              const next = activeIndex(s.progress);
              return prev === next ? prev : next;
            });
          },
          onRefresh: (s) => void (trigger.current = s),
        },
      });
    }, section);
    scheduleRefresh(libs);
    return () => {
      ctx.revert();
      scheduleRefresh(libs);
    };
  }, [ring, libs]);

  const jumpTo = (i: number) => {
    const st = trigger.current;
    if (!ring || !st) return setActive(i);
    const y = st.start + (st.end - st.start) * (i / (products.length - 1));
    if (lenis) lenis.scrollTo(y, { duration: 1.2 });
    else window.scrollTo({ top: y, behavior: "smooth" });
  };

  const current = products[active];

  return (
    <section
      id="products"
      ref={section}
      aria-labelledby="products-title"
      className={`relative isolate overflow-hidden bg-[linear-gradient(170deg,#f8f0d9_0%,#f9f7ea_50%,#eef1ea_100%)] md:h-[100dvh] md:min-h-[680px] ${pan ? "max-md:h-[100svh] max-md:min-h-[560px]" : ""}`}
    >
      <Orb className="-left-24 top-1/3 size-72 bg-peach" />
      <Orb className="-right-40 -bottom-40 size-[28rem] bg-orb" />
      <Star className="left-[46%] top-[14%] size-5 text-sky-300" />

      <div className={`relative mx-auto grid h-full max-w-[1400px] grid-cols-1 gap-8 px-4 py-20 ${pan ? "max-md:content-center max-md:gap-6 max-md:pb-8 max-md:pt-16" : ""} md:grid-cols-12 md:gap-6 md:px-8 md:pb-10 md:pt-24`}>
        <div className="flex flex-col md:col-span-5">
          <Heading id="products-title" kicker="What we sell" before="Our" accent="products">
            <p className="mt-4 max-w-[38ch] text-navy-700">Everything on your list, under one roof.</p>
          </Heading>

          {/* Desktop: an index that drives the ring, active product described below it. */}
          <div className="mt-8 hidden md:block">
            <ol className="m-0 grid list-none grid-cols-2 gap-x-6 gap-y-2 p-0">
              {products.map((p, i) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => jumpTo(i)}
                    aria-current={i === active ? "true" : undefined}
                    className={`group flex w-full items-center gap-3 rounded-full py-1 pl-1 pr-3 text-left transition-colors duration-300 ${
                      i === active ? "bg-white/70 text-navy" : "text-navy-700 hover:bg-white/40"
                    }`}
                  >
                    <span className={`size-10 shrink-0 rounded-full ring-2 transition-[box-shadow] ${i === active ? "ring-accent" : "ring-white"}`}>
                      <Thumb id={p.id} alt={p.alt} size={40} />
                    </span>
                    <span className="font-medium">{p.name}</span>
                  </button>
                </li>
              ))}
            </ol>
            <div aria-live="polite" className="mt-8 border-l-2 border-accent pl-5">
              <p className="m-0 font-display text-3xl italic text-navy">{current.name}</p>
              <p className="m-0 mt-1 max-w-[36ch] text-navy-700">{current.note}</p>
            </div>
          </div>
        </div>

        <div ref={stage} className="relative hidden min-h-0 md:col-span-7 md:block">
          {ring && near && (
            <Suspense fallback={null}>
              <ProductRing progress={progress} />
            </Suspense>
          )}
          {!ring && (
            <div className="grid h-full place-items-center">
              <div className="relative size-80 rounded-full border-[6px] border-white shadow-[0_0_0_3px_#9bc4ef]">
                <Thumb id={current.id} alt={current.alt} size={320} />
              </div>
            </div>
          )}
        </div>

        {/* Phones: a row of circles. Pinned and scroll-driven when motion is on, swipeable otherwise. */}
        <ol
          ref={track}
          aria-label="Products"
          className={`-mx-4 flex list-none gap-5 pb-4 md:hidden ${pan ? "gap-2 overflow-visible px-[calc(50vw-7.5rem)]" : "snap-x snap-mandatory overflow-x-auto px-4"}`}
        >
          {products.map((p) => (
            <li
              key={p.id}
              className={`flex shrink-0 snap-center flex-col items-center text-center ${pan ? "w-60" : "w-56"} ${
                pan ? "scale-[0.8] opacity-60 transition-[transform,opacity] duration-500 ease-out-soft data-[active]:scale-100 data-[active]:opacity-100" : ""
              }`}
            >
              <span className={`${pan ? "size-[min(15rem,62vw,34svh)]" : "size-48"} rounded-full border-[5px] border-white shadow-[0_0_0_3px_#9bc4ef]`}>
                <Thumb id={p.id} alt={p.alt} size={272} />
              </span>
              <span className="mt-4 font-display text-2xl italic">{p.name}</span>
              <span className="mt-1 text-sm text-navy-700">{p.note}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
