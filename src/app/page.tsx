import { auth } from "@/auth";
import { db } from "@/db";
import { performances, stages, artists, artistCategories, userSchedule } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { AppNav } from "@/components/app-nav";
import { DaySelector } from "@/components/day-selector";
import { ScheduleViews } from "@/components/schedule-views";
import { FESTIVAL_DAYS } from "@/lib/config";
import { toggleScheduleAction } from "@/app/actions";

export default async function HomePage(
  props: { searchParams: Promise<{ day?: string; showArtist?: string }> }
) {
  const searchParams = await props.searchParams;
  const session = await auth();
  const selectedDay = searchParams.day || FESTIVAL_DAYS[0].date;

  const allStages = await db.query.stages.findMany({ orderBy: [asc(stages.order)] });

  const todaysPerformances = await db
    .select({
      performance: performances,
      artist: artists,
      stage: stages,
      category: artistCategories,
    })
    .from(performances)
    .leftJoin(artists, eq(performances.artistId, artists.id))
    .leftJoin(stages, eq(performances.stageId, stages.id))
    .leftJoin(artistCategories, eq(performances.categoryId, artistCategories.id))
    .where(eq(performances.date, selectedDay))
    .orderBy(asc(performances.startTime));

  const userScheduleSet = new Set<string>();
  if (session?.user?.id) {
    const rows = await db
      .select()
      .from(userSchedule)
      .where(eq(userSchedule.userId, session.user.id));
    rows.forEach((r) => userScheduleSet.add(r.performanceId));
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AppNav />

      <main className="flex-1 flex flex-col w-full overflow-hidden">
        <div className="border-b">
          <div className="container py-5">
            <h1 className="font-heading text-4xl sm:text-5xl uppercase mb-4 leading-none">
              Lineup 2026
            </h1>
            <DaySelector days={FESTIVAL_DAYS} selectedDay={selectedDay} basePath="/" />
          </div>
        </div>

        <ScheduleViews
          performances={todaysPerformances}
          stages={allStages}
          selectedDay={selectedDay}
          userId={session?.user?.id}
          userScheduleSet={userScheduleSet}
          showArtistId={searchParams.showArtist}
          toggleAction={toggleScheduleAction}
        />
      </main>
    </div>
  );
}
