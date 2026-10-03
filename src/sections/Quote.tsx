import { kural } from "../data/site";
import { Orb, Star } from "../components/Decor";
import { ScrollFX } from "../components/ScrollFX";

// Server Component: static markup; the word-by-word reveal is attached by <ScrollFX preset="quote">.
export function Quote() {
  return (
    <section id="kural" aria-label={`Thirukkural ${kural.number}`} className="relative isolate overflow-hidden bg-[linear-gradient(180deg,#ecedef_0%,#f6ede4_100%)] px-4 py-28 md:py-40">
      <ScrollFX root="kural" preset="quote" />
      <Orb className="-right-32 -top-20 size-80 bg-peach" />
      <Orb className="-bottom-28 -left-24 size-72 bg-orb" />
      <Star className="left-[12%] top-[20%] size-5 text-sky-300" />
      <Star small className="bottom-[16%] right-[14%] size-6 text-sky-300" />

      <figure className="relative mx-auto m-0 max-w-4xl text-center" data-kural>
        <span
          data-quote-mark
          aria-hidden
          className="absolute -left-1 -top-20 font-display text-[11rem] leading-none text-accent/70 md:-left-16 md:-top-32 md:text-[20rem]"
        >
          “
        </span>
        <blockquote lang="ta" className="m-0 font-tamil text-[clamp(1.25rem,4.4vw,3.25rem)] font-medium leading-[1.6] text-navy">
          {kural.tamil.map((line) => (
            <span key={line} className="block">
              {line.split(" ").map((w, i) => (
                <span key={i} className="inline-block overflow-hidden px-[0.14em] pb-[0.12em] pt-[0.18em] align-bottom">
                  <span data-word className="inline-block">
                    {w}
                  </span>
                </span>
              ))}
            </span>
          ))}
        </blockquote>
        <span
          data-quote-mark
          aria-hidden
          className="absolute -bottom-36 -right-1 font-display text-[11rem] leading-none text-accent/70 md:-bottom-56 md:-right-16 md:text-[20rem]"
        >
          ”
        </span>
        <p data-english lang="en" className="mx-auto mt-8 max-w-[34ch] font-display text-xl italic leading-snug text-navy-700 md:text-2xl">
          {kural.english}
        </p>
        <figcaption data-cite className="kicker mt-6 text-navy-700">
          Thirukkural {kural.number}
        </figcaption>
      </figure>
    </section>
  );
}
