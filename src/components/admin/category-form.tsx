"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CategoryForm({ 
  initialData, 
  categoryId,
  saveAction 
}: { 
  initialData?: any; 
  categoryId?: string;
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 border bg-card p-6 md:p-8 rounded-md shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="flex flex-col gap-2">
           <Label htmlFor="name">Název Kategorie</Label>
           <Input id="name" name="name" defaultValue={initialData?.name || ""} required />
         </div>
         
         <div className="flex flex-col gap-2">
           <Label htmlFor="color">Barva okraje (Hex)</Label>
           <div className="flex gap-2">
             <Input id="color" name="color" type="color" className="w-12 h-10 p-1 cursor-pointer" defaultValue={initialData?.color || "#e11d48"} required />
             <Input value={initialData?.color || "#e11d48"} readOnly className="flex-1 font-mono text-muted-foreground" />
           </div>
         </div>
      </div>

      <div className="pt-6 border-t flex justify-end gap-4 mt-2">
         <Link href="/admin/categories">
           <Button variant="ghost" type="button" disabled={isPending}>Zrušit</Button>
         </Link>
         <Button type="submit" disabled={isPending}>
            {isPending ? "Ukládání..." : (isNew ? 'Vytvořit kategorii' : 'Uložit změny')}
         </Button>
      </div>
    </form>
  );
}
