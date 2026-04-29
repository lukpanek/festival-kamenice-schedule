import { db } from "@/db";
import { stages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { StageForm } from "@/components/admin/stage-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function AdminStageEditorPage(
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const isNew = params.id === "new";

  let stage = null;
  if (!isNew) {
    stage = await db.query.stages.findFirst({
      where: eq(stages.id, params.id),
    });
    if (!stage) redirect("/admin/stages");
  }

  async function saveStage(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const order = parseInt(formData.get("order") as string) || 0;
    const description = formData.get("description") as string;

    if (isNew) {
      await db.insert(stages).values({ name, order, description });
    } else {
      await db
        .update(stages)
        .set({ name, order, description })
        .where(eq(stages.id, params.id));
    }

    revalidatePath("/admin/stages");
    redirect("/admin/stages");
  }

  return (
    <div className="max-w-2xl flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/stages"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="md:text-5xl text-4xl uppercase">
          {isNew ? "Nové pódium" : "Upravit pódium"}
        </h1>
      </div>

      <StageForm
        initialData={stage}
        stageId={params.id}
        saveAction={saveStage}
      />
    </div>
  );
}
