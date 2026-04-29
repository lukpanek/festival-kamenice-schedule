import { db } from "@/db";
import { users } from "@/db/schema";
import { asc, ilike, or } from "drizzle-orm";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { UserManagementTable } from "@/components/admin/user-management-table";

const statusMessages: Record<string, string> = {
  roleUpdated: "Role uživatele byla upravena.",
  passwordUpdated: "Heslo uživatele bylo změněno.",
};

const errorMessages: Record<string, string> = {
  invalidRole: "Vybraná role není platná.",
  userNotFound: "Uživatel už v databázi neexistuje.",
  missingPassword: "Nové heslo nebylo předáno.",
  passwordTooShort: "Nové heslo je příliš krátké.",
  lastAdmin: "Poslednímu adminovi nelze odebrat roli správce.",
};

export default async function AdminUsersPage(
  props: { searchParams: Promise<{ q?: string; status?: string; error?: string }> }
) {
  const searchParams = await props.searchParams;
  const q = searchParams.q || "";

  const allUsers = await db.query.users.findMany({
    where: q
      ? or(ilike(users.name, `%${q}%`), ilike(users.email, `%${q}%`))
      : undefined,
    orderBy: [asc(users.name)],
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="md:text-5xl text-4xl uppercase">
            Uživatelé
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Registrovaní návštěvníci a admini.
          </p>
        </div>
        <div className="flex gap-2 items-center w-full sm:w-auto">
          <form className="relative flex-1 sm:w-56">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              name="q"
              defaultValue={q}
              placeholder="Hledat..."
              className="pl-9 h-9"
            />
          </form>
        </div>
      </div>

      {searchParams.status && statusMessages[searchParams.status] && (
        <div className="border border-border bg-muted/40 px-4 py-3 text-sm">
          {statusMessages[searchParams.status]}
        </div>
      )}

      {searchParams.error && errorMessages[searchParams.error] && (
        <div className="border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {errorMessages[searchParams.error]}
        </div>
      )}

      <UserManagementTable users={allUsers} />
    </div>
  );
}
