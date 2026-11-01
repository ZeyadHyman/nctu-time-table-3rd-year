import type { ClassEntry } from "../types";

let counter = 0;
const mk = (
  subject: string,
  instructor: string,
  room: string,
  day: ClassEntry["day"],
  start: string,
  end: string,
  type: ClassEntry["type"],
  sections: ClassEntry["sections"],
  notes?: string,
): ClassEntry => ({
  id: `seed-${++counter}`,
  subject,
  instructor,
  room,
  day,
  start,
  end,
  type,
  sections,
  notes,
});

const ALL = ["1", "2", "3", "4", "5", "network"] as const;

export const SEED_CLASSES: ClassEntry[] = [
  // Saturday
  mk("graphics", "Dr. Walaa", "A102", 6, "09:00", "10:20", "combined", [...ALL]),
  mk("ccna", "Eng. Farida", "A201", 6, "09:00", "10:20", "individual-section", ["5", "network"]),
  mk("netadmin", "Dr. Walaa", "A306", 6, "10:30", "11:50", "network-section", ["network"]),
  mk("datacomm", "Dr. Amany Arafa", "B302", 6, "12:00", "13:20", "combined", [...ALL]),
  // Sunday
  mk("cprog", "Eng. Amina", "B404", 0, "09:00", "10:20", "combined", [...ALL]),
  mk("ccna", "Eng. Ahmed Nasr", "A201", 0, "09:00", "10:20", "network-section", ["network"]),
  mk("arch", "Dr. Ahmed Mohamed", "C202", 0, "10:30", "11:50", "combined", [...ALL]),
  mk("micro", "Dr. Usama Tharwat", "C202", 0, "12:00", "13:20", "combined", [...ALL]),
  mk("cprog", "Eng. Amina", "A202", 0, "13:40", "15:00", "practical", []),
  mk("micro", "Eng. Ibrahim", "A103", 0, "13:40", "15:00", "practical", []),
  // Monday
  mk("cprog", "Eng. Yousef Tarek", "A201", 1, "09:00", "10:20", "lecture-section", []),
  mk("datacomm", "Eng. Eman Samy", "A102", 1, "12:00", "13:20", "combined", [...ALL]),
  mk("micro", "Eng. Ibrahim", "B309", 1, "13:40", "15:00", "individual-section", []),
  // Tuesday
  mk("java", "Dr. Amany Arafa", "A108", 2, "09:40", "10:20", "combined", [...ALL]),
  mk("cprog", "Dr. Amany Abdelsamie", "B202", 2, "10:30", "11:50", "combined", [...ALL]),
  mk("java", "Eng. Amina", "A302", 2, "10:30", "11:50", "individual-section", ["5", "network"]),
  mk("micro", "Eng. Eman", "A301", 2, "12:00", "13:20", "individual-section", ["1"]),
  mk("java", "Eng. Norhan", "B301", 2, "12:00", "13:20", "individual-section", ["3"]),
  mk("cprog", "Eng. Yousef Tarek", "B203", 2, "12:00", "13:20", "individual-section", ["4"]),
  mk("java", "Eng. Norhan", "B303", 2, "13:40", "14:20", "individual-section", ["2"]),
  mk("micro", "Eng. Ibrahim", "B202", 2, "13:40", "14:20", "individual-section", ["3"]),
  mk("graphics", "Eng. Amina", "A202", 2, "13:40", "14:20", "individual-section", ["4"]),
  mk("java", "Eng. Norhan", "A206", 2, "15:10", "16:30", "individual-section", ["1"]),
  mk("micro", "Eng. Mohamed Hisham", "C202", 2, "15:10", "16:30", "individual-section", ["4"]),
  // Wednesday
  mk("graphics", "Eng. Yousef Lasheen", "A201", 3, "09:00", "10:20", "individual-section", ["1"]),
  mk("java", "Eng. Norhan", "B302", 3, "09:00", "10:20", "individual-section", ["4"]),
  mk("graphics", "Eng. Hossam", "A201", 3, "10:30", "11:50", "individual-section", ["2", "3"]),
  mk("graphics", "Eng. Hossam", "A201", 3, "12:00", "13:20", "individual-section", ["3"]),
  mk("arch", "Eng. Moamen", "C202", 3, "13:40", "15:00", "combined", [...ALL]),
];
