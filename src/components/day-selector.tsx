import Link from "next/link";
import { cn } from "@/lib/utils";

interface Day {
  readonly label: string;
  readonly date: string;
}

interface DaySelectorProps {
  days: ReadonlyArray<Day>;
  selectedDay: string;
  basePath?: string;
}

export function DaySelector({
  days,
  selectedDay,
  basePath = "/",
}: DaySelectorProps) {
  return (
    <div className="flex gap-1.5">
      {days.map((day) => (
        <Link
          key={day.date}
          href={`${basePath}?day=${day.date}`}
          className={cn(
            "px-3 py-1.5 text-sm font-medium transition-colors touch-manipulation border",
            selectedDay === day.date
              ? "bg-foreground text-background border-foreground"
              : "bg-transparent text-muted-foreground border-border hover:text-foreground hover:border-foreground"
          )}
        >
          {day.label}
        </Link>
      ))}
    </div>
  );
}
