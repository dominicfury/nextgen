"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { consultationRequests } from "@/lib/db/schema";

export async function updateConsultationStatus(
  id: number,
  status: "new" | "contacted" | "closed",
): Promise<void> {
  await db
    .update(consultationRequests)
    .set({ status })
    .where(eq(consultationRequests.id, id));
  revalidatePath("/admin/consultations");
  revalidatePath("/admin");
}

export async function deleteConsultation(id: number): Promise<void> {
  await db.delete(consultationRequests).where(eq(consultationRequests.id, id));
  revalidatePath("/admin/consultations");
  revalidatePath("/admin");
}
