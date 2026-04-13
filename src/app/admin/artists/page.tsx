import { db } from "@/db";
import { artists } from "@/db/schema";
import { deleteArtistAdmin } from "@/app/admin/artists/actions";
import { asc, ilike, or } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Edit2, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function AdminArtistsPage(
  props: { searchParams: Promise<{ q?: string }> }
) {
  const searchParams = await props.searchParams;
  const q = searchParams.q || "";

  const allArtists = await db.query.artists.findMany({
    where: q
      ? or(ilike(artists.name, `%${q}%`), ilike(artists.genre, `%${q}%`))
      : undefined,
    orderBy: [asc(artists.name)],
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl uppercase tracking-tight">
            Umělci
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kapely, divadla a DJe v line-upu.
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
          <Link href="/admin/artists/new">
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
                <TableHead className="w-12" />
                <TableHead>Umělec</TableHead>
                <TableHead className="hidden sm:table-cell">Žánr</TableHead>
                <TableHead className="hidden lg:table-cell">Popis</TableHead>
                <TableHead className="w-20 text-right">Akce</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allArtists.map((artist) => (
                <TableRow key={artist.id}>
                  <TableCell className="pr-0">
                    <div className="w-9 h-9 bg-muted overflow-hidden flex items-center justify-center border">
                      {artist.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={artist.imageUrl}
                          alt={artist.name}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <span className="text-[8px] text-muted-foreground uppercase font-bold">
                          —
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold uppercase text-sm tracking-tight">
                      {artist.name}
                    </span>
                    <span className="sm:hidden block text-xs text-muted-foreground mt-0.5">
                      {artist.genre || "—"}
                    </span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className="text-xs text-muted-foreground">
                      {artist.genre || "—"}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate hidden lg:table-cell">
                    {artist.shortDescription || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-0.5">
                      <Link href={`/admin/artists/${artist.id}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                      <form action={deleteArtistAdmin}>
                        <input type="hidden" name="artistId" value={artist.id} />
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
              {allArtists.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-12 text-center text-muted-foreground text-sm"
                  >
                    Žádní umělci.
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
