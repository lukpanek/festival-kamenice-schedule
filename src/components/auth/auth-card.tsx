import Link from "next/link";
import { LogIn, UserPlus } from "lucide-react";
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
import { MIN_PASSWORD_LENGTH } from "@/lib/passwords";

type AuthCardProps = {
  mode: "login" | "register";
  callbackUrl: string;
  error?: string;
  notice?: string;
  loginAction: (formData: FormData) => Promise<void>;
  registerAction: (formData: FormData) => Promise<void>;
};

const noticeMap: Record<string, string> = {
  registered: "Účet je připravený. Teď se můžeš přihlásit.",
  passwordChanged: "Heslo bylo změněno. Přihlas se novým heslem.",
};

const errorMap: Record<string, string> = {
  invalid: "Přihlášení se nezdařilo. Zkontroluj e-mail a heslo.",
  missingFields: "Vyplň prosím všechna povinná pole.",
  passwordTooShort: `Heslo musí mít alespoň ${MIN_PASSWORD_LENGTH} znaků.`,
  passwordMismatch: "Hesla se neshodují.",
  emailTaken: "Účet s tímto e-mailem už existuje.",
};

export function AuthCard({
  mode,
  callbackUrl,
  error,
  notice,
  loginAction,
  registerAction,
}: AuthCardProps) {
  const message = error ? errorMap[error] : undefined;
  const successMessage = notice ? noticeMap[notice] : undefined;
  const isLogin = mode === "login";

  return (
    <Card className="w-full max-w-md border-0 ring-1 ring-foreground/10 shadow-none rounded-none sm:rounded-2xl">
      <CardHeader className="border-b border-border/80 pb-6">
        <CardTitle className="font-heading text-4xl uppercase leading-none">
          {isLogin ? "Přihlášení" : "Vytvořit účet"}
        </CardTitle>
        <CardDescription>
          {isLogin
            ? "Přihlas se pro přístup k tvému harmonogramu. Použij údaje, které jsi vyplňoval*a při registraci."
            : "Zaregistruj se do aplikace pro sestavení vlastního harmonogramu a synchronizaci napříč všemi zařízeními!"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {successMessage && (
          <div className="border border-border bg-muted/40 px-3 py-2 text-sm">
            {successMessage}
          </div>
        )}

        {message && (
          <p className="text-sm text-destructive" role="alert">
            {message}
          </p>
        )}

        {isLogin ? (
          <form action={loginAction} className="flex flex-col gap-3">
            <input type="hidden" name="callbackUrl" value={callbackUrl} />
            <div className="flex flex-col gap-2">
              <Label htmlFor="login-email">E-mail</Label>
              <Input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="tvuj@email.cz"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="login-password">Heslo</Label>
              <Input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="TajneHeslo123"
                required
              />
            </div>
            <Button type="submit" size="lg" className="w-full gap-2 mt-3">
              <LogIn className="size-4" />
              Přihlásit se
            </Button>
          </form>
        ) : (
          <form action={registerAction} className="flex flex-col gap-3">
            <input type="hidden" name="callbackUrl" value={callbackUrl} />
            <div className="flex flex-col gap-2">
              <Label htmlFor="register-name">Jméno</Label>
              <Input
                id="register-name"
                name="name"
                autoComplete="name"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="register-email">E-mail</Label>
              <Input
                id="register-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="ty@example.cz"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="register-password">Heslo</Label>
                <Input
                  id="register-password"
                  placeholder="TajneHeslo123"
                  name="password"
                  type="password"
                  required
                  minLength={MIN_PASSWORD_LENGTH}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="register-password-confirm">
                  Potvrzení hesla
                </Label>
                <Input
                  placeholder="TajneHeslo123"
                  id="register-password-confirm"
                  name="passwordConfirmation"
                  type="password"
                  required
                  minLength={MIN_PASSWORD_LENGTH}
                />
              </div>
            </div>
            <Button type="submit" size="lg" className="w-full mt-3">
              <UserPlus className="size-4" />
              Vytvořit účet
            </Button>
          </form>
        )}

        {isLogin ? (
          <Link
            className="text-center"
            href={
              callbackUrl === "/"
                ? "/register"
                : `/register?callbackUrl=${encodeURIComponent(callbackUrl)}`
            }
          >
            Nemáš účet?{" "}
            <span className="underline underline-offset-2">
              Zaregistruj se.
            </span>
          </Link>
        ) : (
          <Link
            className="text-center"
            href={
              callbackUrl === "/"
                ? "/login"
                : `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
            }
          >
            Už máš účet?{" "}
            <span className="underline underline-offset-2">
              Zpět na přihlášení.
            </span>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
