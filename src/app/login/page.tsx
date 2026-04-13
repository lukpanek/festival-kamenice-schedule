import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, LogIn } from "lucide-react";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginWithCredentials } from "@/app/login/actions";

export const metadata: Metadata = {
  title: "Přihlášení — KAMEN!CE",
  description: "Přihlášení k harmonogramu KAMEN!CE",
};

export default async function LoginPage(props: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
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

  const showError = searchParams.error === "invalid";

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container flex h-14 items-center justify-between gap-4">
          <Link
            href="/"
            className="font-heading text-5xl uppercase h-11 leading-none shrink-0"
          >
            KAMEN!CE
          </Link>
          <Button variant="ghost" size="sm" asChild className="touch-manipulation">
            <Link href="/" className="gap-1.5">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Na program</span>
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6">
        <Card className="w-full max-w-md border-0 ring-1 ring-foreground/10 shadow-none rounded-none sm:rounded-2xl">
          <CardHeader className="border-b border-border/80 pb-6">
            <CardTitle className="font-heading text-3xl sm:text-4xl uppercase tracking-tight leading-none">
              Přihlášení
            </CardTitle>
            <CardDescription className="text-sm leading-relaxed pt-2">
              Zadej e-mail účtu. Nový účet vznikne automaticky. Adresa obsahující{" "}
              <span className="font-mono text-xs">admin</span> dostane roli
              správce (pro testování).
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form action={loginWithCredentials} className="flex flex-col gap-5">
              <input type="hidden" name="callbackUrl" value={callbackUrl} />
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="ty@example.cz"
                  className="h-11"
                />
              </div>
              {showError && (
                <p
                  className="text-sm text-destructive"
                  role="alert"
                >
                  Přihlášení se nezdařilo. Zkus jiný e-mail nebo kontaktuj
                  organizátory.
                </p>
              )}
              <Button type="submit" size="lg" className="w-full gap-2 h-11">
                <LogIn className="w-4 h-4" />
                Pokračovat
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
