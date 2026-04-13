import { db } from "@/db";
import { artists } from "@/db/schema";
import { resolveArtistImageFromForm } from "@/lib/artist-uploads";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ArtistForm } from "@/components/admin/artist-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function ArtistFormPage(
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const isNew = params.id === "new";

  let artist = null;
  if (!isNew) {
    artist = await db.query.artists.findFirst({
      where: eq(artists.id, params.id),
    });
    if (!artist) redirect("/admin/artists");
  }

  async function saveArtist(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const genre = formData.get("genre") as string;
    const shortDescription = formData.get("shortDescription") as string;
    const longDescription = formData.get("longDescription") as string;

    let previousImageUrl: string | null = null;
    if (!isNew) {
      const row = await db.query.artists.findFirst({
        where: eq(artists.id, params.id),
        columns: { imageUrl: true },
      });
      previousImageUrl = row?.imageUrl ?? null;
    }
    const { imageUrl } = await resolveArtistImageFromForm(
      formData,
      isNew ? { mode: "create" } : { mode: "update", previousImageUrl }
    );
    const youtubeUrl = formData.get("youtubeUrl") as string;
    const spotifyUrl = formData.get("spotifyUrl") as string;
    const instagramUrl = formData.get("instagramUrl") as string;

    if (isNew) {
      await db.insert(artists).values({
        name, genre, shortDescription, longDescription,
        imageUrl, youtubeUrl, spotifyUrl, instagramUrl,
      });
    } else {
      await db.update(artists).set({
        name, genre, shortDescription, longDescription,
        imageUrl, youtubeUrl, spotifyUrl, instagramUrl,
      }).where(eq(artists.id, params.id));
    }

    revalidatePath("/admin/artists");
    revalidatePath("/admin/media");
    revalidatePath("/");
    revalidatePath("/my-schedule");
    redirect("/admin/artists");
  }

  return (
    <div className="max-w-3xl flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/artists"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl sm:text-3xl uppercase tracking-tight">
          {isNew ? "Nový umělec" : "Detail umělce"}
        </h1>
      </div>

      <ArtistForm initialData={artist} saveAction={saveArtist} />
    </div>
  );
}
