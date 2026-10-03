import { clients, company, taglines } from "../data/site";
import { Heading } from "../components/Heading";
import { Logo } from "../components/Logo";
import { MaskIcon } from "../components/Icon";
import { Orb, Star } from "../components/Decor";
import { ScrollFX } from "../components/ScrollFX";

const ROUND = new Set(["loyola", "santhosh", "grace-world", "snowman"]);
// 2-3-2 on a six-column grid: each badge spans two columns, offset rows start one column in.
const START = ["col-start-2", "col-start-4", "col-start-1", "col-start-3", "col-start-5", "col-start-2", "col-start-4"];

/** Diagonal corner ribbon, as on the brochure. */
export function Ribbon({ children }: { children: string }) {
  return (
    <div aria-hidden className="pointer-events-none absolute -right-14 top-10 w-64 rotate-[18deg] bg-navy py-2 text-center text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-white shadow-[0_10px_24px_-12px_rgb(11_37_69/0.7)] md:-right-12 md:top-14">
      {children}
    </div>
  );
}

function ClientBadge({ id, name, start }: { id: string; name: string; start: string }) {
  return (
    <li data-client className={`col-span-2 ${start} flex flex-col items-center gap-3`}>
      <span className="grid size-24 place-items-center rounded-full bg-white shadow-[0_0_0_3px_#9cc3f0,0_18px_34px_-18px_rgb(11_37_69/0.6)] md:size-36">
        {ROUND.has(id) ? (
          <Logo kind="clients" id={id} name={name} area={1e6} maxW={128} maxH={128} className="size-[88%]! rounded-full" />
        ) : (
          <Logo kind="clients" id={id} name={name} area={5200} maxW={104} maxH={64} sm={{ area: 3400, maxW: 78, maxH: 46 }} />
        )}
      </span>
      <span className="max-w-[12ch] text-center text-sm font-semibold leading-tight text-navy">{name}</span>
    </li>
  );
}

// Server Component: the fly-in is attached by <ScrollFX preset="clients">.
export function TrustedBy() {
  return (
    <section id="clients" aria-labelledby="clients-title" className="relative isolate overflow-hidden bg-[linear-gradient(180deg,#e8ebf0_0%,#e5ecf6_55%,#f2eeeb_100%)] px-4 py-24 md:px-8 md:py-32">
      <ScrollFX root="clients" preset="clients" />
      <Ribbon>Corporate supplier</Ribbon>
      <Orb className="-left-28 top-16 size-72 bg-orb" />
      <Orb className="-right-24 bottom-0 size-80 bg-peach" />
      <Star className="left-[30%] top-[9%] size-5 text-sky-300" />

      <div className="mx-auto max-w-5xl text-center">
        <Heading id="clients-title" before="Trusted" accent="by">
          <p className="mx-auto mt-4 max-w-[40ch] font-medium text-navy">Companies and institutions that buy their supplies from us.</p>
        </Heading>

        <div data-clients className="mt-14 [perspective:1100px]">
          <ul className="mx-auto m-0 grid max-w-3xl list-none grid-cols-6 gap-x-2 gap-y-8 p-0 [transform-style:preserve-3d] md:gap-y-6">
            {clients.map((c, i) => (
              <ClientBadge key={c.id} {...c} start={START[i]} />
            ))}
          </ul>
        </div>

        <p className="mx-auto mt-14 font-display text-xl italic text-navy">{taglines.trusted}.</p>
        <p className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-navy">
          <span className="font-semibold">Supply your office.</span>
          <span className="inline-flex items-center gap-2">
            <MaskIcon name="icon-phone" className="size-4 text-accent" />
            Call
            <a href={`tel:+91${company.phones[0]}`} className="font-semibold text-navy underline decoration-accent decoration-2 underline-offset-4">
              {company.phones[0]}
            </a>
            for regular orders.
          </span>
        </p>
      </div>
    </section>
  );
}
