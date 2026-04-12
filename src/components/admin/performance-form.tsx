"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function PerformanceForm({ 
  initialData, 
  artistsList,
  stagesList,
  categoriesList,
  saveAction 
}: { 
  initialData?: any; 
  artistsList: any[];
  stagesList: any[];
  categoriesList: any[];
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
           <Label htmlFor="date">Datum</Label>
           <Input id="date" name="date" type="date" defaultValue={initialData?.date || "2026-06-05"} required />
         </div>
         
         <div className="flex gap-4">
           <div className="flex flex-col gap-2 w-full">
             <Label htmlFor="startTime">Začátek</Label>
             <Input id="startTime" name="startTime" type="time" defaultValue={initialData?.startTime || "14:00"} required />
           </div>
           <div className="flex flex-col gap-2 w-full">
             <Label htmlFor="endTime">Konec</Label>
             <Input id="endTime" name="endTime" type="time" defaultValue={initialData?.endTime || "15:00"} required />
           </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t">
         <div className="flex flex-col gap-2">
           <Label htmlFor="artistId">Umělec</Label>
           <Select name="artistId" defaultValue={initialData?.artistId || ""}>
             <SelectTrigger>
               <SelectValue placeholder="Vyber umělce" />
             </SelectTrigger>
             <SelectContent>
                {artistsList.map(a => (
                  <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                ))}
             </SelectContent>
           </Select>
         </div>

         <div className="flex flex-col gap-2">
           <Label htmlFor="stageId">Stage (Pódium)</Label>
           <Select name="stageId" defaultValue={initialData?.stageId || ""}>
             <SelectTrigger>
               <SelectValue placeholder="Vyber pódium" />
             </SelectTrigger>
             <SelectContent>
                {stagesList.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
             </SelectContent>
           </Select>
         </div>

         <div className="flex flex-col gap-2">
           <Label htmlFor="categoryId">Kategorie (Barva/Typ)</Label>
           <Select name="categoryId" defaultValue={initialData?.categoryId || ""}>
             <SelectTrigger>
               <SelectValue placeholder="Vyber kategorii" />
             </SelectTrigger>
             <SelectContent>
                {categoriesList.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
             </SelectContent>
           </Select>
         </div>
      </div>

      <div className="pt-6 border-t flex justify-end gap-4 mt-2">
         <Link href="/admin/performances">
           <Button variant="ghost" type="button" disabled={isPending}>Zrušit</Button>
         </Link>
         <Button type="submit" disabled={isPending}>
            {isPending ? "Ukládání..." : (isNew ? 'Vytvořit slot' : 'Uložit změny')}
         </Button>
      </div>
    </form>
  );
}
