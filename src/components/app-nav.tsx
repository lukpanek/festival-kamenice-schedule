import { auth } from "@/auth";
import Link from "next/link";
import { LogIn, LogOut, Heart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signInAction, signOutAction } from "@/app/actions";

interface AppNavProps {
  showBackLink?: boolean;
}

export async function AppNav({ showBackLink = false }: AppNavProps) {
  const session = await auth();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-14 items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          {showBackLink && (
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground transition-colors touch-manipulation"
              aria-label="Zpět na lineup"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
          )}
          <Link
            href="/"
            className="font-heading text-5xl uppercase leading-none shrink-0"
          >
            KAMEN!CE
          </Link>
        </div>

        <div className="flex items-center gap-1">
          {session ? (
            <>
              {!showBackLink && (
                <Link href="/my-schedule">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 touch-manipulation"
                  >
                    <Heart className="w-4 h-4" />
                    <span className="hidden sm:inline">Můj plán</span>
                  </Button>
                </Link>
              )}
              {session.user.role === "admin" && (
                <Link href="/admin">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="touch-manipulation"
                  >
                    Admin
                  </Button>
                </Link>
              )}
              <form action={signOutAction}>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 touch-manipulation"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Odhlásit</span>
                </Button>
              </form>
            </>
          ) : (
            <form action={signInAction}>
              <Button size="sm" className="gap-1.5 touch-manipulation">
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Přihlásit se</span>
              </Button>
            </form>
          )}
        </div>
      </div>
    </nav>
  );
}
