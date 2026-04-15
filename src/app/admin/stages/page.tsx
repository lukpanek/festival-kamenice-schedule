import { db } from "@/db";
import { stages } from "@/db/schema";
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

export default async function AdminStagesPage(props: {
  searchParams: Promise<{ q?: string }>;
}) {
  const searchParams = await props.searchParams;
  const q = searchParams.q || "";

  const allStages = await db.query.stages.findMany({
    where: q ? ilike(stages.name, `%${q}%`) : undefined,
    orderBy: [asc(stages.order), asc(stages.name)],
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-5xl uppercase">Stages</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pódia a lokace programu.
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
          <Link href="/admin/stages/new">
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
                <TableHead className="w-16">#</TableHead>
                <TableHead>Název</TableHead>
                <TableHead className="hidden sm:table-cell">Popis</TableHead>
                <TableHead className="w-20 text-right">Akce</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allStages.map((stage) => (
                <TableRow key={stage.id}>
                  <TableCell className="font-mono text-sm font-semibold">
                    {stage.order}
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold uppercase text-sm tracking-tight">
                      {stage.name}
                    </span>
                    <span className="sm:hidden block text-xs text-muted-foreground mt-0.5">
                      {stage.description || "—"}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm hidden sm:table-cell">
                    {stage.description || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-0.5">
                      <Link href={`/admin/stages/${stage.id}`}>
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
                          const { revalidatePath } = await import("next/cache");
                          await db
                            .delete(stages)
                            .where(eq(stages.id, stage.id));
                          revalidatePath("/admin/stages");
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
              {allStages.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-12 text-center text-muted-foreground text-sm"
                  >
                    Žádná pódia.
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
