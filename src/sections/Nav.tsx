import { company } from "../data/site";
import { MaskIcon } from "../components/Icon";
import { NavScrollState } from "../components/ScrollFX";

// Server Component; only the scrolled-backdrop toggle runs on the client.
export function Nav() {
  return (
    <header id="site-header" className="pointer-events-none fixed inset-x-0 top-0" style={{ zIndex: "var(--z-nav)" }}>
      <NavScrollState header="site-header" />
      <a href="#main" className="sr-only-focusable pointer-events-auto absolute left-4 top-3 rounded-full bg-navy px-4 py-2 text-sm text-white">
        Skip to content
      </a>
      <div className="nav-bar">
      <nav aria-label="Primary" className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 md:px-8">
        <a href="#top" className="pointer-events-auto flex min-h-11 items-center gap-3 font-display text-xl font-semibold text-navy no-underline">
          Oranthai
          <span aria-hidden className="hidden h-0.5 w-8 bg-accent sm:block" />
        </a>
        <a
          href={`tel:+91${company.phones[0]}`}
          className="pointer-events-auto inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white no-underline shadow-[0_6px_18px_-6px_rgb(30_99_198/0.6)] transition-transform duration-300 ease-out-soft hover:-translate-y-px active:scale-[0.98]"
        >
          <MaskIcon name="icon-phone" className="size-4" />
          Call us
        </a>
      </nav>
      </div>
    </header>
  );
}
