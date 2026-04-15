"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useRouter, usePathname } from "next/navigation";
import { Heart, Music, Play, Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { sanitizeArtistDescriptionHtml } from "@/lib/sanitize-artist-html";

export function ArtistDialog({
  selectedArtistDetails,
  selectedDay,
  userId,
  isAdded,
  toggleScheduleAction,
}: {
  selectedArtistDetails: any;
  selectedDay: string;
  userId?: string;
  isAdded: boolean;
  toggleScheduleAction: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();

  if (!selectedArtistDetails) return null;

  const { artist, category, performance } = selectedArtistDetails;

  function handleClose() {
    router.push(`${pathname}?day=${selectedDay}`, { scroll: false });
  }

  return (
    <Dialog
      open={true}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className={cn(
          "p-0 gap-0 overflow-hidden",
          "w-full max-w-full h-full max-h-full rounded-none",
          "sm:max-w-xl sm:h-auto sm:max-h-[90vh] sm:rounded-none",
          "flex flex-col"
        )}
      >
        <DialogTitle className="sr-only">{artist.name}</DialogTitle>
        <DialogDescription className="sr-only">
          {performance.startTime.slice(0, 5)}–{performance.endTime.slice(0, 5)}
          {category?.name ? `, ${category.name}` : ""}
        </DialogDescription>

        <div className="relative w-full aspect-video sm:aspect-2/1 bg-muted shrink-0 overflow-hidden">
          {artist.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={artist.imageUrl}
              alt={artist.name}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <span className="text-xl uppercase text-muted-foreground/20 tracking-wider font-heading">
                {artist.name}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

          <button
            onClick={handleClose}
            className="absolute top-3 right-3 w-8 h-8 bg-black/40 hover:bg-black/60 transition-colors flex items-center justify-center text-white touch-manipulation z-10"
            aria-label="Zavřít"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              {(artist.genre || category?.name) && (
                <span
                  className="text-xs font-bold uppercase px-2 py-0.5 border tracking-wider"
                  style={
                    category?.color
                      ? { borderColor: category.color, color: category.color }
                      : undefined
                  }
                >
                  {artist.genre || category?.name}
                </span>
              )}
              <span className="font-mono text-xs text-muted-foreground">
                {performance.startTime.slice(0, 5)}–
                {performance.endTime.slice(0, 5)}
              </span>
            </div>

            <p className="text-3xl sm:text-4xl uppercase leading-none mb-5 font-heading">
              {artist.name}
            </p>

            {artist.longDescription && (
              <div
                className="text-sm text-muted-foreground leading-relaxed mb-6 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_strong]:text-foreground/90 [&_b]:text-foreground/90 [&_em]:italic"
                dangerouslySetInnerHTML={{
                  __html: sanitizeArtistDescriptionHtml(artist.longDescription),
                }}
              />
            )}

            <div className="flex items-center justify-between gap-4 pt-5 border-t">
              <div className="flex items-center gap-4">
                {artist.spotifyUrl && (
                  <a
                    href={artist.spotifyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors touch-manipulation"
                    aria-label="Spotify"
                  >
                    <Music className="w-5 h-5" />
                  </a>
                )}
                {artist.youtubeUrl && (
                  <a
                    href={artist.youtubeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors touch-manipulation"
                    aria-label="YouTube"
                  >
                    <Play className="w-5 h-5" />
                  </a>
                )}
                {artist.instagramUrl && (
                  <a
                    href={artist.instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors touch-manipulation"
                    aria-label="Instagram"
                  >
                    <Camera className="w-5 h-5" />
                  </a>
                )}
              </div>

              {userId && (
                <form action={toggleScheduleAction}>
                  <Button
                    variant={isAdded ? "default" : "outline"}
                    className="gap-2 touch-manipulation"
                  >
                    <Heart
                      className={cn("w-4 h-4", isAdded && "fill-current")}
                    />
                    {isAdded ? "V harmonogramu" : "Přidat do plánu"}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
