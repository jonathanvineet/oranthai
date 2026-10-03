import { brands, company, taglines } from "../data/site";
import { Heading } from "../components/Heading";
import { Logo } from "../components/Logo";
import { Art } from "../components/Icon";
import { Orb, Star } from "../components/Decor";
import { ScrollFX } from "../components/ScrollFX";
import { Ribbon } from "./TrustedBy";

// Server Component: the drift-in is attached by <ScrollFX preset="brands">.
export function TopBrands() {
  return (
    <section id="brands" aria-labelledby="brands-title" className="relative isolate overflow-hidden bg-[linear-gradient(180deg,#9fb7cf_0%,#b6cbdc_100%)] px-4 pb-40 pt-24 md:px-8 md:pb-48 md:pt-32">
      <ScrollFX root="brands" preset="brands" />
      <Ribbon>Lowest price</Ribbon>
      <Orb className="-left-20 bottom-24 size-80 bg-steel-100/40" />
      <Star className="right-[22%] top-[8%] size-5 text-sky-50" />
      <Star small className="left-[8%] top-[40%] size-6 text-sky-50" />

      <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-14 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-5">
          <Heading id="brands-title" kicker="Direct suppliers" before="Top" accent="brands" className="[&_.kicker]:text-navy [&_em]:text-white">
            <p className="mt-4 max-w-[36ch] font-medium text-navy">We buy direct from the makers, so you pay the lowest price.</p>
          </Heading>
          <p className="mt-6 font-display text-xl italic text-navy">{taglines.brands}.</p>

          <div className="mt-10 flex items-start gap-4">
            <Art name="icon-check" className="size-11 shrink-0" />
            <p className="m-0">
              <span className="block font-display text-2xl font-medium">Brand not listed?</span>
              <span className="text-navy">
                Ask us and we'll source it.{" "}
                <a href={`tel:+91${company.phones[0]}`} className="font-semibold text-navy underline decoration-accent decoration-2 underline-offset-4">
                  Call us
                </a>
              </span>
            </p>
          </div>
        </div>

        <div data-brands className="md:col-span-7 [perspective:1200px]">
          <ul className="m-0 grid list-none grid-cols-3 items-center justify-items-center gap-x-4 gap-y-9 p-0 [transform-style:preserve-3d] md:gap-x-10 md:gap-y-10">
            {brands.map((b) => (
              <li key={b.id} data-brand className="grid h-16 w-full place-items-center md:h-20">
                <Logo kind="brands" id={b.id} name={b.name} area={6400} maxW={180} maxH={72} sm={{ area: 3000, maxW: 104, maxH: 50 }} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
