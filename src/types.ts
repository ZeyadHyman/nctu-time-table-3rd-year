export type SectionId = "1" | "2" | "3" | "4" | "5" | "network";

export type Department = "software" | "network" | "both";
export type DeptFilter = "all" | "software" | "network";
export type AttendanceStatus = "attended" | "missed" | "excused";

export interface Profile {
  onboarded: boolean;
  department: "software" | "network";
  subjects: string[];
  sessions: string[];
}

export type ClassKind =
  | "combined"
  | "practical"
  | "lecture-section"
  | "network-section"
  | "individual-section";

export type DayNum = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface ClassEntry {
  id: string;
  subject: string;
  instructor: string;
  room: string;
  day: DayNum;
  start: string;
  end: string;
  type: ClassKind;
  sections: SectionId[];
  dept?: Department;
  notes?: string;
}

export const DEFAULT_DEPT: Record<string, Department> = {
  graphics: "software",
  arch: "software",
  micro: "software",
  java: "software",
  cprog: "software",
  datacomm: "both",
  ccna: "network",
  netadmin: "network",
};

export function classDept(c: ClassEntry): Department {
  return c.dept ?? DEFAULT_DEPT[c.subject] ?? "both";
}

export interface TimeFilter {
  mode: "all" | "morning" | "afternoon" | "range" | "start-after" | "end-before";
  value?: string;
  from?: string;
  to?: string;
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
  dept: DeptFilter;
}

export type SectionView = "full" | SectionId;

export interface DisplayPrefs {
  view: "grid" | "list";
  showInstructor: boolean;
  showRoom: boolean;
  showType: boolean;
  showSection: boolean;
  showTime: boolean;
  showCombined: boolean;
  sortBy: "time" | "subject";
  hiddenSubjects: string[];
  hiddenInstructors: string[];
  hiddenDays: DayNum[];
  dayOrder: DayNum[];
}

export interface Settings {
  language: "en" | "ar";
  defaultView: "grid" | "list";
  defaultDay: DayNum | "today";
  defaultSection: SectionView;
  weekStart: "saturday" | "sunday";
  timeFormat: "12" | "24";
  accent: string;
  density: "compact" | "comfortable";
  fontSize: "sm" | "md" | "lg";
  subjectColors: Record<string, string>;
  rememberFilters: boolean;
  rememberSection: boolean;
  autoApplyViews: boolean;
  animations: boolean;
  defaultFilters: Filters | null;
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
  graphics: { name: "Computer Graphics", color: "#ffd23a" },
  datacomm: { name: "Data Communication", color: "#5d86ff" },
  arch: { name: "Computer Architecture", color: "#ff9f45" },
  micro: { name: "Microprocessor", color: "#4fe0a0" },
  java: { name: "Java Programming II", color: "#ff5a3c" },
  cprog: { name: "Advanced Programming in C", color: "#ff9fd0" },
  ccna: { name: "CCNA R&S II", color: "#b39cff" },
  netadmin: { name: "Network Admin", color: "#5fd4e6" },
};

export const DEFAULT_PREFS: DisplayPrefs = {
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

export const DEFAULT_SETTINGS: Settings = {
  language: "en",
  defaultView: "grid",
  defaultDay: "today",
  defaultSection: "full",
  weekStart: "saturday",
  timeFormat: "12",
  accent: "#ffd23a",
  density: "comfortable",
  fontSize: "md",
  subjectColors: {},
  rememberFilters: true,
  rememberSection: true,
  autoApplyViews: false,
  animations: true,
  defaultFilters: null,
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
  dept: "all",
};

export const DEFAULT_PROFILE: Profile = {
  onboarded: false,
  department: "software",
  subjects: [],
  sessions: [],
};
