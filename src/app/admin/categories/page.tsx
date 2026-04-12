import { db } from "@/db";
import { artistCategories } from "@/db/schema";
import { asc, ilike } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit2, Trash2, Search } from "lucide-react";

export default async function AdminCategoriesPage(
  props: { searchParams: Promise<{ q?: string }> }
) {
  const searchParams = await props.searchParams;
  const q = searchParams.q || "";

  const allCategories = await db.query.artistCategories.findMany({
    where: q ? ilike(artistCategories.name, `%${q}%`) : undefined,
    orderBy: [asc(artistCategories.name)],
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl uppercase tracking-tight">
            Kategorie
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Barevné rozlišení typů umělců.
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
          <Link href="/admin/categories/new">
            <Button size="sm" className="gap-1.5 shrink-0">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Přidat</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-12">Barva</TableHead>
                <TableHead>Název</TableHead>
                <TableHead className="w-20 text-right">Akce</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="pr-0">
                    <div
                      className="w-5 h-5 border"
                      style={{
                        backgroundColor: category.color || "var(--muted)",
                      }}
                    />
                  </TableCell>
                  <TableCell className="font-semibold uppercase text-sm tracking-tight">
                    {category.name}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-0.5">
                      <Link href={`/admin/categories/${category.id}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                      <form
                        action={async () => {
                          "use server";
                          const { eq } = await import("drizzle-orm");
                          const { revalidatePath } = await import(
                            "next/cache"
                          );
                          await db
                            .delete(artistCategories)
                            .where(eq(artistCategories.id, category.id));
                          revalidatePath("/admin/categories");
                        }}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {allCategories.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="py-12 text-center text-muted-foreground text-sm"
                  >
                    Žádné kategorie.
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
