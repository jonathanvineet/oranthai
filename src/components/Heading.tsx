import type { ReactNode } from "react";
import { Swash } from "./Decor";

/** Section heading: Fraunces with one italic accent word that carries the brochure swash. */
export function Heading({
  id,
  before,
  accent,
  after,
  kicker,
  className = "",
  level = 2,
  children,
}: {
  id?: string;
  before?: string;
  accent: string;
  after?: string;
  kicker?: string;
  className?: string;
  level?: 2 | 3;
  children?: ReactNode;
}) {
  const H = level === 2 ? "h2" : "h3";
  return (
    <div className={className}>
      {kicker && <p className="kicker mb-3">{kicker}</p>}
      <H id={id} className="m-0 text-[clamp(2.5rem,5.2vw,4.5rem)]" data-heading>
        {before && <>{before} </>}
        <em className="relative text-accent">
          {accent}
          <Swash className="-bottom-[0.05em] h-[0.18em] text-sky-300" />
        </em>
        {after && <> {after}</>}
      </H>
      {children}
    </div>
  );
}
