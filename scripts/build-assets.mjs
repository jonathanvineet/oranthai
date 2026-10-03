// Turns assets/extracted (pulled from the brochure PDF) into web-ready images in public/img
// and writes src/data/logo-metrics.json so logo walls can equalise visual size by area.
import sharp from "sharp";
import { mkdir, readdir, writeFile, copyFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "assets/extracted");
const OUT = path.join(ROOT, "public/img");

const ROUND_CLIENTS = new Set(["loyola", "santhosh", "grace-world", "snowman"]);
const KEYED_CLIENTS = new Set(["starbox", "canara-bank", "sbi"]);

async function photoSet(dir) {
  await mkdir(path.join(OUT, dir), { recursive: true });
  for (const f of await readdir(path.join(SRC, dir))) {
    const name = path.parse(f).name;
    for (const w of [240, 480]) {
      const img = sharp(path.join(SRC, dir, f)).resize(w, w, { fit: "cover" });
      await img.clone().avif({ quality: 52 }).toFile(path.join(OUT, dir, `${name}-${w}.avif`));
      await img.clone().webp({ quality: 74 }).toFile(path.join(OUT, dir, `${name}-${w}.webp`));
    }
  }
}

// Removes a flat white background: alpha from distance to white, colour un-premultiplied.
function keyWhite(data, channels) {
  for (let i = 0; i < data.length; i += channels) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const d = 255 - Math.min(r, g, b);
    const a = Math.min(1, Math.max(0, (d - 10) / 60));
    if (a > 0) {
      data[i] = Math.max(0, Math.min(255, (r - 255 * (1 - a)) / a));
      data[i + 1] = Math.max(0, Math.min(255, (g - 255 * (1 - a)) / a));
      data[i + 2] = Math.max(0, Math.min(255, (b - 255 * (1 - a)) / a));
    }
    data[i + 3] = Math.round(a * (channels === 4 ? data[i + 3] : 255));
  }
}

function circleMask(size) {
  const r = size / 2 - 1;
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="#fff"/></svg>`,
  );
}

// Fraction of the trimmed bounding box covered by ink, used to soften area equalisation.
async function inkDensity(buf) {
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let ink = 0;
  for (let i = 3; i < data.length; i += 4) ink += data[i] / 255;
  return { w: info.width, h: info.height, density: ink / (info.width * info.height) };
}

async function logoSet(dir, prepare) {
  await mkdir(path.join(OUT, dir), { recursive: true });
  const metrics = {};
  for (const f of await readdir(path.join(SRC, dir))) {
    const name = path.parse(f).name;
    let buf = await prepare(name, path.join(SRC, dir, f));
    buf = await sharp(buf).trim({ threshold: 1 }).png().toBuffer();
    const m = await inkDensity(buf);
    metrics[name] = { aspect: +(m.w / m.h).toFixed(3), density: +m.density.toFixed(3) };
    const h = Math.min(m.h, 240);
    await sharp(buf).resize({ height: h }).webp({ quality: 88, alphaQuality: 100 }).toFile(path.join(OUT, dir, `${name}.webp`));
    await sharp(buf).resize({ height: h }).png({ compressionLevel: 9 }).toFile(path.join(OUT, dir, `${name}.png`));
  }
  return metrics;
}

async function main() {
  await mkdir(OUT, { recursive: true });
  await photoSet("products");
  await photoSet("custom");

  const brands = await logoSet("brands", async (_n, p) => sharp(p).ensureAlpha().png().toBuffer());

  const clients = await logoSet("clients", async (name, p) => {
    const img = sharp(p).ensureAlpha();
    const { width } = await img.metadata();
    if (ROUND_CLIENTS.has(name)) {
      return img.composite([{ input: circleMask(width), blend: "dest-in" }]).png().toBuffer();
    }
    if (KEYED_CLIENTS.has(name)) {
      const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
      keyWhite(data, info.channels);
      return sharp(data, { raw: info }).png().toBuffer();
    }
    return img.png().toBuffer();
  });

  await mkdir(path.join(OUT, "logo"), { recursive: true });
  const seal = sharp(path.join(SRC, "logo/wordsworth-seal.png")).ensureAlpha();
  const { width } = await seal.metadata();
  const masked = await seal.composite([{ input: circleMask(width), blend: "dest-in" }]).png().toBuffer();
  for (const w of [320, 640]) {
    await sharp(masked).resize(w).webp({ quality: 86 }).toFile(path.join(OUT, `logo/seal-${w}.webp`));
    await sharp(masked).resize(w).avif({ quality: 60 }).toFile(path.join(OUT, `logo/seal-${w}.avif`));
  }
  await sharp(masked).resize(64).png({ palette: true }).toFile(path.join(ROOT, "public/favicon.png"));
  await sharp(masked).resize(180).png({ palette: true }).toFile(path.join(ROOT, "public/apple-touch-icon.png"));

  await mkdir(path.join(OUT, "icons"), { recursive: true });
  for (const f of await readdir(path.join(SRC, "icons"))) await copyFile(path.join(SRC, "icons", f), path.join(OUT, "icons", f));

  await mkdir(path.join(ROOT, "src/data"), { recursive: true });
  await writeFile(path.join(ROOT, "src/data/logo-metrics.json"), JSON.stringify({ brands, clients }, null, 2));
  console.log("assets built");
}

main();
