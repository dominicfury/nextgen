import "dotenv/config";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { eq } from "drizzle-orm";
import { products } from "../lib/db/schema";

type Seed = {
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  vehicleMake: string;
  vehicleModel: string;
  engine: string;
  tuningStage: string;
  fileFormat: string;
  status: "draft" | "published";
};

const SEEDS: Seed[] = [
  {
    name: "6.7L Cummins Stage 1 — Daily Driver",
    slug: "67-cummins-stage-1-daily",
    description:
      "Smooth, reliable power gains for your daily-driven Ram. Cleans up shift quality, sharpens throttle response, and adds confident passing power without giving up reliability.\n\nGood for: stock turbo, stock injectors, towing under 14k lb.",
    priceCents: 24900,
    vehicleMake: "Ram",
    vehicleModel: "2500/3500",
    engine: "6.7L Cummins",
    tuningStage: "Stage 1",
    fileFormat: "EFI Live",
    status: "published",
  },
  {
    name: "6.7L Cummins Stage 2 — Hot Tune",
    slug: "67-cummins-stage-2-hot",
    description:
      "More aggressive timing, fueling, and rail pressure tables. Wakes up the truck for spirited driving and lighter towing duty.\n\nRequires: 100hp+ injectors recommended for max benefit. Stock turbo OK.",
    priceCents: 32900,
    vehicleMake: "Ram",
    vehicleModel: "2500/3500",
    engine: "6.7L Cummins",
    tuningStage: "Stage 2",
    fileFormat: "EFI Live",
    status: "published",
  },
  {
    name: "L5P Duramax Stage 1 — Tow & Daily",
    slug: "l5p-duramax-stage-1",
    description:
      "Conservative power adder with a focus on towing manners. Smoother shifts and improved EGT control under load.",
    priceCents: 29900,
    vehicleMake: "Chevrolet",
    vehicleModel: "Silverado 2500/3500",
    engine: "L5P Duramax",
    tuningStage: "Stage 1",
    fileFormat: "MPVI3 / EZ Lynk",
    status: "published",
  },
  {
    name: "L5P Duramax Race Tune",
    slug: "l5p-duramax-race",
    description:
      "Maximum effort calibration for off-road / track use. Pulls hard top to bottom. Not emissions-compliant — race use only.",
    priceCents: 39900,
    vehicleMake: "Chevrolet",
    vehicleModel: "Silverado 2500/3500",
    engine: "L5P Duramax",
    tuningStage: "Race",
    fileFormat: "MPVI3",
    status: "published",
  },
  {
    name: "6.7L Power Stroke Stage 1",
    slug: "67-powerstroke-stage-1",
    description:
      "Reliable mid-power bump for the Ford 6.7L. Improved throttle response, smoother shifts, better fuel economy at cruise.",
    priceCents: 27900,
    vehicleMake: "Ford",
    vehicleModel: "F-250/F-350",
    engine: "6.7L Power Stroke",
    tuningStage: "Stage 1",
    fileFormat: "SCT / HP Tuners",
    status: "published",
  },
  {
    name: "6.7L Power Stroke Tow Pro",
    slug: "67-powerstroke-tow-pro",
    description:
      "Calibrated specifically for heavy towing. Lower EGTs, firmer shifts under load, better gear strategy on grades.",
    priceCents: 29900,
    vehicleMake: "Ford",
    vehicleModel: "F-250/F-350",
    engine: "6.7L Power Stroke",
    tuningStage: "Tow",
    fileFormat: "SCT",
    status: "draft",
  },
];

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) throw new Error("TURSO_DATABASE_URL is required.");

  const client = createClient({
    url,
    ...(process.env.TURSO_AUTH_TOKEN
      ? { authToken: process.env.TURSO_AUTH_TOKEN }
      : {}),
  });
  const db = drizzle(client);

  let inserted = 0;
  let skipped = 0;
  for (const seed of SEEDS) {
    const existing = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.slug, seed.slug))
      .limit(1);
    if (existing.length > 0) {
      skipped++;
      continue;
    }
    await db.insert(products).values(seed);
    inserted++;
  }

  console.log(`Seeded ${inserted} product(s). Skipped ${skipped} existing.`);
  client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
