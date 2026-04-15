import { db } from "@/db";
import { users } from "@/db/schema";
import { asc, ilike, or } from "drizzle-orm";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function AdminUsersPage(
  props: { searchParams: Promise<{ q?: string }> }
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

      <div className="border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Jméno</TableHead>
                <TableHead className="hidden sm:table-cell">Email</TableHead>
                <TableHead className="w-20">Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <span className="font-semibold text-sm">
                      {user.name || "—"}
                    </span>
                    <span className="sm:hidden block text-xs text-muted-foreground mt-0.5">
                      {user.email}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm hidden sm:table-cell">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.role === "admin" ? "default" : "secondary"}
                      className="uppercase text-xs"
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {allUsers.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="py-12 text-center text-muted-foreground text-sm"
                  >
                    Žádní uživatelé.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
