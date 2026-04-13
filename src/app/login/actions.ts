"use server";

import { signIn } from "@/auth";
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
  const callbackUrl = safeInternalPath(formData.get("callbackUrl"));

  try {
    await signIn("credentials", {
      email,
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
