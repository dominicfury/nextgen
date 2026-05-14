"use server";

import { destroyCurrentSession } from "@/lib/auth";

export async function signOut(): Promise<void> {
  await destroyCurrentSession();
}
