"use client";

import { useTransition, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { FESTIVAL_DAYS } from "@/lib/config";

export interface SelectEntity {
  id: string;
  name: string;
  imageUrl?: string | null;
}

export interface PerformanceInitialData {
  date?: string;
  startTime?: string;
  endTime?: string;
  artistId?: string;
  stageId?: string;
  categoryId?: string;
}

interface PerformanceFormProps {
  initialData?: PerformanceInitialData;
  artistsList: SelectEntity[];
  stagesList: SelectEntity[];
  categoriesList: SelectEntity[];
  saveAction: (formData: FormData) => Promise<void>;
}

export function PerformanceForm({
  initialData,
  artistsList,
  stagesList,
  categoriesList,
  saveAction,
}: PerformanceFormProps) {
  const [isPending, startTransition] = useTransition();
  const [openArtist, setOpenArtist] = useState(false);
  const [selectedArtistId, setSelectedArtistId] = useState(
    initialData?.artistId || "",
  );

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
      className="flex flex-col gap-6 border bg-card p-6 md:p-8 rounded-lg"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="date">Datum</Label>
          <Select name="date" defaultValue={initialData?.date || FESTIVAL_DAYS[0].date}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Vyber datum" />
            </SelectTrigger>
            <SelectContent>
              {FESTIVAL_DAYS.map((day) => (
                <SelectItem key={day.date} value={day.date}>
                  {day.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-4">
          <div className="space-y-2 w-full">
            <Label htmlFor="startTime">Začátek</Label>
            <Input
              id="startTime"
              name="startTime"
              type="time"
              defaultValue={initialData?.startTime || "14:00"}
              required
            />
          </div>
          <div className="space-y-2 w-full">
            <Label htmlFor="endTime">Konec</Label>
            <Input
              id="endTime"
              name="endTime"
              type="time"
              defaultValue={initialData?.endTime || "15:00"}
              required
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t">
        <div className="space-y-2 flex flex-col">
          <Label htmlFor="artistId">Umělec</Label>
          <Popover open={openArtist} onOpenChange={setOpenArtist}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openArtist}
                className="w-full justify-between px-3 font-normal"
              >
                {selectedArtistId ? (
                  <div className="flex items-center gap-2 truncate">
                    {(() => {
                      const artist = artistsList.find(
                        (a) => a.id === selectedArtistId,
                      );
                      return (
                        <>
                          {artist?.imageUrl && (
                            <img
                              src={artist.imageUrl}
                              alt={artist.name}
                              className="w-5 h-5 rounded-sm object-cover"
                            />
                          )}
                          <span className="truncate">{artist?.name}</span>
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <span className="text-muted-foreground">Vyber umělce</span>
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="p-0"
              style={{ width: "var(--radix-popover-trigger-width)" }}
              align="start"
            >
              <Command>
                <CommandInput placeholder="Hledat umělce..." />
                <CommandList>
                  <CommandEmpty>Umělec nenalezen.</CommandEmpty>
                  <CommandGroup>
                    {artistsList.map((artist) => (
                      <CommandItem
                        key={artist.id}
                        value={artist.name}
                        onSelect={() => {
                          setSelectedArtistId(artist.id);
                          setOpenArtist(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedArtistId === artist.id
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        {artist.imageUrl && (
                          <img
                            src={artist.imageUrl}
                            alt={artist.name}
                            className="mr-2 w-6 h-6 rounded-sm object-cover"
                          />
                        )}
                        {artist.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <input type="hidden" name="artistId" value={selectedArtistId} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="stageId">Stage (Pódium)</Label>
          <Select name="stageId" defaultValue={initialData?.stageId || ""}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Vyber pódium" />
            </SelectTrigger>
            <SelectContent>
              {stagesList.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="categoryId">Kategorie (Barva/Typ)</Label>
          <Select
            name="categoryId"
            defaultValue={initialData?.categoryId || ""}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Vyber kategorii" />
            </SelectTrigger>
            <SelectContent>
              {categoriesList.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="pt-6 border-t flex justify-end gap-4">
        <Button variant="ghost" type="button" disabled={isPending} asChild>
          <Link href="/admin/performances">Zrušit</Link>
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Ukládání..." : isNew ? "Vytvořit slot" : "Uložit změny"}
        </Button>
      </div>
    </form>
  );
}
