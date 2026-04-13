"use server";

import { auth } from "@/auth";
import { removeOrphanArtistUpload } from "@/lib/artist-uploads";
import { revalidatePath } from "next/cache";

export async function deleteOrphanArtistUploadAction(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "admin") return;

  const publicPath = formData.get("publicPath") as string;
  if (!publicPath) return;

  const result = await removeOrphanArtistUpload(publicPath);
  if (result.ok) {
    revalidatePath("/admin/media");
    revalidatePath("/admin/artists");
  }
}
