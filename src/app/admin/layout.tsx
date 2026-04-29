import { auth } from "@/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut } from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AdminSidebarNav } from "@/components/admin/admin-sidebar-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  if (!session) {
    redirect("/login?callbackUrl=%2Fadmin");
  }
  if (session.user.role !== "admin") {
    redirect("/");
  }

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <Sidebar>
        <SidebarHeader className="border-b h-12 p-4">
          <Link
            href="/admin"
            className="font-heading text-4xl h-6 -mt-2 uppercase leading-none"
          >
            KAMEN!CE Admin
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <AdminSidebarNav />
        </SidebarContent>
        <SidebarFooter className="border-t p-4 flex flex-col gap-3">
          <form
            action={async () => {
              "use server";
              const { signOut } = await import("@/auth");
              await signOut();
            }}
          >
            <button className="w-full text-left text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors">
              <LogOut className="w-3.5 h-3.5" /> Odhlásit
            </button>
          </form>
          <Link
            href="/"
            className="text-muted-foreground text-sm hover:text-foreground transition-colors"
          >
            &larr; Zpět na web
          </Link>
        </SidebarFooter>
      </Sidebar>
      <main className="flex-1 overflow-auto relative">
        <header className="h-12 border-b flex items-center px-4 bg-background sticky top-0 z-10">
          <SidebarTrigger />
        </header>
        <div className="p-4 sm:p-6 md:p-8">{children}</div>
      </main>
    </SidebarProvider>
  );
}
