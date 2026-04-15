import { db } from "@/db";
import { performances, artists, stages, artistCategories } from "@/db/schema";
import { asc, eq, or, ilike } from "drizzle-orm";
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

export default async function AdminPerformancesPage(
  props: { searchParams: Promise<{ q?: string }> }
) {
  const searchParams = await props.searchParams;
  const q = searchParams.q || "";

  const query = db
    .select({
      performance: performances,
      artist: artists,
      stage: stages,
      category: artistCategories,
    })
    .from(performances)
    .leftJoin(artists, eq(performances.artistId, artists.id))
    .leftJoin(stages, eq(performances.stageId, stages.id))
    .leftJoin(
      artistCategories,
      eq(performances.categoryId, artistCategories.id)
    );

  if (q) {
    query.where(
      or(
        ilike(artists.name, `%${q}%`),
        ilike(stages.name, `%${q}%`),
        ilike(artistCategories.name, `%${q}%`)
      )
    );
  }

  query.orderBy(asc(performances.date), asc(performances.startTime));

  const allPerformances = await query;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl uppercase tracking-tight">
            Program
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Umělci na pódiích a časové sloty.
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
          <Link href="/admin/performances/new">
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
                <TableHead className="min-w-[80px]">Datum</TableHead>
                <TableHead className="min-w-[100px]">Čas</TableHead>
                <TableHead className="min-w-[120px]">Umělec</TableHead>
                <TableHead className="min-w-[100px] hidden sm:table-cell">
                  Stage
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  Kategorie
                </TableHead>
                <TableHead className="w-20 text-right">Akce</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allPerformances.map(
                ({ performance, artist, stage, category }) => (
                  <TableRow key={performance.id}>
                    <TableCell className="font-mono text-xs">
                      {performance.date}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold whitespace-nowrap">
                      {performance.startTime.slice(0, 5)}–
                      {performance.endTime.slice(0, 5)}
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold uppercase text-sm tracking-tight">
                        {artist?.name || "—"}
                      </span>
                      <span className="sm:hidden block text-xs text-muted-foreground mt-0.5">
                        {stage?.name || "—"}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm">
                      {stage?.name || "—"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {category?.name ? (
                        <span
                          className="inline-flex items-center text-xs font-semibold uppercase px-2 py-0.5 border"
                          style={{
                            borderColor: category.color || "var(--border)",
                          }}
                        >
                          {category.name}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-0.5">
                        <Link
                          href={`/admin/performances/${performance.id}`}
                        >
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
                            const { db } = await import("@/db");
                            const { performances } = await import(
                              "@/db/schema"
                            );
                            const { eq } = await import("drizzle-orm");
                            const { revalidatePath } = await import(
                              "next/cache"
                            );
                            await db
                              .delete(performances)
                              .where(eq(performances.id, performance.id));
                            revalidatePath("/admin/performances");
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
                )
              )}
              {allPerformances.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-12 text-center text-muted-foreground text-sm"
                  >
                    Žádná vystoupení.
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
