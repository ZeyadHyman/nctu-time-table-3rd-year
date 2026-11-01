import { useMemo, useState } from "react";
import type { ClassEntry, ClassKind, DayNum, Filters, SectionId } from "../types";
import { DAYS, KIND_LABELS, SECTION_IDS, SECTION_LABELS, SUBJECTS } from "../types";
import { classTypes } from "../lib/filtering";
import { useStore } from "../store";
import { Panel } from "./Panel";

function toggle<T>(arr: T[], v: T): T[] {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}

export function FilterPanel({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const filters = useStore((s) => s.filters);
  const setFilters = useStore((s) => s.setFilters);
  const resetFilters = useStore((s) => s.resetFilters);
  const classes = useStore((s) => s.classes);

  const facets = useMemo(() => {
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
  }, [classes]);

  const [instQuery, setInstQuery] = useState("");
  const [roomQuery, setRoomQuery] = useState("");

  const visibleInstructors = facets.instructors.filter((i) =>
    i.toLowerCase().includes(instQuery.toLowerCase()),
  );
  const visibleRooms = facets.rooms.filter((r) =>
    r.toLowerCase().includes(roomQuery.toLowerCase()),
  );

  const set = (patch: Partial<Filters>) => setFilters(patch);
  const setDays = (days: DayNum[]) => set({ days });
  const setSubjects = (subjects: string[]) => set({ subjects });
  const setSections = (sections: SectionId[]) => set({ sections });
  const setTypes = (types: ClassKind[]) => set({ types });

  const dayOpt = (n: DayNum) => {
    const d = DAYS.find((x) => x.num === n)!;
    return (
      <button
        key={n}
        type="button"
        className="opt"
        aria-pressed={filters.days.includes(n)}
        onClick={() => setDays(toggle(filters.days, n))}
      >
        {d.name}
      </button>
    );
  };

  return (
    <Panel
      title="Filters"
      hint={
        filters.days.length ||
        filters.subjects.length ||
        filters.sections.length ||
        filters.instructors.length ||
        filters.rooms.length ||
        filters.types.length ||
        filters.time.mode !== "all" ||
        filters.search
          ? "active"
          : "all classes"
      }
      open={open}
      onToggle={onToggle}
    >
      <div className="filter-grid">
        <div className="fgroup">
          <h4>
            Days
            <span className="mini">
              <button onClick={() => setDays([6, 0, 1, 2, 3])}>
                All
              </button>
              <button onClick={() => setDays([])}>Clear</button>
            </span>
          </h4>
          <div className="opts">{[6, 0, 1, 2, 3].map((n) => dayOpt(n as DayNum))}</div>
        </div>

        <div className="fgroup">
          <h4>
            Subjects
            <span className="mini">
              <button onClick={() => setSubjects(Object.keys(SUBJECTS))}>All</button>
              <button onClick={() => setSubjects([])}>Clear</button>
            </span>
          </h4>
          <div className="opts">
            {Object.entries(SUBJECTS).map(([k, v]) => (
              <button
                key={k}
                type="button"
                className="opt"
                aria-pressed={filters.subjects.includes(k)}
                onClick={() => setSubjects(toggle(filters.subjects, k))}
              >
                <i style={{ ["--c" as string]: v.color }} />
                {v.name}
              </button>
            ))}
          </div>
        </div>

        <div className="fgroup">
          <h4>
            Sections
            <span className="mini">
              <button onClick={() => setSections([...SECTION_IDS])}>All</button>
              <button onClick={() => setSections([])}>Clear</button>
            </span>
          </h4>
          <div className="opts">
            {SECTION_IDS.map((s) => (
              <button
                key={s}
                type="button"
                className="opt"
                aria-pressed={filters.sections.includes(s)}
                onClick={() => setSections(toggle(filters.sections, s))}
              >
                {SECTION_LABELS[s]}
              </button>
            ))}
          </div>
          <p style={{ fontSize: "0.72rem", color: "var(--soft)", marginTop: 7 }}>
            Combined lectures always stay visible.
          </p>
        </div>

        <div className="fgroup">
          <h4>
            Instructors
            <span className="mini">
              <button onClick={() => set({ instructors: [...facets.instructors] })}>All</button>
              <button onClick={() => set({ instructors: [] })}>Clear</button>
            </span>
          </h4>
          <input
            style={{ width: "100%", marginBottom: 8 }}
            placeholder="Search instructors…"
            value={instQuery}
            onChange={(e) => setInstQuery(e.target.value)}
          />
          <div className="optlist">
            {visibleInstructors.map((i) => (
              <button
                key={i}
                type="button"
                className="opt"
                aria-pressed={filters.instructors.includes(i)}
                onClick={() => set({ instructors: toggle(filters.instructors, i) })}
              >
                {i}
              </button>
            ))}
            {visibleInstructors.length === 0 && (
              <span style={{ fontSize: "0.78rem", color: "var(--soft)" }}>No match</span>
            )}
          </div>
        </div>

        <div className="fgroup">
          <h4>
            Rooms
            <span className="mini">
              <button onClick={() => set({ rooms: [...facets.rooms] })}>All</button>
              <button onClick={() => set({ rooms: [] })}>Clear</button>
            </span>
          </h4>
          <input
            style={{ width: "100%", marginBottom: 8 }}
            placeholder="Search rooms…"
            value={roomQuery}
            onChange={(e) => setRoomQuery(e.target.value)}
          />
          <div className="opts">
            {visibleRooms.map((r) => (
              <button
                key={r}
                type="button"
                className="opt"
                aria-pressed={filters.rooms.includes(r)}
                onClick={() => set({ rooms: toggle(filters.rooms, r) })}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="fgroup">
          <h4>
            Class type
            <span className="mini">
              <button onClick={() => setTypes([...classTypes])}>All</button>
              <button onClick={() => setTypes([])}>Clear</button>
            </span>
          </h4>
          <div className="opts">
            {classTypes.map((t) => (
              <button
                key={t}
                type="button"
                className="opt"
                aria-pressed={filters.types.includes(t)}
                onClick={() => setTypes(toggle(filters.types, t))}
              >
                {KIND_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        <div className="fgroup">
          <h4>Time</h4>
          <div className="opts">
            {(
              [
                ["all", "Any time"],
                ["morning", "Morning"],
                ["afternoon", "Afternoon"],
                ["start-after", "Starts after"],
                ["end-before", "Ends before"],
                ["range", "Custom range"],
              ] as const
            ).map(([m, label]) => (
              <button
                key={m}
                type="button"
                className="opt"
                aria-pressed={filters.time.mode === m}
                onClick={() => set({ time: { ...filters.time, mode: m } })}
              >
                {label}
              </button>
            ))}
          </div>
          {filters.time.mode === "start-after" || filters.time.mode === "end-before" ? (
            <div className="timerow">
              <label>
                {filters.time.mode === "start-after" ? "Starts after" : "Ends before"}
                <input
                  type="time"
                  value={filters.time.value ?? "12:00"}
                  onChange={(e) => set({ time: { ...filters.time, value: e.target.value } })}
                />
              </label>
            </div>
          ) : null}
          {filters.time.mode === "range" ? (
            <div className="timerow">
              <label>
                From
                <input
                  type="time"
                  value={filters.time.from ?? "09:00"}
                  onChange={(e) => set({ time: { ...filters.time, from: e.target.value } })}
                />
              </label>
              <label>
                To
                <input
                  type="time"
                  value={filters.time.to ?? "16:30"}
                  onChange={(e) => set({ time: { ...filters.time, to: e.target.value } })}
                />
              </label>
            </div>
          ) : null}
        </div>
      </div>

      <div className="panel-actions">
        <button className="btn" onClick={resetFilters}>
          Clear all filters
        </button>
      </div>
    </Panel>
  );
}

export function activeFilterTags(f: Filters): { label: string; clear: () => void }[] {
  const tags: { label: string; clear: () => void }[] = [];
  const store = useStore.getState();
  const set = store.setFilters;
  if (f.search) tags.push({ label: `Search: “${f.search}”`, clear: () => set({ search: "" }) });
  f.days.forEach((d) => {
    const name = DAYS.find((x) => x.num === d)!.name;
    tags.push({ label: name, clear: () => set({ days: f.days.filter((x) => x !== d) }) });
  });
  f.subjects.forEach((s) =>
    tags.push({
      label: SUBJECTS[s]?.name ?? s,
      clear: () => set({ subjects: f.subjects.filter((x) => x !== s) }),
    }),
  );
  f.sections.forEach((s) =>
    tags.push({
      label: SECTION_LABELS[s],
      clear: () => set({ sections: f.sections.filter((x) => x !== s) }),
    }),
  );
  f.instructors.forEach((i) =>
    tags.push({ label: i, clear: () => set({ instructors: f.instructors.filter((x) => x !== i) }) }),
  );
  f.rooms.forEach((r) =>
    tags.push({ label: r, clear: () => set({ rooms: f.rooms.filter((x) => x !== r) }) }),
  );
  f.types.forEach((t) =>
    tags.push({ label: KIND_LABELS[t], clear: () => set({ types: f.types.filter((x) => x !== t) }) }),
  );
  if (f.time.mode !== "all") {
    const labels: Record<string, string> = {
      morning: "Morning",
      afternoon: "Afternoon",
      "start-after": `Starts after ${f.time.value ?? ""}`,
      "end-before": `Ends before ${f.time.value ?? ""}`,
      range: `${f.time.from ?? ""} – ${f.time.to ?? ""}`,
    };
    tags.push({
      label: labels[f.time.mode],
      clear: () => set({ time: { mode: "all" } }),
    });
  }
  return tags;
}
