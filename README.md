# Oranthai

Scroll-driven 3D site for Oranthai (Words Worth Book House & Stationeries Pvt. Ltd).
Next.js (App Router) + React 19, Tailwind v4, three.js via @react-three/fiber and drei, GSAP + ScrollTrigger, Lenis.

## Commands

```bash
npm install
npm run dev          # http://localhost:3000  (append ?nointro to skip the intro)
npm run build        # production build; the page is prerendered as static HTML
npm start            # serve the production build on :3000
npm run assets       # rebuild public/img from assets/extracted (logos, photos, brochure icons)
npm run og           # re-render public/og.jpg from a running server
npm run shoot -- name y:0 "#stores@800"   # Playwright screenshots at 1440 and 390
scripts/lh.sh http://localhost:3000/ /tmp/lh.json   # Lighthouse (mobile) summary
```

Set `NEXT_PUBLIC_SITE_URL` to the production origin so Open Graph and canonical URLs are absolute.

## Structure

- `src/app/` layout (metadata, fonts via next/font, JSON-LD, intro gate) and the page.
- `src/ClientShell.tsx` client boundary: motion environment, CSS intro, lazy WebGL stage.
- `src/sections/` one file per section. Quote, Trusted by, Top brands, footer and nav are Server
  Components with small client animation leaves (`components/ScrollFX.tsx`); Hero, Stores,
  Products and Custom orders are client components.
- `src/three/` WebGL scenes, all drawn into one shared canvas through drei `<View>`.
- `src/data/site.ts` every company fact on the site. Nothing else should introduce claims.
