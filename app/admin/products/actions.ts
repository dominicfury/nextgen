"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { slugify, parsePriceToCents } from "@/lib/utils";

export type ProductFormState = {
  error?: string;
  fieldErrors?: Partial<Record<keyof ProductInput, string>>;
  values?: ProductInput;
};

type ProductInput = {
  name: string;
  slug: string;
  description: string;
  price: string;
  vehicleMake: string;
  vehicleModel: string;
  engine: string;
  tuningStage: string;
  fileFormat: string;
  status: "draft" | "published";
};

function readForm(formData: FormData): ProductInput {
  return {
    name: String(formData.get("name") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    price: String(formData.get("price") ?? "").trim(),
    vehicleMake: String(formData.get("vehicleMake") ?? "").trim(),
    vehicleModel: String(formData.get("vehicleModel") ?? "").trim(),
    engine: String(formData.get("engine") ?? "").trim(),
    tuningStage: String(formData.get("tuningStage") ?? "").trim(),
    fileFormat: String(formData.get("fileFormat") ?? "").trim(),
    status:
      String(formData.get("status") ?? "draft") === "published"
        ? "published"
        : "draft",
  };
}

function validate(
  input: ProductInput,
): { ok: true; priceCents: number; slug: string } | { ok: false; state: ProductFormState } {
  const fieldErrors: ProductFormState["fieldErrors"] = {};
  if (!input.name) fieldErrors.name = "Required.";
  let priceCents = 0;
  try {
    priceCents = parsePriceToCents(input.price);
    if (priceCents <= 0) fieldErrors.price = "Must be greater than $0.00.";
  } catch {
    fieldErrors.price = 'Invalid price. Use a number like "249" or "249.99".';
  }
  const slug = input.slug ? slugify(input.slug) : slugify(input.name);
  if (!slug) fieldErrors.slug = "Could not derive a slug — set one manually.";

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      state: {
        error: "Please fix the highlighted fields.",
        fieldErrors,
        values: input,
      },
    };
  }
  return { ok: true, priceCents, slug };
}

export async function createProduct(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const input = readForm(formData);
  const v = validate(input);
  if (!v.ok) return v.state;

  // Slug uniqueness — surface a nice error rather than a DB constraint blowup.
  const existing = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.slug, v.slug))
    .limit(1);
  if (existing.length > 0) {
    return {
      error: "A product with this slug already exists.",
      fieldErrors: { slug: "Already taken — pick a different slug." },
      values: input,
    };
  }

  await db.insert(products).values({
    name: input.name,
    slug: v.slug,
    description: input.description,
    priceCents: v.priceCents,
    vehicleMake: input.vehicleMake,
    vehicleModel: input.vehicleModel,
    engine: input.engine,
    tuningStage: input.tuningStage,
    fileFormat: input.fileFormat,
    status: input.status,
  });

  revalidatePath("/admin/products");
  revalidatePath("/store");
  redirect("/admin/products");
}

export async function updateProduct(
  id: number,
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const input = readForm(formData);
  const v = validate(input);
  if (!v.ok) return v.state;

  // Slug uniqueness across other rows.
  const collision = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.slug, v.slug))
    .limit(1);
  if (collision.length > 0 && collision[0].id !== id) {
    return {
      error: "A product with this slug already exists.",
      fieldErrors: { slug: "Already taken — pick a different slug." },
      values: input,
    };
  }

  await db
    .update(products)
    .set({
      name: input.name,
      slug: v.slug,
      description: input.description,
      priceCents: v.priceCents,
      vehicleMake: input.vehicleMake,
      vehicleModel: input.vehicleModel,
      engine: input.engine,
      tuningStage: input.tuningStage,
      fileFormat: input.fileFormat,
      status: input.status,
      updatedAt: new Date(),
    })
    .where(eq(products.id, id));

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}/edit`);
  revalidatePath("/store");
  revalidatePath(`/store/${v.slug}`);
  redirect("/admin/products");
}

export async function deleteProduct(id: number): Promise<void> {
  await db.delete(products).where(eq(products.id, id));
  revalidatePath("/admin/products");
  revalidatePath("/store");
}

export async function toggleProductStatus(id: number): Promise<void> {
  const [row] = await db
    .select({ status: products.status })
    .from(products)
    .where(eq(products.id, id))
    .limit(1);
  if (!row) return;
  await db
    .update(products)
    .set({
      status: row.status === "published" ? "draft" : "published",
      updatedAt: new Date(),
    })
    .where(eq(products.id, id));
  revalidatePath("/admin/products");
  revalidatePath("/store");
}
