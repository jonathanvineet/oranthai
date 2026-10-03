// Section screenshots at 1440 and 390 wide.
// usage: node scripts/shoot.mjs <name> <step> [step...]
//   step = "y:<px>" absolute scroll | "#id" scroll element top to viewport top | "#id@<px>" with offset (may be negative) | "intro:<ms>" capture intro after ms
// env: URL (default http://localhost:3000), OUT (default ./shots), REDUCED=1, WIDTHS=1440,390
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const [name = "shot", ...steps] = process.argv.slice(2);
const URL_ = process.env.URL ?? "http://localhost:3000";
const OUT = process.env.OUT ?? "shots";
const widths = (process.env.WIDTHS ?? "1440,390").split(",").map(Number);
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
for (const w of widths) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: w < 600 ? 844 : 900 },
    deviceScaleFactor: 1,
    reducedMotion: process.env.REDUCED ? "reduce" : "no-preference",
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  const intro = steps.find((s) => s.startsWith("intro:"));
  await page.goto(intro ? URL_ : `${URL_}?nointro`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  let i = 0;
  for (const step of steps.length ? steps : ["y:0"]) {
    if (step.startsWith("intro:")) {
      await page.waitForTimeout(Number(step.slice(6)));
    } else if (step.startsWith("y:")) {
      await page.evaluate((y) => window.scrollTo(0, y), Number(step.slice(2)));
      await page.waitForTimeout(1400);
    } else if (step.startsWith("#")) {
      const [sel, off = "0"] = step.split("@");
      await page.evaluate(
        ([s, o]) => {
          const el = document.querySelector(s);
          const pin = el?.parentElement?.classList.contains("pin-spacer") ? el.parentElement : el;
          window.scrollTo(0, pin.getBoundingClientRect().top + window.scrollY + Number(o));
        },
        [sel, off],
      );
      await page.waitForTimeout(1600);
    }
    const file = `${OUT}/${name}-${w}-${String(i++).padStart(2, "0")}.png`;
    await page.screenshot({ path: file });
    console.log(file);
  }
  if (errors.length) console.log(`[${w}] errors:\n  ` + [...new Set(errors)].join("\n  "));
  await ctx.close();
}
await browser.close();
