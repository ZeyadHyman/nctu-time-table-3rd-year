import { useEffect, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import Header from "./components/Header";
import { FilterPanel, activeFilterTags } from "./components/FilterPanel";
import { CustomizePanel } from "./components/CustomizePanel";
import { ViewsDataPanel } from "./components/ViewsDataPanel";
import { StatsPanel } from "./components/StatsPanel";
import { ClassFormModal } from "./components/ClassFormModal";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { DayList, TimetableGrid } from "./components/TimetableViews";
import { ToastHost, useToast } from "./toast";
import { useStore } from "./store";
import { filterClasses, countActiveFilters, fmtTime, mins } from "./lib/filtering";
import type { ClassEntry, DayNum } from "./types";
import { SECTION_IDS, SECTION_LABELS, SUBJECTS } from "./types";

type FormState =
  | { mode: "add"; entry: null }
  | { mode: "edit"; entry: ClassEntry }
  | { mode: "duplicate"; entry: ClassEntry }
  | null;

export default function App() {
  const classes = useStore((s) => s.classes);
  const filters = useStore((s) => s.filters);
  const setFilters = useStore((s) => s.setFilters);
  const resetFilters = useStore((s) => s.resetFilters);
  const section = useStore((s) => s.section);
  const setSection = useStore((s) => s.setSection);
  const prefs = useStore((s) => s.prefs);
  const setPrefs = useStore((s) => s.setPrefs);
  const editMode = useStore((s) => s.editMode);
  const setEditMode = useStore((s) => s.setEditMode);
  const undo = useStore((s) => s.undo);
  const canUndo = useStore((s) => s.canUndo);
  const deleteClass = useStore((s) => s.deleteClass);
  const duplicateClass = useStore((s) => s.duplicateClass);
  const moveClass = useStore((s) => s.moveClass);
  const activeViewId = useStore((s) => s.activeViewId);
  const show = useToast((s) => s.show);

  const [filterOpen, setFilterOpen] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [viewsOpen, setViewsOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [form, setForm] = useState<FormState>(null);
  const [pendingDelete, setPendingDelete] = useState<ClassEntry | null>(null);
  const [snapshot, setSnapshot] = useState<ClassEntry[] | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  const visible = useMemo(
    () =>
      filterClasses(classes, section, filters, {
        subjects: prefs.hiddenSubjects,
        instructors: prefs.hiddenInstructors,
        days: prefs.hiddenDays,
      }),
    [classes, section, filters, prefs],
  );

  const activeTags = activeFilterTags(filters);
  const activeCount = countActiveFilters(filters);

  // next up
  const next = useMemo(() => {
    const now = new Date();
    const nm = now.getHours() * 60 + now.getMinutes();
    const today = now.getDay();
    const todays = visible
      .filter((c) => c.day === today)
      .sort((a, b) => mins(a.start) - mins(b.start));
    const live = todays.filter((c) => mins(c.start) <= nm && nm < mins(c.end));
    const later = todays.filter((c) => mins(c.start) > nm);
    const c = live[0] || later[0];
    if (!c) return null;
    return { c, live: live.length > 0, extra: (live.length || later.length) - 1 };
  }, [visible]);

  const toggleEdit = () => {
    if (!editMode) {
      setSnapshot(classes.map((c) => ({ ...c })));
      setEditMode(true);
      show("Edit mode ON — click a class to edit, drag to move.");
    } else {
      setEditMode(false);
      setSnapshot(null);
    }
  };

  const cancelChanges = () => {
    if (snapshot) useStore.setState({ classes: snapshot });
    setSnapshot(null);
    setEditMode(false);
    show("Changes cancelled.");
  };

  const saveChanges = () => {
    setSnapshot(null);
    setEditMode(false);
    show("Changes saved.");
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setForm(null);
        setPendingDelete(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const exportImage = async () => {
    const node = boardRef.current?.querySelector(".board") as HTMLElement | null;
    if (!node) {
      show("Switch to grid view to export an image.");
      return;
    }
    try {
      const url = await toPng(node, {
        backgroundColor: getComputedStyle(document.body).backgroundColor,
        pixelRatio: 2,
      });
      const a = document.createElement("a");
      a.href = url;
      a.download = "timetable.png";
      a.click();
      show("Image exported.");
    } catch {
      show("Image export failed.");
    }
  };

  const move = (id: string, day: DayNum, start: string) => {
    const c = classes.find((x) => x.id === id);
    if (!c) return;
    if (c.day === day && c.start === start) return;
    const dur = mins(c.end) - mins(c.start);
    const endMin = mins(start) + dur;
    const end = `${String(Math.floor(endMin / 60)).padStart(2, "0")}:${String(endMin % 60).padStart(2, "0")}`;
    moveClass(id, day, start, end);
    show(`Moved to ${start}.`);
  };

  return (
    <div className="wrap">
      <Header />

      <div className="toolbar">
        <div className="search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            placeholder="Search any class, instructor, room…"
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
          />
        </div>
        <div className="viewtoggle" role="group" aria-label="View mode">
          <button
            aria-pressed={prefs.view === "grid"}
            onClick={() => setPrefs({ view: "grid" })}
          >
            Weekly grid
          </button>
          <button
            aria-pressed={prefs.view === "list"}
            onClick={() => setPrefs({ view: "list" })}
          >
            Daily list
          </button>
        </div>
        <button
          className={"btn" + (filterOpen ? " on" : "")}
          onClick={() => setFilterOpen((v) => !v)}
        >
          Filters{activeCount ? ` (${activeCount})` : ""}
        </button>
        <button className={"btn" + (customOpen ? " on" : "")} onClick={() => setCustomOpen((v) => !v)}>
          Customize
        </button>
        <button className={"btn" + (viewsOpen ? " on" : "")} onClick={() => setViewsOpen((v) => !v)}>
          Views
        </button>
        <button className={"btn" + (statsOpen ? " on" : "")} onClick={() => setStatsOpen((v) => !v)}>
          Stats
        </button>
        <button className="btn desk-only" onClick={() => window.print()}>
          Print
        </button>
        <button className="btn desk-only" onClick={exportImage}>
          PNG
        </button>
        <button className={"btn" + (editMode ? " on" : "")} onClick={toggleEdit}>
          {editMode ? "Editing…" : "Edit mode"}
        </button>
      </div>

      <div className="sections" role="group" aria-label="Section view">
        <span className="lbl">Section</span>
        <button
          className="chip"
          aria-pressed={section === "full"}
          onClick={() => setSection("full")}
        >
          Full timetable
        </button>
        {SECTION_IDS.map((s) => (
          <button
            key={s}
            className="chip"
            aria-pressed={section === s}
            onClick={() => setSection(s)}
          >
            {SECTION_LABELS[s]}
          </button>
        ))}
      </div>

      {editMode && (
        <div className="editbar">
          <span>✏️ Edit mode — drag cards to move · click ✎ to edit</span>
          <span className="spacer" />
          <button className="btn sm" disabled={!canUndo} onClick={() => { undo(); show("Undid last change."); }}>
            Undo
          </button>
          <button className="btn sm" onClick={() => setForm({ mode: "add", entry: null })}>
            + Add class
          </button>
          <button className="btn sm danger" onClick={cancelChanges}>
            Cancel changes
          </button>
          <button className="btn sm primary" onClick={saveChanges}>
            Save changes
          </button>
        </div>
      )}

      {(activeCount > 0 || section !== "full") && (
        <div className="activebar">
          <span className="count">
            {visible.length}
            <small>
              of {classes.length} classes match
              {section !== "full" ? ` · ${SECTION_LABELS[section as keyof typeof SECTION_LABELS]}` : ""}
            </small>
          </span>
          {activeTags.map((t, i) => (
            <span className="ftag" key={i}>
              {t.label}
              <button onClick={t.clear} aria-label={`Remove ${t.label}`}>
                ✕
              </button>
            </span>
          ))}
          <span style={{ flex: 1 }} />
          {activeCount > 0 && (
            <button className="btn sm" onClick={resetFilters}>
              Clear all filters
            </button>
          )}
          {section !== "full" && (
            <button className="btn sm" onClick={() => setSection("full")}>
              Full timetable
            </button>
          )}
        </div>
      )}

      <FilterPanel open={filterOpen} onToggle={() => setFilterOpen((v) => !v)} />
      <CustomizePanel open={customOpen} onToggle={() => setCustomOpen((v) => !v)} />
      <ViewsDataPanel open={viewsOpen} onToggle={() => setViewsOpen((v) => !v)} />
      <StatsPanel classes={visible} open={statsOpen} onToggle={() => setStatsOpen((v) => !v)} />

      {next && (
        <div id="next" className="show" style={{ ["--c" as string]: SUBJECTS[next.c.subject]?.color ?? "var(--sun)" }}>
          <i />
          <div>
            <b>{next.live ? "Now:" : "Next:"}</b>{" "}
            {SUBJECTS[next.c.subject]?.name ?? next.c.subject}{" "}
            <span>
              · {next.c.room} · {fmtTime(next.c.start)}
              {next.extra ? ` · +${next.extra} more` : ""}
            </span>
          </div>
        </div>
      )}

      <main ref={boardRef}>
        {visible.length === 0 ? (
          <div className="empty">
            <b>No classes match</b>
            Try relaxing a filter or switching back to the full timetable.
            <br />
            <button
              className="btn primary"
              onClick={() => {
                resetFilters();
                setSection("full");
              }}
            >
              Reset everything
            </button>
          </div>
        ) : prefs.view === "grid" ? (
          <>
            <TimetableGrid
              classes={visible}
              onEdit={(c) => setForm({ mode: "edit", entry: c })}
              onDuplicate={(c) => setForm({ mode: "duplicate", entry: c })}
              onDelete={(c) => setPendingDelete(c)}
              onMove={move}
            />
            <DayList
              classes={visible}
              onEdit={(c) => setForm({ mode: "edit", entry: c })}
              onDuplicate={(c) => setForm({ mode: "duplicate", entry: c })}
              onDelete={(c) => setPendingDelete(c)}
            />
          </>
        ) : (
          <DayList
            classes={visible}
            onEdit={(c) => setForm({ mode: "edit", entry: c })}
            onDuplicate={(c) => setForm({ mode: "duplicate", entry: c })}
            onDelete={(c) => setPendingDelete(c)}
          />
        )}
      </main>

      <footer>
        {editMode
          ? "Edit mode is on. Drag classes between cells, click cards to edit, and save or cancel when you're done."
          : "Use Filters to narrow down the timetable, pick your section above, and save custom views for instant switching."}
        {" "}· Today and the running class are marked automatically.
        {activeViewId ? " · A saved view is active." : ""}
      </footer>

      {form && (
        <ClassFormModal
          mode={form.mode}
          entry={form.entry}
          onClose={() => setForm(null)}
          onSaved={(m) => show(m)}
        />
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Delete class?"
          message={`Remove ${subjectName(pendingDelete)} on ${dayName(pendingDelete.day)} at ${fmtTime(pendingDelete.start)}? This can be undone with the Undo button while edit mode is on.`}
          confirmLabel="Delete"
          danger
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => {
            deleteClass(pendingDelete.id);
            setPendingDelete(null);
            show("Class deleted.");
          }}
        />
      )}

      <ToastHost />
    </div>
  );
}

function subjectName(c: ClassEntry) {
  return SUBJECTS[c.subject]?.name ?? c.subject;
}

function dayName(d: DayNum) {
  const names: Record<number, string> = {
    6: "Saturday",
    0: "Sunday",
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
  };
  return names[d];
}
