export type SectionId = "1" | "2" | "3" | "4" | "5" | "network";

export type ClassKind =
  | "combined"
  | "practical"
  | "lecture-section"
  | "network-section"
  | "individual-section";

export type DayNum = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface ClassEntry {
  id: string;
  subject: string; // subject key
  instructor: string;
  room: string;
  day: DayNum;
  start: string; // "HH:MM"
  end: string; // "HH:MM"
  type: ClassKind;
  sections: SectionId[]; // empty = general / applies to everyone
  notes?: string;
}

export interface TimeFilter {
  mode: "all" | "morning" | "afternoon" | "range" | "start-after" | "end-before";
  value?: string; // for start-after / end-before
  from?: string; // for range
  to?: string; // for range
}

export interface Filters {
  days: DayNum[];
  subjects: string[];
  sections: SectionId[];
  instructors: string[];
  rooms: string[];
  types: ClassKind[];
  time: TimeFilter;
  search: string;
}

export type SectionView = "full" | SectionId;

export interface DisplayPrefs {
  view: "grid" | "list";
  showInstructor: boolean;
  showRoom: boolean;
  showType: boolean;
  showSection: boolean;
  showTime: boolean;
  hiddenSubjects: string[];
  hiddenInstructors: string[];
  hiddenDays: DayNum[];
  dayOrder: DayNum[];
}

export interface SavedView {
  id: string;
  name: string;
  filters: Filters;
  section: SectionView;
  prefs: DisplayPrefs;
}

export const SECTION_LABELS: Record<SectionId, string> = {
  "1": "Section 1",
  "2": "Section 2",
  "3": "Section 3",
  "4": "Section 4",
  "5": "Section 5",
  network: "Network",
};

export const SECTION_IDS: SectionId[] = ["1", "2", "3", "4", "5", "network"];

export const KIND_LABELS: Record<ClassKind, string> = {
  combined: "Combined Lecture",
  practical: "Practical Section",
  "lecture-section": "Lecture / Section",
  "network-section": "Network Section",
  "individual-section": "Individual Section",
};

export const DAYS: { num: DayNum; name: string; abbr: string }[] = [
  { num: 6, name: "Saturday", abbr: "Sat" },
  { num: 0, name: "Sunday", abbr: "Sun" },
  { num: 1, name: "Monday", abbr: "Mon" },
  { num: 2, name: "Tuesday", abbr: "Tue" },
  { num: 3, name: "Wednesday", abbr: "Wed" },
  { num: 4, name: "Thursday", abbr: "Thu" },
  { num: 5, name: "Friday", abbr: "Fri" },
];

export const DAY_BY_NUM = (n: DayNum) => DAYS.find((d) => d.num === n)!;

export const SLOTS: [string, string][] = [
  ["09:00", "09:40"],
  ["09:40", "10:20"],
  ["10:30", "11:50"],
  ["12:00", "13:20"],
  ["13:40", "15:00"],
  ["15:10", "16:30"],
];

export const SUBJECTS: Record<string, { name: string; color: string }> = {
  graphics: { name: "Computer Graphics", color: "var(--sun)" },
  datacomm: { name: "Data Communication", color: "var(--blue)" },
  arch: { name: "Computer Architecture", color: "var(--peach)" },
  micro: { name: "Microprocessor", color: "var(--mint)" },
  java: { name: "Java Programming II", color: "var(--tomato)" },
  cprog: { name: "Advanced Programming in C", color: "var(--pink)" },
  ccna: { name: "CCNA R&S II", color: "var(--violet)" },
  netadmin: { name: "Network Admin", color: "var(--sky)" },
};

export const DEFAULT_PREFS: DisplayPrefs = {
  view: "grid",
  showInstructor: true,
  showRoom: true,
  showType: true,
  showSection: true,
  showTime: true,
  hiddenSubjects: [],
  hiddenInstructors: [],
  hiddenDays: [],
  dayOrder: [6, 0, 1, 2, 3],
};

export const EMPTY_FILTERS: Filters = {
  days: [],
  subjects: [],
  sections: [],
  instructors: [],
  rooms: [],
  types: [],
  time: { mode: "all" },
  search: "",
};
