import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  LogOut,
  Users,
  Music2,
  CalendarDays,
  Mic2,
  Layers,
  Images,
} from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login?callbackUrl=%2Fadmin");
  }
  if (session.user.role !== "admin") {
    redirect("/");
  }

  const menuItems = [
    { name: "Umělci", href: "/admin/artists", icon: Mic2 },
    { name: "Média", href: "/admin/media", icon: Images },
    { name: "Program", href: "/admin/performances", icon: CalendarDays },
    { name: "Stages", href: "/admin/stages", icon: Layers },
    { name: "Kategorie", href: "/admin/categories", icon: Music2 },
    { name: "Uživatelé", href: "/admin/users", icon: Users },
  ];

  return (
    <SidebarProvider>
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
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild>
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
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
