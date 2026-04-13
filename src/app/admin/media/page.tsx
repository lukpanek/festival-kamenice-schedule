import Link from "next/link";
import { listArtistUploadsWithUsage } from "@/lib/artist-uploads";
import { deleteOrphanArtistUploadAction } from "@/app/admin/media/actions";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2 } from "lucide-react";

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function AdminMediaPage() {
  const items = await listArtistUploadsWithUsage();

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div>
        <h1 className="text-2xl sm:text-3xl uppercase tracking-tight">
          Média — fotky umělců
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Soubory z{" "}
          <code className="text-xs bg-muted px-1 py-0.5 rounded">
            /uploads/artists
          </code>
          . Smazat můžeš jen soubory, které není přiřazen žádný umělec (jinak
          nejdřív odeber fotku u umělce).
        </p>
      </div>

      <div className="border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-20" />
                <TableHead>Soubor</TableHead>
                <TableHead className="hidden sm:table-cell w-24">Velikost</TableHead>
                <TableHead>Použití</TableHead>
                <TableHead className="w-24 text-right">Akce</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.publicPath}>
                  <TableCell className="p-2">
                    <div className="w-14 h-14 border bg-muted overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.publicPath}
                        alt=""
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs break-all">{item.filename}</code>
                    <span className="sm:hidden block text-xs text-muted-foreground mt-1">
                      {formatBytes(item.sizeBytes)}
                    </span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                    {formatBytes(item.sizeBytes)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {item.usedBy.length === 0 ? (
                      <span className="text-amber-600 dark:text-amber-500">
                        Nepřiřazeno
                      </span>
                    ) : (
                      <ul className="list-none space-y-1 m-0 p-0">
                        {item.usedBy.map((u) => (
                          <li key={u.id}>
                            <Link
                              href={`/admin/artists/${u.id}`}
                              className="underline underline-offset-2 hover:no-underline"
                            >
                              {u.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.usedBy.length === 0 ? (
                      <form action={deleteOrphanArtistUploadAction}>
                        <input
                          type="hidden"
                          name="publicPath"
                          value={item.publicPath}
                        />
                        <Button
                          type="submit"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          aria-label="Smazat soubor"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </form>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-12 text-center text-muted-foreground text-sm"
                  >
                    Žádné nahrané soubory.
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
