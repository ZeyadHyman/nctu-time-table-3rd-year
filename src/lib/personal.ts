import type { ClassEntry, Profile } from "../types";

/** Personal timetable: combined lectures for selected subjects + chosen sessions. */
export function applyProfile(classes: ClassEntry[], profile: Profile): ClassEntry[] {
  if (!profile.onboarded) return classes;
  return classes.filter((c) => {
    if (profile.subjects.includes(c.subject) && c.type === "combined") return true;
    if (profile.sessions.includes(c.id)) return true;
    return false;
  });
}

/** Temp profile helper for the onboarding wizard preview. */
export function previewProfile(
  department: "software" | "network",
  subjects: string[],
  sessions: string[],
): Profile {
  return { onboarded: true, department, subjects, sessions };
}

export function weekKey(d = new Date()): string {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const year = t.getUTCFullYear();
  const yStart = new Date(Date.UTC(year, 0, 1));
  const w = Math.ceil(((t.getTime() - yStart.getTime()) / 86400000 + 1) / 7);
  return `${year}-W${String(w).padStart(2, "0")}`;
}

export function shiftWeek(key: string, dir: -1 | 1): string {
  const m = key.match(/^(\d{4})-W(\d{2})$/);
  if (!m) return key;
  let year = Number(m[1]);
  let w = Number(m[2]) + dir;
  if (w < 1) {
    w = 52;
    year -= 1;
  } else if (w > 52) {
    w = 1;
    year += 1;
  }
  return `${year}-W${String(w).padStart(2, "0")}`;
}

export function weekLabel(key: string): string {
  const m = key.match(/^(\d{4})-W(\d{2})$/);
  return m ? `Week ${m[2]} · ${m[1]}` : key;
}
