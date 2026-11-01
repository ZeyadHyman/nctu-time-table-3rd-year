import type { ClassEntry, DayNum, DisplayPrefs, Filters, SavedView, SectionView } from "../types";

export interface ExportPayload {
  app: "software-timetable";
  version: 2;
  exportedAt: string;
  classes: ClassEntry[];
  savedViews?: SavedView[];
}

export function buildExport(classes: ClassEntry[], savedViews?: SavedView[]): string {
  const payload: ExportPayload = {
    app: "software-timetable",
    version: 2,
    exportedAt: new Date().toISOString(),
    classes,
    ...(savedViews ? { savedViews } : {}),
  };
  return JSON.stringify(payload, null, 2);
}

export function downloadJson(filename: string, content: string) {
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const KINDS = ["combined", "practical", "lecture-section", "network-section", "individual-section"];
const SECTIONS = ["1", "2", "3", "4", "5", "network"];

export function validateClasses(
  data: unknown,
): { ok: true; classes: ClassEntry[] } | { ok: false; error: string } {
  if (typeof data !== "object" || data === null) return { ok: false, error: "File is not a JSON object." };
  const obj = data as Record<string, unknown>;
  let arr: unknown = obj.classes;
  if (!Array.isArray(arr)) {
    if (Array.isArray(obj)) arr = obj;
    else return { ok: false, error: 'Missing "classes" array.' };
  }
  const list = arr as unknown[];
  if (list.length === 0) return { ok: false, error: "The classes array is empty." };
  const classes: ClassEntry[] = [];
  for (let i = 0; i < list.length; i++) {
    const c = list[i] as Record<string, unknown>;
    const err = (msg: string) => ({ ok: false as const, error: `Class #${i + 1}: ${msg}` });
    if (typeof c !== "object" || c === null) return err("not an object.");
    if (typeof c.subject !== "string" || !c.subject) return err("subject is required.");
    if (typeof c.instructor !== "string" || !c.instructor) return err("instructor is required.");
    if (typeof c.room !== "string" || !c.room) return err("room is required.");
    if (typeof c.day !== "number" || c.day < 0 || c.day > 6 || !Number.isInteger(c.day))
      return err("day must be an integer 0-6.");
    if (typeof c.start !== "string" || !TIME_RE.test(c.start)) return err('start must be "HH:MM".');
    if (typeof c.end !== "string" || !TIME_RE.test(c.end)) return err('end must be "HH:MM".');
    if (c.end <= c.start) return err("end time must be after start time.");
    if (typeof c.type !== "string" || !KINDS.includes(c.type)) return err("type is invalid.");
    if (!Array.isArray(c.sections)) return err("sections must be an array.");
    for (const s of c.sections) {
      if (!SECTIONS.includes(s as string)) return err(`unknown section "${String(s)}".`);
    }
    classes.push({
      id: typeof c.id === "string" && c.id ? c.id : `import-${i}-${Math.random().toString(36).slice(2, 8)}`,
      subject: c.subject,
      instructor: c.instructor,
      room: c.room,
      day: c.day as DayNum,
      start: c.start,
      end: c.end,
      type: c.type as ClassEntry["type"],
      sections: c.sections as ClassEntry["sections"],
      notes: typeof c.notes === "string" ? c.notes : undefined,
    });
  }
  return { ok: true, classes };
}

export function validateSavedViews(data: unknown): SavedView[] {
  if (typeof data !== "object" || data === null) return [];
  const arr = (data as Record<string, unknown>).savedViews;
  if (!Array.isArray(arr)) return [];
  const views: SavedView[] = [];
  for (const v of arr) {
    const o = v as Record<string, unknown>;
    if (typeof o?.id !== "string" || typeof o?.name !== "string") continue;
    views.push({
      id: o.id,
      name: o.name,
      filters: (o.filters as Filters) ?? emptyFilters(),
      section: (o.section as SectionView) ?? "full",
      prefs: { ...defaultPrefs(), ...((o.prefs as DisplayPrefs) ?? {}) },
    });
  }
  return views;
}

function emptyFilters(): Filters {
  return {
    days: [],
    subjects: [],
    sections: [],
    instructors: [],
    rooms: [],
    types: [],
    time: { mode: "all" },
    search: "",
  };
}

function defaultPrefs(): DisplayPrefs {
  return {
    view: "grid",
    showInstructor: true,
    showRoom: true,
    showType: true,
    showSection: true,
    showTime: true,
    showCombined: true,
    sortBy: "time",
    hiddenSubjects: [],
    hiddenInstructors: [],
    hiddenDays: [],
    dayOrder: [6, 0, 1, 2, 3],
  };
}
