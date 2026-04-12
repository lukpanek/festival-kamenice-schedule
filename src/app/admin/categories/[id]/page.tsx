import { db } from "@/db";
import { artistCategories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { CategoryForm } from "@/components/admin/category-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function AdminCategoryEditorPage(
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const isNew = params.id === "new";

  let category = null;
  if (!isNew) {
    category = await db.query.artistCategories.findFirst({
      where: eq(artistCategories.id, params.id),
    });
    if (!category) redirect("/admin/categories");
  }

  async function saveCategory(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const color = formData.get("color") as string;

    if (isNew) {
      await db.insert(artistCategories).values({ name, color });
    } else {
      await db
        .update(artistCategories)
        .set({ name, color })
        .where(eq(artistCategories.id, params.id));
    }

    revalidatePath("/admin/categories");
    redirect("/admin/categories");
  }

  return (
    <div className="max-w-2xl flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/categories"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl sm:text-3xl uppercase tracking-tight">
          {isNew ? "Nová kategorie" : "Upravit kategorii"}
        </h1>
      </div>

      <CategoryForm
        initialData={category}
        categoryId={params.id}
        saveAction={saveCategory}
      />
    </div>
  );
}
