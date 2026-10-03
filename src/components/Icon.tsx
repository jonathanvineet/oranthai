// Brochure icons (extracted as SVG) tinted with currentColor through a CSS mask,
// so a single source file can sit on light or dark backgrounds.
export function MaskIcon({ name, className = "", label }: { name: string; className?: string; label?: string }) {
  const url = `url(/img/icons/${name}.svg)`;
  return (
    <span
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={`inline-block shrink-0 bg-current ${className}`}
      style={{ maskImage: url, WebkitMaskImage: url, maskSize: "contain", maskRepeat: "no-repeat", maskPosition: "center" }}
    />
  );
}

/** Full-colour brochure artwork (landmark badges, tags). */
export function Art({ name, className = "", alt = "" }: { name: string; className?: string; alt?: string }) {
  return <img src={`/img/icons/${name}.svg`} alt={alt} className={className} draggable={false} loading="lazy" decoding="async" />;
}
