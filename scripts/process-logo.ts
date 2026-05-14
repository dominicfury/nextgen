import path from "node:path";
import sharp from "sharp";

/**
 * Strip the white background from the source logo into a transparent PNG.
 * Uses a soft tolerance so anti-aliased edges fade smoothly instead of
 * leaving a hard halo.
 *
 * Pixels with min(R,G,B) >= white-threshold become fully transparent.
 * Pixels with min(R,G,B) <= solid-threshold stay fully opaque.
 * Everything in between gets a proportional alpha.
 */

const SRC = path.resolve("Logo.png");
const DST = path.resolve("public/logo.png");

// Pixels lighter than this are background (fully transparent).
const WHITE_THRESHOLD = 245;
// Pixels darker than this are unambiguously foreground (fully opaque).
const SOLID_THRESHOLD = 220;

async function main() {
  const img = sharp(SRC).ensureAlpha();
  const { data, info } = await img
    .raw()
    .toBuffer({ resolveWithObject: true });

  if (info.channels !== 4) {
    throw new Error(`Expected RGBA, got ${info.channels} channels.`);
  }

  const out = Buffer.from(data); // copy
  const range = WHITE_THRESHOLD - SOLID_THRESHOLD;

  for (let i = 0; i < out.length; i += 4) {
    const r = out[i];
    const g = out[i + 1];
    const b = out[i + 2];
    const m = Math.min(r, g, b);

    if (m >= WHITE_THRESHOLD) {
      out[i + 3] = 0; // fully transparent
    } else if (m > SOLID_THRESHOLD) {
      // Fade transparency proportionally near edges.
      const t = (m - SOLID_THRESHOLD) / range; // 0..1
      out[i + 3] = Math.round(255 * (1 - t));
    }
    // else: keep alpha as-is (fully opaque)
  }

  await sharp(out, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png({ compressionLevel: 9 })
    .toFile(DST);

  console.log(`Wrote ${DST} (${info.width}×${info.height})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
