import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  updateUserPasswordAction,
  updateUserRoleAction,
} from "@/app/admin/users/actions";
import { MIN_PASSWORD_LENGTH } from "@/lib/passwords";

type UserRow = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  passwordHash: string | null;
};

export function UserManagementTable({ users }: { users: UserRow[] }) {
  return (
    <div className="border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead>Uživatel</TableHead>
              <TableHead className="hidden lg:table-cell">Role</TableHead>
              <TableHead className="hidden xl:table-cell">Heslo</TableHead>
              <TableHead className="w-[440px]">Správa</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="align-top">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-sm">
                      {user.name || "Bez jména"}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {user.email || "Bez e-mailu"}
                    </span>
                    <div className="flex flex-wrap gap-2 pt-1 lg:hidden">
                      <Badge
                        variant={user.role === "admin" ? "default" : "secondary"}
                        className="uppercase text-xs"
                      >
                        {user.role}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {user.passwordHash ? "heslo nastaveno" : "bez hesla"}
                      </Badge>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell align-top">
                  <Badge
                    variant={user.role === "admin" ? "default" : "secondary"}
                    className="uppercase text-xs"
                  >
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell className="hidden xl:table-cell align-top">
                  <Badge variant="outline" className="text-xs">
                    {user.passwordHash ? "nastaveno" : "bez hesla"}
                  </Badge>
                </TableCell>
                <TableCell className="align-top">
                  <div className="grid gap-3 xl:grid-cols-[180px_minmax(0,1fr)]">
                    <form
                      action={updateUserRoleAction}
                      className="flex flex-col gap-2 xl:flex-row xl:items-center"
                    >
                      <input type="hidden" name="userId" value={user.id} />
                      <select
                        name="role"
                        defaultValue={user.role}
                        className="h-9 w-full min-w-0 border border-input bg-input/30 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                      >
                        <option value="visitor">visitor</option>
                        <option value="admin">admin</option>
                      </select>
                      <Button type="submit" variant="outline" className="gap-2">
                        <Save className="size-4" />
                        Role
                      </Button>
                    </form>

                    <form
                      action={updateUserPasswordAction}
                      className="flex flex-col gap-2 md:flex-row md:items-center"
                    >
                      <input type="hidden" name="userId" value={user.id} />
                      <Input
                        name="password"
                        type="password"
                        minLength={MIN_PASSWORD_LENGTH}
                        placeholder={`Nové heslo (${MIN_PASSWORD_LENGTH}+ znaků)`}
                        className="h-9"
                        required
                      />
                      <Button type="submit" className="gap-2">
                        <Save className="size-4" />
                        Uložit heslo
                      </Button>
                    </form>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {users.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
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
  );
}
