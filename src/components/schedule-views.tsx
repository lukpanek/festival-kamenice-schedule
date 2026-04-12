"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Heart, ChevronRight, LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { ArtistDialog } from "@/components/artist-dialog";

const START_HOUR = 13;
const END_HOUR = 28;
const PX_PER_MINUTE = 2;
const TIMELINE_WIDTH = (END_HOUR - START_HOUR) * 60 * PX_PER_MINUTE;

function timeToPixels(timeStr: string) {
  let h: number;
  const m: number = +(timeStr.split(":")[1]);
  h = +(timeStr.split(":")[0]);
  if (h < START_HOUR) h += 24;
  return ((h - START_HOUR) * 60 + m) * PX_PER_MINUTE;
}

export function ScheduleViews({
  performances,
  stages,
  selectedDay,
  userId,
  userScheduleSet,
  toggleAction,
  showArtistId,
}: {
  performances: any[];
  stages: any[];
  selectedDay: string;
  userId?: string;
  userScheduleSet: Set<string>;
  toggleAction: (perfId: string) => Promise<void>;
  showArtistId?: string;
}) {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const [viewState, setViewState] = useState<"timetable" | "list">(
    isMobile ? "list" : "timetable"
  );

  const todaysPerformances = useMemo(
    () => performances.filter((p) => p.performance.date === selectedDay),
    [performances, selectedDay]
  );

  const hours = useMemo(() => {
    const arr = [];
    for (let h = START_HOUR; h < END_HOUR; h++) {
      arr.push(h >= 24 ? h - 24 : h);
    }
    return arr;
  }, []);

  const selectedArtistDetails = useMemo(() => {
    if (!showArtistId) return null;
    return todaysPerformances.find((p) => p.performance.id === showArtistId) ?? null;
  }, [showArtistId, todaysPerformances]);

  return (
    <div className="flex-1 flex flex-col w-full h-full">
      {/* View toggle */}
      <div className="border-b bg-background/95 backdrop-blur sticky top-16 z-30">
        <div className="container flex items-center gap-1 h-11">
          <button
            onClick={() => setViewState("timetable")}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 h-full text-sm font-medium border-b-2 transition-colors touch-manipulation",
              viewState === "timetable"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Rozvrh
          </button>
          <button
            onClick={() => setViewState("list")}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 h-full text-sm font-medium border-b-2 transition-colors touch-manipulation",
              viewState === "list"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <List className="w-3.5 h-3.5" />
            Seznam
          </button>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden flex flex-col">
        {viewState === "timetable" ? (
          <div className="relative flex-1 overflow-hidden flex flex-col">
            <div
              className="flex-1 overflow-auto flex text-sm"
              style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}
            >
              {/* Sticky stage column */}
              <div className="sticky left-0 z-20 flex flex-col bg-background border-r shrink-0 shadow-sm w-24 md:w-36">
                <div className="h-8 border-b flex items-center px-3 font-bold uppercase text-[10px] text-muted-foreground bg-muted/40 shrink-0">
                  Stage
                </div>
                {stages.map((stage) => (
                  <div
                    key={stage.id}
                    className="h-24 border-b flex flex-col justify-center px-3 shrink-0 bg-background"
                  >
                    <h3 className="uppercase text-2xl leading-none">
                      {stage.name}
                    </h3>
                  </div>
                ))}
              </div>

              {/* Timeline */}
              <div className="relative shrink-0" style={{ width: TIMELINE_WIDTH }}>
                <div className="h-8 border-b sticky top-0 z-10 flex bg-muted/20">
                  {hours.map((h, i) => (
                    <div
                      key={i}
                      className="shrink-0 flex items-center px-2 border-l border-border/40 text-[10px] font-medium text-muted-foreground font-mono"
                      style={{ width: 60 * PX_PER_MINUTE }}
                    >
                      {String(h).padStart(2, "0")}:00
                    </div>
                  ))}
                </div>

                <div className="absolute top-8 bottom-0 left-0 w-full flex pointer-events-none">
                  {hours.map((_, i) => (
                    <div
                      key={i}
                      className="shrink-0 h-full border-l border-border/20"
                      style={{ width: 60 * PX_PER_MINUTE }}
                    />
                  ))}
                </div>

                <div className="flex flex-col">
                  {stages.map((stage) => {
                    const stagePerformances = todaysPerformances.filter(
                      (p) => p.performance.stageId === stage.id
                    );

                    return (
                      <div key={stage.id} className="h-24 border-b relative">
                        {stagePerformances.map(({ performance, artist, category }) => {
                          const startPx = timeToPixels(performance.startTime);
                          const endPx = timeToPixels(performance.endTime);
                          const widthPx = Math.max(endPx - startPx, 48);
                          const isAdded = userScheduleSet.has(performance.id);

                          return (
                            <Link
                              key={performance.id}
                              href={`?day=${selectedDay}&showArtist=${performance.id}`}
                              scroll={false}
                              className="absolute top-2 bottom-2 p-2 border bg-card hover:bg-muted/60 transition-colors overflow-hidden flex flex-col justify-between group touch-manipulation"
                              style={{
                                left: startPx,
                                width: widthPx,
                                borderLeft: `3px solid ${category?.color || "var(--primary)"}`,
                              }}
                            >
                              <span className="font-mono text-[9px] text-muted-foreground leading-none">
                                {performance.startTime.slice(0, 5)}–
                                {performance.endTime.slice(0, 5)}
                              </span>
                              <div className="flex items-end justify-between gap-1">
                                <span className="text-[11px] md:text-xs uppercase leading-tight truncate">
                                  {artist?.name || "???"}
                                </span>
                                {isAdded && (
                                  <Heart className="w-2.5 h-2.5 fill-primary text-primary shrink-0 mb-0.5" />
                                )}
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>

                {todaysPerformances.length === 0 && (
                  <div className="p-8 text-muted-foreground text-xs flex justify-center mt-8">
                    Pro {selectedDay} zatím nejsou interpreti.
                  </div>
                )}
              </div>
            </div>

            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 bg-linear-to-l from-background/80 to-transparent z-10" />
          </div>
        ) : (
          /* List view */
          <div className="flex-1 overflow-auto">
            {todaysPerformances.length === 0 ? (
              <div className="container py-16">
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <p className="text-sm">Pro tento den zatím nejsou interpreti.</p>
                </div>
              </div>
            ) : (
              <div className="divide-y">
                {todaysPerformances.map(({ performance, artist, stage, category }) => {
                  const isAdded = userScheduleSet.has(performance.id);
                  const stageName =
                    stage?.name ??
                    stages.find((s) => s.id === performance.stageId)?.name;

                  return (
                    <div key={performance.id} className="relative group flex items-stretch">
                      <div
                        className="w-[3px] shrink-0 self-stretch"
                        style={{ backgroundColor: category?.color || "transparent" }}
                      />

                      <div className="flex-1 flex items-center gap-3 sm:gap-4 px-4 py-3.5 min-w-0">
                        <div className="shrink-0 text-right w-[52px]">
                          <span className="font-mono text-xs font-semibold text-foreground block leading-tight">
                            {performance.startTime.slice(0, 5)}
                          </span>
                          <span className="font-mono text-[10px] text-muted-foreground block leading-tight mt-0.5">
                            {performance.endTime.slice(0, 5)}
                          </span>
                        </div>

                        <div className="w-px self-stretch bg-border shrink-0" />

                        <div className="flex-1 min-w-0">
                          <p className="text-base sm:text-lg uppercase leading-tight truncate">
                            {artist?.name || "???"}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            {stageName && (
                              <span className="text-[11px] font-semibold uppercase text-muted-foreground">
                                {stageName}
                              </span>
                            )}
                            {category?.name && (
                              <>
                                <span className="text-muted-foreground/40 text-[11px]">·</span>
                                <span className="text-[11px] text-muted-foreground/70">
                                  {category.name}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-0 pr-1 shrink-0">
                        {userId && (
                          <form action={() => toggleAction(performance.id)}>
                            <button
                              type="submit"
                              className={cn(
                                "p-3 touch-manipulation transition-colors",
                                isAdded
                                  ? "text-primary"
                                  : "text-muted-foreground hover:text-foreground"
                              )}
                              aria-label={isAdded ? "Odebrat z plánu" : "Přidat do plánu"}
                            >
                              <Heart
                                className={cn("w-4 h-4", isAdded && "fill-current")}
                              />
                            </button>
                          </form>
                        )}
                        <Link
                          href={`?day=${selectedDay}&showArtist=${performance.id}`}
                          scroll={false}
                          className="p-3 text-muted-foreground hover:text-foreground transition-colors touch-manipulation"
                          aria-label={`Detail ${artist?.name}`}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedArtistDetails && (
        <ArtistDialog
          selectedArtistDetails={selectedArtistDetails}
          selectedDay={selectedDay}
          userId={userId}
          isAdded={userScheduleSet.has(selectedArtistDetails.performance.id)}
          toggleScheduleAction={async () => {
            await toggleAction(selectedArtistDetails.performance.id);
          }}
        />
      )}
    </div>
  );
}
