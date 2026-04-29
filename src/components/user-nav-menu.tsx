"use client";

import { ChevronDown, LogOut } from "lucide-react";
import { signOutAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type UserNavMenuProps = {
  label: string;
  email?: string | null;
};

export function UserNavMenu({ label, email }: UserNavMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="max-w-[220px] gap-2">
          <span className="truncate">{label}</span>
          <ChevronDown className="size-4 shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-3 py-2">
          <div className="truncate text-sm font-medium">{label}</div>
          {email && (
            <div className="truncate text-xs text-muted-foreground">
              {email}
            </div>
          )}
        </div>
        <DropdownMenuSeparator />
        <form action={signOutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm outline-hidden transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <LogOut className="w-4 h-4" />
            Odhlásit se
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
