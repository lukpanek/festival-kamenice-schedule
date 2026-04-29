"use server";

import { signIn } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword, validatePassword } from "@/lib/passwords";
import { eq } from "drizzle-orm";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

function safeInternalPath(u: unknown): string {
  if (typeof u !== "string" || !u.startsWith("/") || u.startsWith("//")) {
    return "/";
  }
  if (u.includes("..")) return "/";
  return u;
}

function isNextRedirect(e: unknown): boolean {
  return (
    typeof e === "object" &&
    e !== null &&
    "digest" in e &&
    typeof (e as { digest: unknown }).digest === "string" &&
    String((e as { digest: string }).digest).startsWith("NEXT_REDIRECT")
  );
}

export async function loginWithCredentials(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");
  const callbackUrl = safeInternalPath(formData.get("callbackUrl"));

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl,
    });
  } catch (error) {
    if (isNextRedirect(error)) throw error;
    if (error instanceof AuthError) {
      redirect(
        `/login?error=invalid&callbackUrl=${encodeURIComponent(callbackUrl)}`
      );
    }
    throw error;
  }
}

function redirectToAuthError(code: string, callbackUrl: string, path: "/login" | "/register") {
  redirect(
    `${path}?error=${encodeURIComponent(code)}&callbackUrl=${encodeURIComponent(callbackUrl)}`
  );
}

export async function registerWithCredentials(formData: FormData) {
  const callbackUrl = safeInternalPath(formData.get("callbackUrl"));
  const rawName = formData.get("name");
  const rawEmail = formData.get("email");
  const rawPassword = formData.get("password");
  const rawPasswordConfirmation = formData.get("passwordConfirmation");

  const name = typeof rawName === "string" ? rawName.trim() : "";
  const email =
    typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";
  const password = typeof rawPassword === "string" ? rawPassword : "";
  const passwordConfirmation =
    typeof rawPasswordConfirmation === "string" ? rawPasswordConfirmation : "";

  if (!name || !email || !password || !passwordConfirmation) {
    redirectToAuthError("missingFields", callbackUrl, "/register");
  }

  if (!validatePassword(password)) {
    redirectToAuthError("passwordTooShort", callbackUrl, "/register");
  }

  if (password !== passwordConfirmation) {
    redirectToAuthError("passwordMismatch", callbackUrl, "/register");
  }

  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingUser) {
    redirectToAuthError("emailTaken", callbackUrl, "/register");
  }

  const [createdUser] = await db
    .insert(users)
    .values({
      email,
      name,
      passwordHash: hashPassword(password),
      role: "visitor",
    })
    .returning();

  await signIn("credentials", {
    email: createdUser.email,
    password,
    redirectTo: callbackUrl,
  });
}
