"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { artists } from "@/db/schema";
import { deleteManagedArtistImage } from "@/lib/artist-uploads";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function deleteArtistAdmin(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "admin") return;

  const id = formData.get("artistId") as string;
  if (!id) return;

  const row = await db.query.artists.findFirst({
    where: eq(artists.id, id),
    columns: { imageUrl: true },
  });
  await deleteManagedArtistImage(row?.imageUrl ?? null);
  await db.delete(artists).where(eq(artists.id, id));
  revalidatePath("/admin/artists");
  revalidatePath("/admin/media");
  revalidatePath("/");
  revalidatePath("/my-schedule");
}
