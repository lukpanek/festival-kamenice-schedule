"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function StageForm({
  initialData,
  stageId,
  saveAction,
}: {
  initialData?: any;
  stageId?: string;
  saveAction: (formData: FormData) => Promise<void>;
}) {
  const router = useRouter();
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Název Pódia (Stage)</Label>
          <Input
            id="name"
            name="name"
            defaultValue={initialData?.name || ""}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="order">Pořadí (číslo)</Label>
          <Input
            id="order"
            name="order"
            type="number"
            defaultValue={initialData?.order || 0}
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Popis</Label>
        <Textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={initialData?.description || ""}
        />
      </div>

      <div className="pt-6 border-t flex justify-end gap-4 mt-2">
        <Link href="/admin/stages">
          <Button variant="ghost" type="button" disabled={isPending}>
            Zrušit
          </Button>
        </Link>
        <Button type="submit" disabled={isPending}>
          {isPending
            ? "Ukládání..."
            : isNew
              ? "Vytvořit stage"
              : "Uložit změny"}
        </Button>
      </div>
    </form>
  );
}
