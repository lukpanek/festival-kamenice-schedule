import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  loginWithCredentials,
  registerWithCredentials,
} from "@/app/login/actions";
import { AppNav } from "@/components/app-nav";
import { AuthCard } from "@/components/auth/auth-card";

export const metadata: Metadata = {
  title: "Vytvořit účet — KAMEN!CE",
  description: "Registrace k harmonogramu KAMEN!CE",
};

export default async function RegisterPage(props: {
  searchParams: Promise<{ callbackUrl?: string; error?: string; notice?: string }>;
}) {
  const searchParams = await props.searchParams;
  const session = await auth();
  const rawCb = searchParams.callbackUrl;
  const callbackUrl =
    typeof rawCb === "string" &&
    rawCb.startsWith("/") &&
    !rawCb.startsWith("//") &&
    !rawCb.includes("..")
      ? rawCb
      : "/";

  if (session) {
    redirect(callbackUrl);
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AppNav showBackLink={true} />

      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6">
        <AuthCard
          mode="register"
          callbackUrl={callbackUrl}
          error={searchParams.error}
          notice={searchParams.notice}
          loginAction={loginWithCredentials}
          registerAction={registerWithCredentials}
        />
      </main>
    </div>
  );
}
