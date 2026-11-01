import type {
  ClassEntry,
  ClassKind,
  DayNum,
  Filters,
  SectionId,
  SectionView,
} from "../types";
import { DAY_BY_NUM, SECTION_LABELS, SUBJECTS } from "../types";

export const mins = (s: string): number => {
  const [h, m] = s.split(":").map(Number);
  return h * 60 + m;
};

export const fmtMin = (m: number): string => {
  const h = Math.floor(m / 60);
  const r = m % 60;
  const ap = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(r).padStart(2, "0")} ${ap}`;
};

export const fmtTime = (s: string): string => fmtMin(mins(s));

export const fmtDur = (m: number): string => {
  const h = Math.floor(m / 60);
  const r = m % 60;
  return h ? h + "h" + (r ? " " + r + "m" : "") : r + "m";
};

export const isLive = (c: ClassEntry, now = new Date()): boolean => {
  const nm = now.getHours() * 60 + now.getMinutes();
  return c.day === now.getDay() && nm >= mins(c.start) && nm < mins(c.end);
};

/** Does this class belong to a given section view? */
export function matchesSection(c: ClassEntry, section: SectionView): boolean {
  if (section === "full") return true;
  // Combined / general lectures (all sections or unassigned) are always visible.
  if (c.sections.length === 0) return true;
  return c.sections.includes(section);
}

/** Multi-select section filter: keep class if it matches ANY selected section. */
function matchesSectionFilter(c: ClassEntry, selected: SectionId[]): boolean {
  if (selected.length === 0) return true;
  if (c.sections.length === 0) return true; // general lecture visible for any pick
  return c.sections.some((s) => selected.includes(s));
}

function matchesTime(c: ClassEntry, f: Filters["time"]): boolean {
  const s = mins(c.start);
  const e = mins(c.end);
  switch (f.mode) {
    case "all":
      return true;
    case "morning":
      return s < mins("12:00");
    case "afternoon":
      return s >= mins("12:00");
    case "start-after":
      return f.value ? s >= mins(f.value) : true;
    case "end-before":
      return f.value ? e <= mins(f.value) : true;
    case "range": {
      const from = f.from ? mins(f.from) : 0;
      const to = f.to ? mins(f.to) : 24 * 60;
      return s < to && e > from;
    }
  }
}

/** Section label shown on a card, e.g. "Sections 2 & 3". */
export function sectionLabel(c: ClassEntry): string {
  if (c.type === "combined") return "All Sections";
  if (c.sections.length === 0) {
    if (c.type === "practical") return "Practical";
    if (c.type === "lecture-section") return "Lecture / Section";
    if (c.type === "network-section") return "Network";
    return "General";
  }
  if (c.sections.length === 1) return SECTION_LABELS[c.sections[0]];
  return "Sections " + c.sections.map((s) => SECTION_LABELS[s].replace("Section ", "")).join(" & ");
}

export function kindLabel(c: ClassEntry): string {
  if (c.type === "combined") return "Combined Lecture";
  if (c.type === "network-section") return "Network Section";
  if (c.type === "practical") return "Practical Section";
  if (c.type === "lecture-section") return "Lecture / Section";
  return "Section";
}

export function overlaps(a: ClassEntry, b: ClassEntry): boolean {
  return a.day === b.day && mins(a.start) < mins(b.end) && mins(b.start) < mins(a.end);
}

/** Full pipeline: section view + all filters + customization hiding. */
export function filterClasses(
  classes: ClassEntry[],
  section: SectionView,
  filters: Filters,
  hidden: { subjects: string[]; instructors: string[]; days: DayNum[] },
): ClassEntry[] {
  const q = filters.search.trim().toLowerCase();
  return classes.filter((c) => {
    if (!matchesSection(c, section)) return false;
    if (hidden.subjects.includes(c.subject)) return false;
    if (hidden.instructors.includes(c.instructor)) return false;
    if (hidden.days.includes(c.day)) return false;

    if (filters.days.length && !filters.days.includes(c.day)) return false;
    if (filters.subjects.length && !filters.subjects.includes(c.subject)) return false;
    if (!matchesSectionFilter(c, filters.sections)) return false;
    if (filters.instructors.length && !filters.instructors.includes(c.instructor)) return false;
    if (filters.rooms.length && !filters.rooms.includes(c.room)) return false;
    if (filters.types.length && !filters.types.includes(c.type)) return false;
    if (!matchesTime(c, filters.time)) return false;

    if (q) {
      const hay = [
        SUBJECTS[c.subject]?.name ?? c.subject,
        c.instructor,
        c.room,
        kindLabel(c),
        sectionLabel(c),
        c.notes ?? "",
        DAY_BY_NUM(c.day).name,
      ]
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function countActiveFilters(f: Filters): number {
  let n = 0;
  if (f.days.length) n += f.days.length;
  if (f.subjects.length) n += f.subjects.length;
  if (f.sections.length) n += f.sections.length;
  if (f.instructors.length) n += f.instructors.length;
  if (f.rooms.length) n += f.rooms.length;
  if (f.types.length) n += f.types.length;
  if (f.time.mode !== "all") n += 1;
  if (f.search.trim()) n += 1;
  return n;
}

export function collectFacets(classes: ClassEntry[]) {
  const instructors = new Set<string>();
  const rooms = new Set<string>();
  classes.forEach((c) => {
    instructors.add(c.instructor);
    rooms.add(c.room);
  });
  return {
    instructors: [...instructors].sort(),
    rooms: [...rooms].sort(),
  };
}

export interface Stats {
  total: number;
  hours: number;
  perSubject: { key: string; name: string; color: string; count: number; minutes: number }[];
  perDay: { day: DayNum; name: string; count: number; minutes: number }[];
}

export function computeStats(classes: ClassEntry[]): Stats {
  const perSubject = new Map<string, { count: number; minutes: number }>();
  const perDay = new Map<DayNum, { count: number; minutes: number }>();
  let minutes = 0;
  classes.forEach((c) => {
    const dur = mins(c.end) - mins(c.start);
    minutes += dur;
    const s = perSubject.get(c.subject) ?? { count: 0, minutes: 0 };
    s.count++;
    s.minutes += dur;
    perSubject.set(c.subject, s);
    const d = perDay.get(c.day) ?? { count: 0, minutes: 0 };
    d.count++;
    d.minutes += dur;
    perDay.set(c.day, d);
  });
  return {
    total: classes.length,
    hours: Math.round((minutes / 60) * 10) / 10,
    perSubject: [...perSubject.entries()]
      .map(([key, v]) => ({
        key,
        name: SUBJECTS[key]?.name ?? key,
        color: SUBJECTS[key]?.color ?? "var(--mark)",
        ...v,
      }))
      .sort((a, b) => b.minutes - a.minutes),
    perDay: [...perDay.entries()]
      .map(([day, v]) => ({ day, name: DAY_BY_NUM(day).name, ...v }))
      .sort((a, b) => a.day - b.day),
  };
}

export function nextClass(classes: ClassEntry[], now = new Date()): ClassEntry | null {
  const nm = now.getHours() * 60 + now.getMinutes();
  const today = now.getDay();
  const todays = classes.filter((c) => c.day === today).sort((a, b) => mins(a.start) - mins(b.start));
  const live = todays.find((c) => mins(c.start) <= nm && nm < mins(c.end));
  if (live) return live;
  return todays.find((c) => mins(c.start) > nm) ?? null;
}

export const classTypes: ClassKind[] = [
  "combined",
  "practical",
  "lecture-section",
  "network-section",
  "individual-section",
];
