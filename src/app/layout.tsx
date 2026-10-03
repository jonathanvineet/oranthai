import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { preload } from "react-dom";
import { fraunces, notoTamil, outfit } from "./fonts";
import { buildJsonLd } from "../data/jsonld";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Oranthai | Books, stationery and gifts in Chennai and Thanjavur",
  description:
    "Oranthai by Words Worth Book House & Stationeries Pvt. Ltd. Books, stationery, gifts and electronics, custom and bulk orders for schools and offices. Stores in Mogappair, Nungambakkam, Thanjavur and Orathanadu.",
  alternates: { canonical: "/" },
  icons: { icon: "/favicon.png", apple: "/apple-touch-icon.png" },
  openGraph: {
    type: "website",
    siteName: "Oranthai",
    locale: "en_IN",
    title: "Oranthai | Books, stationery and gifts",
    description: "Chennai to Thanjavur, always a chapter away. Four stores, custom and bulk orders, direct from brands.",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Oranthai wordmark above a long blue pencil and the Words Worth Book House seal" }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#d3e5f9",
};

// Runs before first paint: skips the intro if it was already seen this session, the visitor
// prefers reduced motion, or the URL has ?nointro. Must match the key in sections/Preloader.tsx.
const introGate = `try{if(sessionStorage.getItem("oranthai-intro-seen")==="1"||matchMedia("(prefers-reduced-motion: reduce)").matches||/[?&]nointro/.test(location.search))document.documentElement.setAttribute("data-nointro","")}catch(e){}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  // The seal is the largest element in the first viewport.
  preload("/img/logo/seal-320.avif", {
    as: "image",
    type: "image/avif",
    imageSrcSet: "/img/logo/seal-320.avif 320w, /img/logo/seal-640.avif 640w",
    imageSizes: "(min-width: 768px) 240px, 208px",
    fetchPriority: "high",
  });

  return (
    // data-nointro is set by the inline script before hydration, hence the suppressed warning.
    <html lang="en-IN" className={`${fraunces.variable} ${outfit.variable} ${notoTamil.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: introGate }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd()) }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
