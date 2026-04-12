import { NextResponse } from "next/server";
import { db } from "@/db";
import { performances, artists, stages, artistCategories } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET() {
  try {
    const data = await db.select({
      performance: performances,
      artist: artists,
      stage: stages,
      category: artistCategories,
    })
    .from(performances)
    .leftJoin(artists, eq(performances.artistId, artists.id))
    .leftJoin(stages, eq(performances.stageId, stages.id))
    .leftJoin(artistCategories, eq(performances.categoryId, artistCategories.id))
    .orderBy(asc(performances.date), asc(performances.startTime));

    // Formátování do čistého strukturovaného JSON grafu pro externí integrace
    const groupedByDay = data.reduce((acc, curr) => {
      const date = curr.performance.date;
      if (!acc[date]) {
         acc[date] = { date, stages: {} };
      }
      
      const stageName = curr.stage?.name || 'Unknown Stage';
      if (!acc[date].stages[stageName]) {
         acc[date].stages[stageName] = [];
      }

      acc[date].stages[stageName].push({
         id: curr.performance.id,
         startTime: curr.performance.startTime,
         endTime: curr.performance.endTime,
         artist: curr.artist ? {
            id: curr.artist.id,
            name: curr.artist.name,
            genre: curr.artist.genre,
            imageUrl: curr.artist.imageUrl,
         } : null,
         category: curr.category ? {
            name: curr.category.name,
            color: curr.category.color,
         } : null
      });

      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json(Object.values(groupedByDay));
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch schedule" }, { status: 500 });
  }
}
