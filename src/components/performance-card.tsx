import Link from "next/link";
import { Heart } from "lucide-react";

interface PerformanceCardProps {
  performanceId: string;
  selectedDay: string;
  startTime: string;
  endTime: string;
  artistName: string | undefined;
  startPx: number;
  widthPx: number;
  isAdded: boolean;
}

export function PerformanceCard({
  performanceId,
  selectedDay,
  startTime,
  endTime,
  artistName,
  startPx,
  widthPx,
  isAdded,
}: PerformanceCardProps) {
  return (
    <Link
      href={`?day=${selectedDay}&showArtist=${performanceId}`}
      scroll={false}
      className="absolute top-2 bottom-2 p-2 hover:outline-primary text-black dark:text-white hover:outline-2 border bg-muted transition-[colors,width,shadow] overflow-hidden hover:overflow-visible flex flex-col justify-between group z-40 hover:!w-fit"
      style={{
        left: startPx,
        width: widthPx,
        minWidth: widthPx,
      }}
    >
      <div className="flex justify-between gap-2 items-center">
        <span className="font-mono text-sm text-black/75 dark:text-white/75 leading-none">
          {startTime.slice(0, 5)}–{endTime.slice(0, 5)}
        </span>
      </div>
      <div className="flex items-end justify-between gap-1">
        <p className="leading-none font-bold text-md truncate">
          {artistName ?? ""}
        </p>
        {isAdded && (
          <Heart className="size-4 text-red-500 fill-red-500 shrink-0 mb-0.5" />
        )}
      </div>
    </Link>
  );
}
