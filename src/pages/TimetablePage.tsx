import { useMemo, useRef, useState } from "react";
import type { ClassEntry, SectionView } from "../types";
import { SECTION_IDS } from "../types";
import {
  countActiveFilters,
  filterClasses,
  fmtDur,
  mins,
} from "../lib/filtering";
import { useStore } from "../store";
import { useT } from "../i18n";
import { toast } from "../toast";
import { ClassCard } from "../components/ClassCard";
import { ClassFormModal } from "../components/ClassFormModal";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { ExportMenu } from "../components/ExportMenu";
import { FilterPopover } from "../components/FilterPopover";
import { CustomizePopover } from "../components/CustomizePopover";
import { TimetableViews } from "../components/TimetableViews";
import { Icon } from "../components/Icon";
import type { DayNum } from "../types";

type ModalState =
  | { kind: "form"; initial: ClassEntry | null }
  | { kind: "delete"; target: ClassEntry }
  | null;

export function TimetablePage() {
  const t = useT();
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
  const activeViewId = useStore((s) => s.activeViewId);
  const savedViews = useStore((s) => s.savedViews);
  const restoreSeed = useStore((s) => s.restoreSeed);

  const [pop, setPop] = useState<"filter" | "customize" | null>(null);
  const [modal, setModal] = useState<ModalState>(null);
  const [selectedDay, setSelectedDay] = useState<DayNum | "today">("today");
  const gridRef = useRef<HTMLDivElement>(null);

  const visible = useMemo(
    () =>
      filterClasses(classes, section, filters, {
        subjects: prefs.hiddenSubjects,
        instructors: prefs.hiddenInstructors,
        days: prefs.hiddenDays,
        hideCombined: !prefs.showCombined,
      }),
    [classes, section, filters, prefs.hiddenSubjects, prefs.hiddenInstructors, prefs.hiddenDays, prefs.showCombined],
  );

  const activeFilters = countActiveFilters(filters);
  const totalMinutes = visible.reduce((a, c) => a + (mins(c.end) - mins(c.start)), 0);
  const activeView = savedViews.find((v) => v.id === activeViewId);

  const sections: { key: SectionView; label: string }[] = [
    { key: "full", label: t("sections.full") },
    ...SECTION_IDS.map((s) => ({ key: s as SectionView, label: t(`sections.${s}`) })),
  ];

  const setQ = (search: string) => setFilters({ search });

  return (
    <div>
      <div className="page-head">
        <div>
          <h1 className="page-title">{t("timetable.title")}</h1>
          <p className="page-sub">{t("edit.viewHint")}</p>
        </div>
        <div className="page-meta">
          <span className="meta-pill">
            <span className="dot" />
            <b>{visible.length}</b> / {classes.length} {t("common.classes")}
          </span>
          <span className="meta-pill">{fmtDur(totalMinutes)}</span>
          {activeView && (
            <span className="meta-pill" style={{ borderColor: "var(--accent)" }}>
              <Icon.layers size={13} />
              {activeView.name}
            </span>
          )}
        </div>
      </div>

      <div className="toolbar">
        <div className="search">
          <Icon.search />
          <input
            value={filters.search}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("common.search")}
            aria-label={t("common.search")}
          />
        </div>

        <div className="tool-group">
          <div className="viewtoggle" role="group" aria-label={t("timetable.viewName")}>
            <button
              aria-pressed={prefs.view === "grid"}
              onClick={() => setPrefs({ view: "grid" })}
            >
              {t("timetable.weeklyGrid")}
            </button>
            <button
              aria-pressed={prefs.view === "list"}
              onClick={() => setPrefs({ view: "list" })}
            >
              {t("timetable.dailyList")}
            </button>
          </div>
        </div>

        <div className="tool-group">
          <button
            className={"btn btn-sm" + (pop === "filter" ? " btn-on" : "")}
            aria-expanded={pop === "filter"}
            onClick={() => setPop(pop === "filter" ? null : "filter")}
          >
            <Icon.filter />
            {t("common.filters")}
            {activeFilters > 0 && <b style={{ color: "var(--accent)" }}>· {activeFilters}</b>}
          </button>
          <div className="tool-sep" />
          <button
            className={"btn btn-sm" + (pop === "customize" ? " btn-on" : "")}
            aria-expanded={pop === "customize"}
            onClick={() => setPop(pop === "customize" ? null : "customize")}
          >
            <Icon.brush />
            {t("common.customize")}
          </button>
        </div>

        <div className="tool-group">
          <ExportMenu gridRef={gridRef} view={prefs.view} />
          <div className="tool-sep" />
          <button
            className={"btn btn-sm" + (editMode ? " btn-on" : "")}
            aria-pressed={editMode}
            onClick={() => {
              setEditMode(!editMode);
              if (!editMode) toast(t("toast.editOn"));
            }}
          >
            <Icon.pencil />
            {editMode ? t("edit.on") : t("edit.off")}
          </button>
        </div>
      </div>

      <div className="popover-wrap" style={{ marginBottom: "var(--sp-4)" }}>
        {pop === "filter" && (
          <>
            <div
              className="overlay"
              style={{ background: "transparent", zIndex: 55 }}
              onClick={() => setPop(null)}
            />
            <div style={{ position: "relative", zIndex: 56 }}>
              <FilterPopover onClose={() => setPop(null)} />
            </div>
          </>
        )}
        {pop === "customize" && (
          <>
            <div
              className="overlay"
              style={{ background: "transparent", zIndex: 55 }}
              onClick={() => setPop(null)}
            />
            <div style={{ position: "relative", zIndex: 56 }}>
              <CustomizePopover onClose={() => setPop(null)} />
            </div>
          </>
        )}
      </div>

      {activeFilters > 0 && (
        <div className="activebar">
          <span className="count">
            {visible.length}
            <small>
              {t("common.ofClasses")} {classes.length} {t("common.active")}
            </small>
          </span>
          {filters.days.map((d) => (
            <span className="ftag" key={`d${d}`}>
              {t(`dayAbbr.${d}`)}
              <button
                aria-label={t("filters.removeTag")}
                onClick={() =>
                  setFilters({ days: filters.days.filter((x) => x !== d) })
                }
              >
                ×
              </button>
            </span>
          ))}
          {filters.subjects.map((s) => (
            <span className="ftag" key={`s${s}`}>
              {s}
              <button
                aria-label={t("filters.removeTag")}
                onClick={() =>
                  setFilters({ subjects: filters.subjects.filter((x) => x !== s) })
                }
              >
                ×
              </button>
            </span>
          ))}
          {filters.sections.map((s) => (
            <span className="ftag" key={`sec${s}`}>
              {t(`sections.${s}`)}
              <button
                aria-label={t("filters.removeTag")}
                onClick={() =>
                  setFilters({ sections: filters.sections.filter((x) => x !== s) })
                }
              >
                ×
              </button>
            </span>
          ))}
          {filters.instructors.map((i) => (
            <span className="ftag" key={`i${i}`}>
              {i}
              <button
                aria-label={t("filters.removeTag")}
                onClick={() =>
                  setFilters({ instructors: filters.instructors.filter((x) => x !== i) })
                }
              >
                ×
              </button>
            </span>
          ))}
          {filters.rooms.map((r) => (
            <span className="ftag" key={`r${r}`}>
              {r}
              <button
                aria-label={t("filters.removeTag")}
                onClick={() => setFilters({ rooms: filters.rooms.filter((x) => x !== r) })}
              >
                ×
              </button>
            </span>
          ))}
          {filters.types.map((ty) => (
            <span className="ftag" key={`t${ty}`}>
              {t(`kinds.${ty}`)}
              <button
                aria-label={t("filters.removeTag")}
                onClick={() => setFilters({ types: filters.types.filter((x) => x !== ty) })}
              >
                ×
              </button>
            </span>
          ))}
          {filters.time.mode !== "all" && (
            <span className="ftag">
              {t(
                filters.time.mode === "morning"
                  ? "filters.morning"
                  : filters.time.mode === "afternoon"
                    ? "filters.afternoon"
                    : filters.time.mode === "start-after"
                      ? "filters.startsAfter"
                      : filters.time.mode === "end-before"
                        ? "filters.endsBefore"
                        : "filters.customRange",
              )}
              <button
                aria-label={t("filters.removeTag")}
                onClick={() => setFilters({ time: { mode: "all" } })}
              >
                ×
              </button>
            </span>
          )}
          <button className="btn btn-sm" onClick={resetFilters} style={{ marginInlineStart: "auto" }}>
            <Icon.x size={13} />
            {t("filters.clear")}
          </button>
        </div>
      )}

      <div className="sections-row">
        <span className="lbl">{t("timetable.section")}</span>
        {sections.map((s) => (
          <button
            key={s.key}
            className="chip"
            aria-pressed={section === s.key}
            onClick={() => setSection(s.key)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {editMode && (
        <div className="edit-banner">
          <Icon.alert />
          <span>{t("edit.banner")}</span>
          <span className="spacer" />
          <div className="acts">
            <button
              className="btn btn-sm"
              disabled={!canUndo}
              onClick={() => {
                undo();
                toast(t("toast.undone"));
              }}
            >
              <Icon.undo size={14} />
              {t("common.undo")}
            </button>
            <button
              className="btn btn-sm btn-primary"
              onClick={() => setModal({ kind: "form", initial: null })}
            >
              <Icon.plus size={14} />
              {t("edit.addClass")}
            </button>
            <button
              className="btn btn-sm"
              onClick={() => {
                setEditMode(false);
                toast(t("toast.saved"));
              }}
            >
              <Icon.check size={14} />
              {t("edit.saveChanges")}
            </button>
          </div>
        </div>
      )}

      {!editMode && visible.length === 0 && (
        <div className="empty">
          <b>{t("timetable.empty.title")}</b>
          <p>{t("timetable.empty.body")}</p>
          <button
            className="btn btn-primary"
            onClick={() => {
              resetFilters();
              setSection("full");
            }}
          >
            <Icon.refresh size={14} />
            {t("timetable.empty.reset")}
          </button>
        </div>
      )}

      {(visible.length > 0 || editMode) && (
        <TimetableViews
          classes={visible}
          selectedDay={selectedDay}
          onSelectDay={(d) => setSelectedDay(d)}
          onEdit={(c) => setModal({ kind: "form", initial: c })}
          onDuplicate={(c) => {
            const copy = duplicateClass(c.id);
            if (copy) toast(t("toast.duplicated"));
          }}
          onDelete={(c) => setModal({ kind: "delete", target: c })}
          gridRef={gridRef}
        />
      )}

      {modal?.kind === "form" && (
        <ClassFormModal
          initial={modal.initial}
          onClose={() => setModal(null)}
          onSaved={(c) => toast(modal.initial ? t("toast.updated") : t("toast.added"))}
        />
      )}

      {modal?.kind === "delete" && (
        <ConfirmDialog
          title={t("confirm.deleteTitle")}
          body={t("confirm.deleteBody", {
            subject: modal.target.subject,
            day: t(`days.${modal.target.day}`),
            time: `${modal.target.start}–${modal.target.end}`,
          })}
          confirmLabel={t("confirm.deleteAction")}
          danger
          onConfirm={() => {
            deleteClass(modal.target.id);
            toast(t("toast.deleted"));
          }}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
