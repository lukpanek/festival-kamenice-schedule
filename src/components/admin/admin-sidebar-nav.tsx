"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Images,
  Layers,
  Mic2,
  Music2,
  Users,
} from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const menuItems = [
  { name: "Umělci", href: "/admin/artists", icon: Mic2 },
  { name: "Média", href: "/admin/media", icon: Images },
  { name: "Program", href: "/admin/performances", icon: CalendarDays },
  { name: "Stages", href: "/admin/stages", icon: Layers },
  { name: "Kategorie", href: "/admin/categories", icon: Music2 },
  { name: "Uživatelé", href: "/admin/users", icon: Users },
];

export function AdminSidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={pathname === item.href}>
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
  );
}
