// Pre-renders the neon SVG symbols (glow filters included) to raster WebP
// sprites. The live `feGaussianBlur` glow in the SVGs is very expensive to
// rasterise every frame while the reels scroll, which was dropping frames.
// Baked bitmaps are just blitted by the GPU, so scrolling becomes free.
//
// Run with:  npm run bake-symbols
import sharp from "sharp";
import { readdir, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const SRC = fileURLToPath(new URL("../src/assets/symbols", import.meta.url));
const OUT = fileURLToPath(new URL("../src/assets/symbols-baked", import.meta.url));

// Render comfortably above on-screen size (~225px CSS, 2x DPR) for crispness.
const SIZE = 512;

await mkdir(OUT, { recursive: true });

const files = (await readdir(SRC)).filter((f) => f.endsWith(".svg"));

for (const file of files) {
  const name = path.basename(file, ".svg");
  const outPath = path.join(OUT, `${name}.webp`);

  // High density renders the SVG (and its filters) at high resolution, then we
  // downscale to SIZE for clean anti-aliasing.
  await sharp(path.join(SRC, file), { density: 300 })
    .resize(SIZE, SIZE, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .webp({ quality: 90, effort: 5 })
    .toFile(outPath);

  console.log(`baked ${name}.webp`);
}

console.log(`\nDone: ${files.length} symbols -> ${OUT}`);
