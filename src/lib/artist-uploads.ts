import "server-only";
/** Nahrané soubory v `public/uploads/artists` — vyžaduje trvalý disk (VPS, vlastní Node). Na serverless bez úložiště použij např. S3 / Vercel Blob. */

import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";
import { db } from "@/db";
import { artists } from "@/db/schema";
import { eq } from "drizzle-orm";

export const ARTIST_UPLOAD_PUBLIC_PREFIX = "/uploads/artists"; // servírováno přes /src/app/uploads/artists/[filename]/route.ts

const MAX_BYTES = 5 * 1024 * 1024;

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

function artistUploadsDir() {
  console.log(path.resolve(process.cwd(), "data", "uploads", "artists"));
  return path.join(process.cwd(), "data", "uploads", "artists");
}

export function isManagedArtistImageUrl(
  url: string | null | undefined,
): boolean {
  if (!url) return false;
  return url.startsWith(`${ARTIST_UPLOAD_PUBLIC_PREFIX}/`);
}

function safePublicUrlToAbsoluteFile(publicUrl: string): string | null {
  if (!isManagedArtistImageUrl(publicUrl)) return null;
  const name = publicUrl.slice(ARTIST_UPLOAD_PUBLIC_PREFIX.length + 1);
  if (!name || name.includes("/") || name.includes("..")) return null;
  if (!/^[a-zA-Z0-9._-]+$/.test(name)) return null;
  const dir = artistUploadsDir();
  const resolved = path.resolve(path.join(dir, name));
  const dirResolved = path.resolve(dir);
  if (!resolved.startsWith(dirResolved + path.sep)) return null;
  return resolved;
}

export async function ensureArtistUploadsDir(): Promise<void> {
  await fs.mkdir(artistUploadsDir(), { recursive: true });
}

export async function saveArtistImageFile(file: File): Promise<string> {
  if (!file.size) throw new Error("Prázdný soubor.");
  if (file.size > MAX_BYTES) {
    throw new Error("Soubor je větší než 5 MB.");
  }
  const mime = file.type || "";
  const ext = MIME_TO_EXT[mime];
  if (!ext) throw new Error("Povolené jsou jen JPEG, PNG, WebP a GIF.");

  await ensureArtistUploadsDir();
  const basename = `${randomUUID()}.${ext}`;
  const abs = path.join(artistUploadsDir(), basename);
  const buf = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(abs, buf);
  return `${ARTIST_UPLOAD_PUBLIC_PREFIX}/${basename}`;
}

export async function deleteManagedArtistImage(
  publicUrl: string | null | undefined,
): Promise<void> {
  const abs = publicUrl ? safePublicUrlToAbsoluteFile(publicUrl) : null;
  if (!abs) return;
  try {
    await fs.unlink(abs);
  } catch (e: unknown) {
    const code = (e as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") throw e;
  }
}

export type ArtistUploadListItem = {
  publicPath: string;
  filename: string;
  sizeBytes: number;
  usedBy: { id: string; name: string }[];
};

export async function listArtistUploadsWithUsage(): Promise<
  ArtistUploadListItem[]
> {
  const dir = artistUploadsDir();
  let names: string[] = [];
  try {
    names = await fs.readdir(dir);
  } catch {
    return [];
  }

  const rows = await db.query.artists.findMany({
    columns: { id: true, name: true, imageUrl: true },
  });
  const byPath = new Map<string, { id: string; name: string }[]>();
  for (const r of rows) {
    if (!r.imageUrl || !isManagedArtistImageUrl(r.imageUrl)) continue;
    const list = byPath.get(r.imageUrl) ?? [];
    list.push({ id: r.id, name: r.name });
    byPath.set(r.imageUrl, list);
  }

  const out: ArtistUploadListItem[] = [];
  for (const name of names) {
    if (name === ".gitkeep" || name.startsWith(".")) continue;
    const publicPath = `${ARTIST_UPLOAD_PUBLIC_PREFIX}/${name}`;
    const abs = path.join(dir, name);
    let st;
    try {
      st = await fs.stat(abs);
    } catch {
      continue;
    }
    if (!st.isFile()) continue;
    out.push({
      publicPath,
      filename: name,
      sizeBytes: st.size,
      usedBy: byPath.get(publicPath) ?? [],
    });
  }
  out.sort((a, b) => a.filename.localeCompare(b.filename));
  return out;
}

export async function removeOrphanArtistUpload(
  publicPath: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isManagedArtistImageUrl(publicPath)) {
    return { ok: false, error: "Neplatná cesta." };
  }
  const used = await db.query.artists.findMany({
    where: eq(artists.imageUrl, publicPath),
    columns: { id: true },
  });
  if (used.length > 0) {
    return { ok: false, error: "Soubor je stále přiřazen k umělci." };
  }
  await deleteManagedArtistImage(publicPath);
  return { ok: true };
}

export async function resolveArtistImageFromForm(
  formData: FormData,
  opts:
    | { mode: "create" }
    | { mode: "update"; previousImageUrl: string | null },
): Promise<{ imageUrl: string | null }> {
  const removeRaw = formData.get("removeImage");
  const remove =
    removeRaw === "1" ||
    removeRaw === "on" ||
    removeRaw === "true" ||
    removeRaw === true;
  const file = formData.get("imageFile");

  if (opts.mode === "update") {
    const prev = opts.previousImageUrl;
    if (file instanceof File && file.size > 0) {
      const next = await saveArtistImageFile(file);
      if (prev && isManagedArtistImageUrl(prev) && prev !== next) {
        await deleteManagedArtistImage(prev);
      }
      return { imageUrl: next };
    }
    if (remove) {
      await deleteManagedArtistImage(prev);
      return { imageUrl: null };
    }
    return { imageUrl: prev };
  }

  if (file instanceof File && file.size > 0) {
    const next = await saveArtistImageFile(file);
    return { imageUrl: next };
  }
  if (remove) return { imageUrl: null };
  return { imageUrl: null };
}
