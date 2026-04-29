"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { InferSelectModel } from "drizzle-orm";
import { artistCategories } from "@/db/schema";

type Category = InferSelectModel<typeof artistCategories>;

export function CategoryForm({
  initialData,
  saveAction,
}: {
  initialData?: Category | null;
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
      className="flex flex-col gap-6 border bg-card p-6 md:p-8 rounded-md"
    >
      <div className="grid grid-cols-1 gap-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Název Kategorie</Label>
          <Input
            id="name"
            name="name"
            defaultValue={initialData?.name || ""}
            required
          />
        </div>
      </div>

      <div className="pt-6 border-t flex justify-end gap-4 mt-2">
        <Link href="/admin/categories">
          <Button variant="ghost" type="button" disabled={isPending}>
            Zrušit
          </Button>
        </Link>
        <Button type="submit" disabled={isPending}>
          {isPending
            ? "Ukládání..."
            : isNew
              ? "Vytvořit kategorii"
              : "Uložit změny"}
        </Button>
      </div>
    </form>
  );
}
