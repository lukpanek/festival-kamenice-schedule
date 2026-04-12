"use client";

import dynamic from "next/dynamic";
import { useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ArtistDescriptionEditor = dynamic(
  () =>
    import("@/components/admin/artist-description-editor").then((m) => ({
      default: m.ArtistDescriptionEditor,
    })),
  {
    ssr: false,
    loading: () => (
      <div
        className="min-h-[180px] rounded-md border border-input bg-muted/20 animate-pulse"
        aria-hidden
      />
    ),
  }
);

export function ArtistForm({
  initialData,
  saveAction,
}: {
  initialData?: any;
  saveAction: (formData: FormData) => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();
  const isNew = !initialData;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await saveAction(formData);
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 border bg-card p-6 md:p-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Jméno</Label>
          <Input
            id="name"
            name="name"
            defaultValue={initialData?.name || ""}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="genre">Žánr</Label>
          <Input
            id="genre"
            name="genre"
            defaultValue={initialData?.genre || ""}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="shortDescription">Krátký popis</Label>
        <Input
          id="shortDescription"
          name="shortDescription"
          defaultValue={initialData?.shortDescription || ""}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="long-description-editor">Dlouhý popis</Label>
        <ArtistDescriptionEditor
          initialHtml={initialData?.longDescription}
        />
      </div>

      <div className="flex flex-col gap-2 pt-4 border-t">
        <Label htmlFor="imageUrl">Odkaz na fotku (URL)</Label>
        <Input
          id="imageUrl"
          name="imageUrl"
          defaultValue={initialData?.imageUrl || ""}
          placeholder="https://..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t">
        <div className="flex flex-col gap-2">
          <Label htmlFor="youtubeUrl">YouTube URL</Label>
          <Input
            id="youtubeUrl"
            name="youtubeUrl"
            defaultValue={initialData?.youtubeUrl || ""}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="spotifyUrl">Spotify URL</Label>
          <Input
            id="spotifyUrl"
            name="spotifyUrl"
            defaultValue={initialData?.spotifyUrl || ""}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="instagramUrl">Instagram URL</Label>
          <Input
            id="instagramUrl"
            name="instagramUrl"
            defaultValue={initialData?.instagramUrl || ""}
          />
        </div>
      </div>

      <div className="pt-6 border-t flex justify-end gap-4 mt-2">
        <Link href="/admin/artists">
          <Button variant="ghost" type="button" disabled={isPending}>
            Zrušit
          </Button>
        </Link>
        <Button type="submit" disabled={isPending}>
          {isPending
            ? "Ukládání..."
            : isNew
              ? "Vytvořit umělce"
              : "Uložit změny"}
        </Button>
      </div>
    </form>
  );
}
