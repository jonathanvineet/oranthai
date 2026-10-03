import { forwardRef, type ReactNode } from "react";
import { MaskIcon } from "./Icon";

type Segment = { icon: string; label: string; italic: string; hideSm?: boolean };

function Segments({ items }: { items: Segment[] }) {
  return (
    <>
      {items.map((s) => (
        <span key={s.label} className={`flex items-center gap-2.5 ${s.hideSm ? "max-md:hidden" : ""}`}>
          <MaskIcon name={s.icon} className="size-3.5 text-sky-200" />
          <span>{s.label}</span>
          <span aria-hidden className="text-sky-200 max-md:hidden">+</span>
          <i className="max-md:hidden">{s.italic}</i>
        </span>
      ))}
    </>
  );
}

/** The brochure's long blue pencil, used as the first-half divider. */
export const PencilBand = forwardRef<HTMLDivElement, { className?: string; children?: ReactNode }>(function PencilBand({ className = "" }, ref) {
  return (
    <div ref={ref} className={`band band--pencil ${className}`}>
      <span className="band__eraser" aria-hidden />
      <span className="band__ferrule" aria-hidden />
      <p className="band__body m-0">
        <Segments
          items={[
            { icon: "band-icon-pin", label: "Chennai to Thanjavur", italic: "always a chapter away" },
            { icon: "band-icon-handshake", label: "Trusted partner", italic: "every order a good story", hideSm: true },
          ]}
        />
      </p>
      <span className="band__tip" aria-hidden />
    </div>
  );
});

/** The navy and blue fountain pen, used as the second-half divider. */
export const PenBand = forwardRef<HTMLDivElement, { className?: string }>(function PenBand({ className = "" }, ref) {
  return (
    <div ref={ref} className={`band band--pen ${className}`}>
      <span className="band__cap" aria-hidden />
      <span className="band__ring" aria-hidden />
      <p className="band__body m-0">
        <Segments
          items={[
            { icon: "band-icon-star", label: "Made to order", italic: "your name, your style" },
            { icon: "band-icon-check", label: "Direct from brands", italic: "the lowest prices", hideSm: true },
          ]}
        />
      </p>
      <span className="band__grip" aria-hidden />
      <span className="band__nib" aria-hidden />
    </div>
  );
});
