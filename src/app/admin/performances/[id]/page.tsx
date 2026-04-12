import { db } from "@/db";
import { performances } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { PerformanceForm } from "@/components/admin/performance-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function AdminPerformanceEditorPage(
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const isNew = params.id === "new";

  let performance = null;
  if (!isNew) {
    performance = await db.query.performances.findFirst({
      where: eq(performances.id, params.id),
    });
    if (!performance) redirect("/admin/performances");
  }

  const allArtists = await db.query.artists.findMany();
  const allStages = await db.query.stages.findMany();
  const allCategories = await db.query.artistCategories.findMany();

  async function savePerformance(formData: FormData) {
    "use server";
    const date = formData.get("date") as string;
    const startTime = (formData.get("startTime") as string) + ":00";
    const endTime = (formData.get("endTime") as string) + ":00";
    const artistId = formData.get("artistId") as string;
    const stageId = formData.get("stageId") as string;
    const categoryId = formData.get("categoryId") as string;

    if (isNew) {
      await db.insert(performances).values({
        date,
        startTime,
        endTime,
        artistId,
        stageId,
        categoryId,
      });
    } else {
      await db
        .update(performances)
        .set({ date, startTime, endTime, artistId, stageId, categoryId })
        .where(eq(performances.id, params.id));
    }

    revalidatePath("/admin/performances");
    redirect("/admin/performances");
  }

  return (
    <div className="max-w-3xl flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/performances"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl sm:text-3xl uppercase tracking-tight">
          {isNew ? "Nové vystoupení" : "Upravit vystoupení"}
        </h1>
      </div>

      <PerformanceForm
        initialData={
          performance
            ? {
                ...performance,
                startTime: performance.startTime.slice(0, 5),
                endTime: performance.endTime.slice(0, 5),
              }
            : undefined
        }
        artistsList={allArtists}
        stagesList={allStages}
        categoriesList={allCategories}
        saveAction={savePerformance}
      />
    </div>
  );
}
