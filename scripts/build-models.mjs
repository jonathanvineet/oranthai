// Builds the web-ready 3D models in public/models from the Sketchfab downloads in assets/models-src.
// Steps per model: copy to a temp dir, recolour textures toward the brand palette (where the source
// colours clash with it), downsize textures, convert legacy materials, then optimise with glTF-Transform
// (meshopt geometry, WebP textures, light simplification).
// usage: npm run models
import sharp from "sharp";
import { cp, mkdir, readdir, rm } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "assets/models-src");
const OUT = path.join(ROOT, "public/models");
const BRAND_BLUE_HUE = 214; // #2a6fd2 / #1e63c6
const PEACH_HUE = 24; // #f6bf9b

const inHue = (h, a, b) => (a <= b ? h >= a && h <= b : h >= a || h <= b);

/** Recolour rules: (h 0-360, s 0-1, v 0-1) -> new [h, s, v] or null to keep the pixel. */
const MODELS = [
  { name: "luxury-pen", dir: "luxury_pen", textureSize: 512 },
  {
    name: "pile-of-books",
    dir: "pile_of_books",
    textureSize: 512,
    // the brief rules out pink and purple: shift those covers to brand blue and peach
    recolor: {
      "purple_baseColor.jpeg": (h, s, v) => (inHue(h, 250, 320) ? [BRAND_BLUE_HUE, s, v] : null),
      "pink_baseColor.jpeg": (h, s, v) => (inHue(h, 300, 20) && s > 0.2 ? [PEACH_HUE, s * 0.8, Math.min(1, v * 1.08)] : null),
    },
  },
  {
    name: "gift-box",
    dir: "gift_box",
    textureSize: 512,
    // red wrapping -> brand blue; the gold ribbon and white snowflakes stay
    recolor: { "giftbox_baseColor.png": (h, s, v) => (inHue(h, 335, 18) && s > 0.35 ? [BRAND_BLUE_HUE, s * 0.9, v * 0.9] : null) },
  },
  { name: "apple-watch-ultra-2", dir: "apple-watch-ultra-2", textureSize: 512 },
];

function rgbToHsv(r, g, b) {
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return [h, max ? d / max : 0, max];
}

function hsvToRgb(h, s, v) {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return [r + m, g + m, b + m];
}

async function recolor(file, rule) {
  const { data, info } = await sharp(file).resize({ width: 2048, height: 2048, fit: "inside", withoutEnlargement: true }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  let changed = 0;
  for (let i = 0; i < data.length; i += 3) {
    const hsv = rgbToHsv(data[i] / 255, data[i + 1] / 255, data[i + 2] / 255);
    const next = rule(...hsv);
    if (!next) continue;
    const [r, g, b] = hsvToRgb(...next);
    data[i] = Math.round(r * 255);
    data[i + 1] = Math.round(g * 255);
    data[i + 2] = Math.round(b * 255);
    changed++;
  }
  const out = sharp(data, { raw: info });
  await (file.endsWith(".png") ? out.png() : out.jpeg({ quality: 92 })).toFile(file + ".tmp");
  await rm(file);
  await cp(file + ".tmp", file);
  await rm(file + ".tmp");
  return Math.round((changed / (info.width * info.height)) * 100);
}

const gt = (...args) => execFileSync("npx", ["gltf-transform", ...args], { cwd: ROOT, stdio: ["ignore", "pipe", "pipe"] }).toString();

await mkdir(OUT, { recursive: true });
const work = path.join(tmpdir(), "oranthai-models");
for (const m of MODELS) {
  const dir = path.join(work, m.name);
  await rm(dir, { recursive: true, force: true });
  await cp(path.join(SRC, m.dir), dir, { recursive: true });
  for (const [tex, rule] of Object.entries(m.recolor ?? {})) {
    const pct = await recolor(path.join(dir, "textures", tex), rule);
    console.log(`  ${m.name}: recoloured ${pct}% of ${tex}`);
  }
  // Downsize every other texture too, so glTF-Transform never decodes 8k images.
  const texDir = path.join(dir, "textures");
  for (const t of await readdir(texDir).catch(() => [])) {
    if (m.recolor?.[t]) continue;
    const f = path.join(texDir, t);
    const buf = await sharp(f).resize({ width: 2048, height: 2048, fit: "inside", withoutEnlargement: true }).toBuffer();
    await sharp(buf).toFile(f);
  }
  const input = path.join(dir, "scene.gltf");
  const out = path.join(OUT, `${m.name}.glb`);
  gt("optimize", input, out, "--compress", "meshopt", "--texture-compress", "webp", "--texture-size", String(m.textureSize), "--simplify", "true", "--simplify-ratio", "0.5", "--simplify-error", "0.001");
  console.log(`${m.name}.glb built`);
}
await rm(work, { recursive: true, force: true });
