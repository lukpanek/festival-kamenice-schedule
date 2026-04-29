"use client";

import Link from "next/link";
import { ImagePlus } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function ArtistImageField({
  initialImageUrl,
}: {
  initialImageUrl?: string | null;
}) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [removeChecked, setRemoveChecked] = useState(false);

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  const displaySrc =
    removeChecked ? null : localPreview || initialImageUrl || null;

  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor={inputId}>Fotka</Label>
      <p className="text-xs text-muted-foreground -mt-1">
        JPEG, PNG, WebP nebo GIF, max. 5 MB. Správa souborů:{" "}
        <Link
          href="/admin/media"
          className="text-foreground underline underline-offset-2 hover:no-underline"
        >
          Média
        </Link>
        .
      </p>

      <div className="flex flex-col sm:flex-row gap-4 sm:items-start">
        <div
          className={cn(
            "relative w-full max-w-[200px] aspect-square border bg-muted overflow-hidden shrink-0",
            !displaySrc && "flex items-center justify-center"
          )}
        >
          {displaySrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={displaySrc}
              alt="Náhled"
              className="object-cover w-full h-full"
            />
          ) : (
            <ImagePlus className="w-10 h-10 text-muted-foreground/40" />
          )}
        </div>

        <div className="flex flex-col gap-3 min-w-0 flex-1">
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" asChild>
              <label htmlFor={inputId} className="cursor-pointer">
                Vybrat soubor
              </label>
            </Button>
            {(initialImageUrl || localPreview) && (
              <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="removeImage"
                  value="1"
                  checked={removeChecked}
                  onChange={(e) => {
                    setRemoveChecked(e.target.checked);
                    if (e.target.checked) {
                      if (localPreview) URL.revokeObjectURL(localPreview);
                      setLocalPreview(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }
                  }}
                  className="rounded border-input"
                />
                <span className="text-muted-foreground">Odstranit fotku</span>
              </label>
            )}
          </div>
          <input
            ref={fileInputRef}
            id={inputId}
            name="imageFile"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              setRemoveChecked(false);
              if (localPreview) URL.revokeObjectURL(localPreview);
              if (f) {
                setLocalPreview(URL.createObjectURL(f));
              } else {
                setLocalPreview(null);
              }
            }}
          />
          {initialImageUrl && !localPreview && !removeChecked && (
            <p className="text-xs text-muted-foreground break-all">
              Aktuální: {initialImageUrl}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
