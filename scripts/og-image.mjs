// Renders public/og.jpg from the running dev server (npm run dev), hero with the pencil landed.
import { chromium } from "playwright";
import sharp from "sharp";
const b = await chromium.launch({ args: ["--use-angle=swiftshader","--enable-unsafe-swiftshader"] });
const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await p.goto("http://localhost:3000/?nointro", { waitUntil: "networkidle" });
await p.addStyleTag({ content: "header{display:none!important}" });
await p.evaluate(() => scrollTo(0, 470)); // pencil just landed on the band
await p.waitForTimeout(2500);
const buf = await p.screenshot();
await sharp(buf).jpeg({ quality: 84, mozjpeg: true }).toFile("public/og.jpg");
await b.close();
