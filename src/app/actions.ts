"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { userSchedule } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function signInAction() {
  const { signIn } = await import("@/auth");
  await signIn();
}

export async function signOutAction() {
  const { signOut } = await import("@/auth");
  await signOut();
}

export async function toggleScheduleAction(perfId: string) {
  const session = await auth();
  if (!session?.user?.id) return;

  const userId = session.user.id;

  const existing = await db
    .select()
    .from(userSchedule)
    .where(and(eq(userSchedule.userId, userId), eq(userSchedule.performanceId, perfId)));

  if (existing.length > 0) {
    await db
      .delete(userSchedule)
      .where(and(eq(userSchedule.userId, userId), eq(userSchedule.performanceId, perfId)));
  } else {
    await db.insert(userSchedule).values({ userId, performanceId: perfId });
  }
}
