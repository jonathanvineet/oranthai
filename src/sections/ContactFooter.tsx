import { branches, company } from "../data/site";
import { MaskIcon } from "../components/Icon";
import { ScrollFX } from "../components/ScrollFX";

// CC-BY-4.0 attribution for the 3D models (see public/models/CREDITS.txt).
const MODEL_CREDITS = [
  { title: "Apple Watch Ultra 2", author: "polyman", url: "https://sketchfab.com/3d-models/apple-watch-ultra-2-f33263c457664b43909200c5ed5e6fa2" },
  { title: "Luxury Pen", author: "dylanheyes", url: "https://sketchfab.com/3d-models/luxury-pen-11c3a825d8cd4c16ab2edc3f5613fd84" },
  { title: "Pile of books", author: "Brenwltrs", url: "https://sketchfab.com/3d-models/pile-of-books-822e51eef741496d926bea1fbc32db7b" },
  { title: "Gift Box", author: "MaX3Dd", url: "https://sketchfab.com/3d-models/gift-box-33bb8031d7ac40758575835cec277761" },
];

// Server Component: the signature and bubble animations are attached by <ScrollFX preset="footer">.
export function ContactFooter() {
  return (
    <footer id="contact" aria-labelledby="contact-title" className="relative -mt-24 text-sky-100 md:-mt-32">
      <ScrollFX root="contact" preset="footer" />
      <svg aria-hidden viewBox="0 0 1440 120" preserveAspectRatio="none" className="block h-24 w-full md:h-32">
        <path d="M0 120V64C240 8 480 0 720 0s480 8 720 64v56z" fill="#0b2545" />
      </svg>
      <div className="bg-navy px-4 pb-10 pt-4 md:px-8">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-12 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-5">
            <h2 id="contact-title" className="m-0 text-[clamp(2.25rem,4vw,3.25rem)] text-white">
              Visit or <em className="text-sky-300">call</em>
            </h2>
            <div data-signature className="relative mt-6 w-[min(100%,340px)]">
              <svg viewBox="0 0 620 160" className="w-full overflow-visible" role="img" aria-label="Oranthai, signed">
                <defs>
                  <clipPath id="signature-clip">
                    <rect data-signature-clip x="0" y="0" width="620" height="160" />
                  </clipPath>
                </defs>
                <text x="8" y="112" clipPath="url(#signature-clip)" className="font-display italic" style={{ fontSize: 128, fill: "#e6f0fb", fontVariationSettings: '"opsz" 144, "SOFT" 100' }}>
                  Oranthai
                </text>
                <path
                  data-swash
                  d="M20 140C150 122 300 150 450 132c60-7 110-10 150-6"
                  fill="none"
                  stroke="#a9c9ef"
                  strokeWidth="5"
                  strokeLinecap="round"
                  pathLength={1}
                  style={{ strokeDasharray: 1, strokeDashoffset: 0 }}
                />
              </svg>
            </div>
            <p className="mt-6 max-w-[40ch] text-sm text-sky-200">{company.legalName}</p>
          </div>

          <div className="relative md:col-span-7">
            <span data-bubble aria-hidden className="absolute -top-10 right-0 grid h-14 w-32 place-items-center md:-top-6 md:right-4">
              <img src="/img/icons/bubble-call.svg" alt="" className="absolute inset-0 size-full" />
              <span className="relative -mt-1.5 font-display text-lg italic text-white">Call us!</span>
            </span>

            <ul className="m-0 flex list-none flex-col gap-1 p-0">
              {company.phones.map((ph) => (
                <li key={ph}>
                  <a href={`tel:+91${ph}`} className="group inline-flex items-center gap-4 rounded-full py-1 font-display text-[clamp(2rem,4.4vw,3.25rem)] font-medium tracking-tight text-white no-underline">
                    <span className="grid size-11 place-items-center rounded-full bg-accent transition-transform duration-300 group-hover:-rotate-12">
                      <MaskIcon name="icon-phone" className="size-5 text-white" />
                    </span>
                    <span className="decoration-sky-300 decoration-2 underline-offset-8 group-hover:underline">{ph}</span>
                  </a>
                </li>
              ))}
            </ul>

            <a href={`mailto:${company.email}`} className="mt-5 inline-flex items-center gap-3 text-lg font-medium text-sky-100 underline decoration-sky-300/60 underline-offset-4 hover:decoration-sky-300">
              <MaskIcon name="icon-mail" className="size-5 text-sky-300" />
              {company.email}
            </a>

            <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2">
              <address className="not-italic">
                <p className="m-0 mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">{company.office.label}</p>
                {company.office.lines.map((l) => (
                  <span key={l} className="block">
                    {l}
                  </span>
                ))}
              </address>
              <div>
                <p className="m-0 mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">Our stores</p>
                <ul className="m-0 list-none p-0">
                  {branches.map((b) => (
                    <li key={b.id}>
                      {b.name}, {b.region}
                      {b.headOffice && <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-white">Head office</span>}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-14 flex max-w-[1200px] flex-col gap-2 border-t border-white/15 pt-6 text-sm text-sky-200 sm:flex-row sm:justify-between">
          <span>GST No: {company.gst}</span>
          <span>Oranthai is the brand of {company.legalName}</span>
        </div>
        <p className="mx-auto mt-3 max-w-[1200px] text-xs text-sky-200/80">
          3D models from Sketchfab, licensed{" "}
          <a className="underline underline-offset-2" href="http://creativecommons.org/licenses/by/4.0/" rel="noopener license" target="_blank">
            CC BY 4.0
          </a>
          :{" "}
          {MODEL_CREDITS.map((c, i) => (
            <span key={c.title}>
              {i > 0 && ", "}
              <a className="underline underline-offset-2" href={c.url} rel="noopener" target="_blank">
                “{c.title}”
              </a>{" "}
              by {c.author}
            </span>
          ))}
          .
        </p>
      </div>
    </footer>
  );
}
