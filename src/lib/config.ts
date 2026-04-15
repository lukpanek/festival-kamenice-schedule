export const FESTIVAL_DAYS = [
  { label: "Čtvrtek 4. 6.", date: "2026-06-04" },
  { label: "Pátek 5. 6.", date: "2026-06-05" },
  { label: "Sobota 6. 6.", date: "2026-06-06" },
] as const;

export type FestivalDay = (typeof FESTIVAL_DAYS)[number];
