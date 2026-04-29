import { auth } from "@/auth";
import Link from "next/link";
import { LogIn, Heart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserNavMenu } from "@/components/user-nav-menu";

interface AppNavProps {
  showBackLink?: boolean;
}

export async function AppNav({ showBackLink = false }: AppNavProps) {
  const session = await auth();
  const userLabel =
    session?.user?.name?.trim() || session?.user?.email || "Účet";

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-20 items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          {showBackLink && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Zpět na lineup"
              asChild
            >
              <Link href="/">
                <ArrowLeft data-icon />
              </Link>
            </Button>
          )}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="font-heading text-6xl uppercase h-14 leading-none shrink-0"
            >
              KAMEN!CE
            </Link>
            {/* <div className="flex flex-col justify-center gap-1">
              <Clock className="size-5 text-white/75" strokeWidth={1.5} />
              <p className="text-white/75">Harmonogram</p>
            </div> */}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {session ? (
            <>
              {!showBackLink && (
                <Link href="/my-schedule">
                  <Button variant="ghost">
                    <Heart className="size-4 text-red-500 fill-red-500" />
                    <span className="hidden sm:inline">Můj plán</span>
                  </Button>
                </Link>
              )}
              {session.user.role === "admin" && (
                <Link href="/admin">
                  <Button variant="ghost" className="touch-manipulation">
                    Admin
                  </Button>
                </Link>
              )}
              <UserNavMenu label={userLabel} email={session.user.email} />
              <ThemeToggle />
            </>
          ) : (
            <>
              <ThemeToggle />
              <Button asChild>
                <Link href="/login">
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Přihlásit se</span>
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
