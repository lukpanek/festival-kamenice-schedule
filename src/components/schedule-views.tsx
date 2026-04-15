"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Heart, ChevronRight, LayoutGrid, List, CalendarX } from "lucide-react";
import { cn } from "@/lib/utils";
import { ArtistDialog } from "@/components/artist-dialog";
import { PerformanceCard } from "@/components/performance-card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const START_HOUR = 13;
const END_HOUR = 28;
const PX_PER_MINUTE = 3;
const TIMELINE_WIDTH = (END_HOUR - START_HOUR) * 60 * PX_PER_MINUTE;

function timeToPixels(timeStr: string) {
  let h: number;
  const m: number = +timeStr.split(":")[1];
  h = +timeStr.split(":")[0];
  if (h < START_HOUR) h += 24;
  return ((h - START_HOUR) * 60 + m) * PX_PER_MINUTE;
}

function getNowPixels() {
  const now = new Date();
  let h = now.getHours();
  const m = now.getMinutes();
  if (h < START_HOUR) h += 24;
  if (h < START_HOUR || h >= END_HOUR) return null;
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
    isMobile ? "list" : "timetable",
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const [nowPx, setNowPx] = useState<number | null>(null);
  const hasScrolled = useRef(false);

  const updateNow = useCallback(() => {
    setNowPx(getNowPixels());
  }, []);

  useEffect(() => {
    updateNow();
    const interval = setInterval(updateNow, 60_000);
    return () => clearInterval(interval);
  }, [updateNow]);

  useEffect(() => {
    if (hasScrolled.current || nowPx === null || !scrollRef.current) return;
    const stageColWidth =
      scrollRef.current.querySelector<HTMLElement>("[data-stage-col]")
        ?.offsetWidth ?? 96;
    scrollRef.current.scrollLeft = Math.max(0, nowPx - 120 + stageColWidth);
    hasScrolled.current = true;
  }, [nowPx, viewState]);

  const todaysPerformances = useMemo(
    () => performances.filter((p) => p.performance.date === selectedDay),
    [performances, selectedDay],
  );

  const activeStages = useMemo(() => {
    return stages.filter((stage) =>
      todaysPerformances.some((p) => p.performance.stageId === stage.id),
    );
  }, [stages, todaysPerformances]);

  const hours = useMemo(() => {
    const arr = [];
    for (let h = START_HOUR; h < END_HOUR; h++) {
      arr.push(h >= 24 ? h - 24 : h);
    }
    return arr;
  }, []);

  const selectedArtistDetails = useMemo(() => {
    if (!showArtistId) return null;
    return (
      todaysPerformances.find((p) => p.performance.id === showArtistId) ?? null
    );
  }, [showArtistId, todaysPerformances]);

  return (
    <div className="flex-1 flex flex-col w-full h-full">
      <Tabs
        value={viewState}
        onValueChange={(v) => setViewState(v as "timetable" | "list")}
        className="flex-1 flex flex-col w-full h-full"
      >
        {/* View toggle */}
        <div className="border-b bg-background/95 backdrop-blur sticky top-16 z-30">
          <div className="container flex items-center h-11">
            <TabsList variant="line">
              <TabsTrigger value="timetable">
                <LayoutGrid />
                Rozvrh
              </TabsTrigger>
              <TabsTrigger value="list">
                <List />
                Seznam
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <div className="flex-1 relative overflow-hidden flex flex-col">
          <TabsContent
            value="timetable"
            className="flex-1 relative overflow-hidden flex flex-col m-0"
          >
            {todaysPerformances.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center max-w-sm mx-auto">
                <CalendarX className="size-16 text-primary mb-5" />
                <h1 className="font-heading text-5xl uppercase mb-3 leading-tight">
                  Žádný program
                </h1>
                <p className="text-muted-foreground text-base">
                  Tento den zatím není
                  <br />
                  naplánovaný žádný program.
                </p>
              </div>
            ) : (
              <div className="relative flex-1 overflow-hidden">
                <div
                  ref={scrollRef}
                  className="absolute inset-0 overflow-auto flex text-sm"
                  style={
                    { WebkitOverflowScrolling: "touch" } as React.CSSProperties
                  }
                >
                  {/* Sticky stage column */}
                  <div
                    data-stage-col
                    className="sticky left-0 z-20 flex flex-col bg-muted border-r shrink-0 w-24 md:w-36 z-50"
                  >
                    <div className="h-9 border-b flex items-center px-3 font-bold uppercase text-sm text-muted-foreground bg-muted shrink-0">
                      Stage
                    </div>
                    {activeStages.map((stage) => (
                      <div
                        key={stage.id}
                        className="h-18 border-b z-50 flex flex-col justify-center px-3 py-2 shrink-0 bg-muted/40"
                      >
                        <p className="uppercase font-bold">{stage.name}</p>
                      </div>
                    ))}
                  </div>

                  {/* Timeline */}
                  <div
                    className="relative shrink-0"
                    style={{ width: TIMELINE_WIDTH }}
                  >
                    <div className="h-9 border-b sticky top-0 z-10 flex bg-muted/20">
                      {hours.map((h, i) => (
                        <div
                          key={i}
                          className="shrink-0 flex items-center px-2 border-l border-border/40 text-sm font-medium text-muted-foreground font-mono"
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
                          className="shrink-0 h-full relative"
                          style={{ width: 60 * PX_PER_MINUTE }}
                        >
                          <div className="absolute inset-y-0 left-0 border-l border-border/50" />
                          <div
                            className="absolute inset-y-0 border-l border-border/30"
                            style={{ left: 15 * PX_PER_MINUTE }}
                          />
                          <div
                            className="absolute inset-y-0 border-l border-border/30"
                            style={{ left: 30 * PX_PER_MINUTE }}
                          />
                          <div
                            className="absolute inset-y-0 border-l border-border/30"
                            style={{ left: 45 * PX_PER_MINUTE }}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col">
                      {activeStages.map((stage) => {
                        const stagePerformances = todaysPerformances.filter(
                          (p) => p.performance.stageId === stage.id,
                        );

                        return (
                          <div
                            key={stage.id}
                            className="h-18 border-b relative"
                          >
                            {stagePerformances.map(
                              ({ performance, artist, category }) => {
                                const startPx = timeToPixels(
                                  performance.startTime,
                                );
                                const endPx = timeToPixels(performance.endTime);
                                const widthPx = Math.max(endPx - startPx, 48);
                                const isAdded = userScheduleSet.has(
                                  performance.id,
                                );

                                return (
                                  <PerformanceCard
                                    key={performance.id}
                                    performanceId={performance.id}
                                    selectedDay={selectedDay}
                                    startTime={performance.startTime}
                                    endTime={performance.endTime}
                                    artistName={artist?.name}
                                    categoryColor={category?.color ?? undefined}
                                    startPx={startPx}
                                    widthPx={widthPx}
                                    isAdded={isAdded}
                                  />
                                );
                              },
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {nowPx !== null && (
                      <div
                        className="absolute top-0 bottom-0 z-10 pointer-events-none"
                        style={{ left: nowPx }}
                      >
                        <div className="absolute -translate-x-1/2 bg-red-500 dark:text-black text-white text-xs font-mono font-bold px-1 py-px rounded-sm leading-tight">
                          TEĎ
                        </div>
                        <div className="w-px h-full bg-red-500 mx-auto" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 bg-linear-to-l from-background/80 to-transparent z-10" />
              </div>
            )}
          </TabsContent>
          <TabsContent value="list" className="flex-1 overflow-auto m-0">
            <div className="flex-1 overflow-auto">
              {todaysPerformances.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center max-w-sm mx-auto">
                  <CalendarX className="size-16 text-primary mb-5" />
                  <h1 className="font-heading text-5xl uppercase mb-3 leading-tight">
                    Žádný program
                  </h1>
                  <p className="text-muted-foreground text-base">
                    Tento den zatím není
                    <br />
                    naplánovaný žádný program.
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {todaysPerformances.map(
                    ({ performance, artist, stage, category }) => {
                      const isAdded = userScheduleSet.has(performance.id);
                      const stageName =
                        stage?.name ??
                        stages.find((s) => s.id === performance.stageId)?.name;

                      return (
                        <div
                          key={performance.id}
                          className="relative group flex items-stretch"
                        >
                          <div
                            className="w-0.5 shrink-0 self-stretch"
                            style={{
                              backgroundColor: category?.color || "transparent",
                            }}
                          />

                          <div className="flex-1 flex items-center gap-3 sm:gap-4 px-4 py-3.5 min-w-0">
                            <div className="shrink-0 text-right w-14">
                              <span className="font-mono text-sm font-semibold text-foreground block leading-tight">
                                {performance.startTime.slice(0, 5)}
                              </span>
                              <span className="font-mono text-xs text-muted-foreground block leading-tight mt-0.5">
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
                                  <span className="text-xs font-semibold uppercase text-muted-foreground">
                                    {stageName}
                                  </span>
                                )}
                                {category?.name && (
                                  <>
                                    <span className="text-muted-foreground/40 text-xs">
                                      ·
                                    </span>
                                    <span className="text-xs text-muted-foreground/70">
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
                                      : "text-muted-foreground hover:text-foreground",
                                  )}
                                  aria-label={
                                    isAdded
                                      ? "Odebrat z plánu"
                                      : "Přidat do plánu"
                                  }
                                >
                                  <Heart
                                    className={cn(
                                      "w-4 h-4",
                                      isAdded && "fill-current",
                                    )}
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
                    },
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>

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
