import type { ClassEntry, ClassKind, DayNum, SectionId, SectionView, Filters } from "../types";
import { overlaps } from "./filtering";

export const classTypes: ClassKind[] = [
  "combined",
  "practical",
  "lecture-section",
  "network-section",
  "individual-section",
];

export function mins(s: string): number {
  const [h, m] = s.split(":").map(Number);
  return h * 60 + m;
}

export function fmtDur(m: number): string {
  const h = Math.floor(m / 60);
  const r = m % 60;
  return h ? `${h}h${r ? " " + r + "m" : ""}` : `${r}m`;
}

/** Existing classes overlapping the form's candidate slot (ignores the edited class). */
export function findOverlapsSafe(
  classes: ClassEntry[],
  f: {
    day: DayNum;
    start: string;
    end: string;
    type: ClassEntry["type"];
    sections: SectionId[];
  },
  ignoreId?: string,
): ClassEntry[] {
  const candidate: ClassEntry = {
    id: "__candidate__",
    subject: "",
    instructor: "",
    room: "",
    day: f.day,
    start: f.start,
    end: f.end,
    type: f.type,
    sections: f.sections,
  };
  return classes.filter(
    (c) =>
      c.id !== ignoreId &&
      c.type !== "combined" &&
      candidate.type !== "combined" &&
      overlaps(c, candidate),
  );
}
