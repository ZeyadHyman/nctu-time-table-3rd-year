# Software & Network Timetable — Schedule Management System

A full-featured university timetable app (Third Year · Software & Network · 2026/2027) built with **React + TypeScript + Vite**, preserving the original site's visual identity (Archivo typography, dark/light themes, subject color coding).

The original single-file timetable (`Timetable – Section 2.html`) is kept untouched in the project root.

## Run

```bash
cd app
npm install
npm run dev        # http://localhost:5173
```

## Build

```bash
cd app
npm run build      # static output in app/dist/
npm run preview    # serve the production build
```

Deploy the contents of `dist/` to any static host (it uses relative paths).

## Features

| Area | What you get |
|---|---|
| **Filters** | Day, subject, section, instructor (searchable), room (searchable), class type, time (morning / afternoon / custom range / starts-after / ends-before), free-text search. All combine instantly; active-filter tags, match count, Clear-all, empty state. |
| **Section views** | Full / Section 1–5 / Network selector, persisted across refreshes. Combined lectures and general classes stay visible for every section; other-section exclusive classes are hidden. |
| **Customization** | Show/hide subjects, instructors, days; reorder days; toggle card fields (instructor, room, type, section, time); weekly grid vs. daily list. |
| **Saved views** | Save the current filters + section + customization under a name; apply, rename, duplicate, delete. Views persist in localStorage and are never overwritten by timetable edits. |
| **Edit mode** | Toggle to add / edit / duplicate / delete classes, drag & drop cards between day/time cells, validation (end after start, required fields), overlap **warning** (not rejection), Undo, Save / Cancel. |
| **Persistence** | Everything saved to `localStorage`. Original seed timetable can be restored at any time. JSON **export / import** with schema validation (rejects malformed files before replacing data). |
| **Statistics** | Total classes, total hours, hours per subject, classes per day, next upcoming class — all recomputed from the currently filtered set. |
| **Output** | Print-friendly CSS (`Print` button → save as PDF), PNG export of the grid, light/dark theme. |

## Section filtering model

Each class carries a structured `sections` array (not text matching):

- `combined` lectures → visible in **every** section view
- `sections: []` (practicals / general) → visible for everyone
- `sections: ["2"]`, `["2","3"]`, `["5","network"]` → visible only for those sections

So selecting **Section 2** shows Section 2 classes + shared multi-section classes (e.g. Graphics "Sections 2 & 3") + all combined lectures, and hides Section 1/3/4/5-exclusive and Network-exclusive classes.

## Data layout

```
app/src/
  types.ts               # data model, subjects, days, slots
  data/seed.ts           # original timetable (default dataset)
  store.ts               # zustand store + localStorage persistence + undo
  lib/filtering.ts       # filter engine, section logic, stats
  lib/exportImport.ts    # JSON export/import + validation
  components/            # UI (filters, grid, list, forms, panels)
```
