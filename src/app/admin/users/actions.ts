"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, not, sql } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import {
  hashPassword,
  MIN_PASSWORD_LENGTH,
  validatePassword,
} from "@/lib/passwords";
import { isUserRole } from "@/lib/user-roles";

async function requireAdmin() {
  const session = await auth();

  if (session?.user?.role !== "admin") {
    throw new Error("Unauthorized");
  }

  return session;
}

function buildUsersRedirect(status?: string, error?: string) {
  const search = new URLSearchParams();
  if (status) search.set("status", status);
  if (error) search.set("error", error);
  const suffix = search.size ? `?${search.toString()}` : "";
  return `/admin/users${suffix}`;
}

async function countOtherAdmins(userId: string) {
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(users)
    .where(and(eq(users.role, "admin"), not(eq(users.id, userId))));

  return result[0]?.count ?? 0;
}

export async function updateUserRoleAction(formData: FormData) {
  await requireAdmin();

  const userId = formData.get("userId");
  const role = formData.get("role");

  if (typeof userId !== "string" || typeof role !== "string" || !isUserRole(role)) {
    redirect(buildUsersRedirect(undefined, "invalidRole"));
  }

  const targetUser = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!targetUser) {
    redirect(buildUsersRedirect(undefined, "userNotFound"));
  }

  if (targetUser.role === "admin" && role !== "admin") {
    const remainingAdmins = await countOtherAdmins(targetUser.id);
    if (remainingAdmins === 0) {
      redirect(buildUsersRedirect(undefined, "lastAdmin"));
    }
  }

  await db.update(users).set({ role }).where(eq(users.id, targetUser.id));
  revalidatePath("/admin/users");
  redirect(buildUsersRedirect("roleUpdated"));
}

export async function updateUserPasswordAction(formData: FormData) {
  await requireAdmin();

  const userId = formData.get("userId");
  const password = formData.get("password");

  if (typeof userId !== "string" || typeof password !== "string") {
    redirect(buildUsersRedirect(undefined, "missingPassword"));
  }

  if (!validatePassword(password)) {
    redirect(buildUsersRedirect(undefined, "passwordTooShort"));
  }

  const targetUser = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!targetUser) {
    redirect(buildUsersRedirect(undefined, "userNotFound"));
  }

  await db
    .update(users)
    .set({ passwordHash: hashPassword(password) })
    .where(eq(users.id, targetUser.id));

  revalidatePath("/admin/users");
  redirect(buildUsersRedirect("passwordUpdated"));
}

export { MIN_PASSWORD_LENGTH };
