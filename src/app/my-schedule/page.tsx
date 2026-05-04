import { auth } from "@/auth";
import { db } from "@/db";
import {
  performances,
  stages,
  artists,
  artistCategories,
  userSchedule,
} from "@/db/schema";
import { asc, eq, inArray } from "drizzle-orm";
import Link from "next/link";
import { ArrowLeft, Clock, Heart, HeartCrack } from "lucide-react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AppNav } from "@/components/app-nav";
import { DaySelector } from "@/components/day-selector";
import { ScheduleViews } from "@/components/schedule-views";
import { FESTIVAL_DAYS } from "@/lib/config";
import { toggleScheduleAction } from "@/app/actions";

export default async function MySchedulePage(props: {
  searchParams: Promise<{ day?: string; showArtist?: string }>;
}) {
  const searchParams = await props.searchParams;
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=%2Fmy-schedule");
  }

  const usInfo = await db
    .select()
    .from(userSchedule)
    .where(eq(userSchedule.userId, session.user.id));
  const performanceIds = usInfo.map((u) => u.performanceId);

  if (performanceIds.length === 0) {
    return (
      <div className="flex flex-col min-h-screen">
        <AppNav showBackLink />
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center max-w-sm mx-auto">
          <HeartCrack className="size-16 text-primary mb-5" />
          <h1 className="font-heading text-5xl uppercase mb-3 leading-tight">
            Tvůj plán je prázdný
          </h1>
          <p className="text-muted-foreground text-base mb-7">
            Zatím sis nic do plánu neuložil. Vrať se na lineup a naklikej svůj
            best program!
          </p>
          <Link href="/">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zpět na line-up
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const myLineup = await db
    .select({
      performance: performances,
      artist: artists,
      stage: stages,
      category: artistCategories,
    })
    .from(performances)
    .leftJoin(artists, eq(performances.artistId, artists.id))
    .leftJoin(stages, eq(performances.stageId, stages.id))
    .leftJoin(
      artistCategories,
      eq(performances.categoryId, artistCategories.id),
    )
    .where(inArray(performances.id, performanceIds))
    .orderBy(asc(performances.date), asc(performances.startTime));

  const stagesData = await db.query.stages.findMany({
    orderBy: [asc(stages.order)],
  });
  const selectedDay = searchParams.day || FESTIVAL_DAYS[0].date;

  return (
    <div className="flex flex-col min-h-screen">
      <AppNav showBackLink />

      <main className="flex-1 flex flex-col w-full overflow-hidden">
        <div className="border-b">
          <div className="container pb-5 pt-10">
            <h1 className="font-heading text-4xl sm:text-6xl uppercase mb-4 leading-none">
              Můj plán
            </h1>
            <DaySelector
              days={FESTIVAL_DAYS}
              selectedDay={selectedDay}
              basePath="/my-schedule"
            />
          </div>
        </div>

        <ScheduleViews
          performances={myLineup}
          stages={stagesData}
          selectedDay={selectedDay}
          userId={session.user.id}
          userScheduleSet={new Set(performanceIds)}
          showArtistId={searchParams.showArtist}
          toggleAction={toggleScheduleAction}
        />
      </main>
    </div>
  );
}
