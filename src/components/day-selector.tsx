import Link from "next/link";
import { Button } from "@/components/ui/button";

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
        <Button
          key={day.date}
          asChild
          variant={selectedDay === day.date ? "default" : "outline"}
        >
          <Link href={`${basePath}?day=${day.date}`}>{day.label}</Link>
        </Button>
      ))}
    </div>
  );
}
