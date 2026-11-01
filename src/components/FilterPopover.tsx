import { useMemo, useState } from "react";
import type { ClassKind, DayNum, Filters, SectionId, TimeFilter } from "../types";
import { DAYS, SECTION_IDS, SUBJECTS } from "../types";
import { classTypes, countActiveFilters, mins } from "../lib/filtering";
import { useStore } from "../store";
import { useT } from "../i18n";
import { Icon } from "./Icon";

function uniqClasses(classes: { instructor: string; room: string }[]) {
  const instructors = [...new Set(classes.map((c) => c.instructor))].sort();
  const rooms = [...new Set(classes.map((c) => c.room))].sort();
  return { instructors, rooms };
}

export function FilterPopover({ onClose }: { onClose: () => void }) {
  const t = useT();
  const filters = useStore((s) => s.filters);
  const setFilters = useStore((s) => s.setFilters);
  const resetFilters = useStore((s) => s.resetFilters);
  const classes = useStore((s) => s.classes);
  const [instQ, setInstQ] = useState("");
  const [roomQ, setRoomQ] = useState("");

  const { instructors, rooms } = useMemo(() => uniqClasses(classes), [classes]);
  const subjects = useMemo(
    () => [...new Set(classes.map((c) => c.subject))].sort(),
    [classes],
  );

  const active = countActiveFilters(filters);

  const toggleDay = (d: DayNum) =>
    setFilters({
      days: filters.days.includes(d) ? filters.days.filter((x) => x !== d) : [...filters.days, d],
    });
  const toggleSubject = (s: string) =>
    setFilters({
      subjects: filters.subjects.includes(s)
        ? filters.subjects.filter((x) => x !== s)
        : [...filters.subjects, s],
    });
  const toggleSection = (s: SectionId) =>
    setFilters({
      sections: filters.sections.includes(s)
        ? filters.sections.filter((x) => x !== s)
        : [...filters.sections, s],
    });
  const toggleInstructor = (s: string) =>
    setFilters({
      instructors: filters.instructors.includes(s)
        ? filters.instructors.filter((x) => x !== s)
        : [...filters.instructors, s],
    });
  const toggleRoom = (s: string) =>
    setFilters({
      rooms: filters.rooms.includes(s) ? filters.rooms.filter((x) => x !== s) : [...filters.rooms, s],
    });
  const toggleType = (k: ClassKind) =>
    setFilters({
      types: filters.types.includes(k) ? filters.types.filter((x) => x !== k) : [...filters.types, k],
    });
  const setTime = (time: TimeFilter) => setFilters({ time });

  const shownInst = instructors.filter((i) => i.toLowerCase().includes(instQ.toLowerCase()));
  const shownRooms = rooms.filter((r) => r.toLowerCase().includes(roomQ.toLowerCase()));

  const timeModes: { mode: TimeFilter["mode"]; label: string }[] = [
    { mode: "all", label: t("filters.anyTime") },
    { mode: "morning", label: t("filters.morning") },
    { mode: "afternoon", label: t("filters.afternoon") },
    { mode: "start-after", label: t("filters.startsAfter") },
    { mode: "end-before", label: t("filters.endsBefore") },
    { mode: "range", label: t("filters.customRange") },
  ];

  return (
    <div className="popover" role="dialog" aria-label={t("filters.title")}>
      <div className="pop-head">
        <div>
          <div className="pop-title">{t("filters.title")}</div>
          <div className="pop-sub">{t("filters.subtitle")}</div>
        </div>
        <div className="page-meta">
          <span className="meta-pill">
            <span className="dot" />
            <b>{t("filters.activeCount", { n: active })}</b>
          </span>
          <button className="icon-btn" onClick={onClose} aria-label={t("common.close")}>
            <Icon.x />
          </button>
        </div>
      </div>

      <div className="filter-grid">
        <div className="fgroup">
          <h4>
            {t("filters.days")}
            <span className="mini">
              <button onClick={() => setFilters({ days: [] })}>{t("common.all")}</button>
            </span>
          </h4>
          <div className="opts">
            {DAYS.map((d) => (
              <button
                key={d.num}
                className="opt"
                aria-pressed={filters.days.includes(d.num)}
                onClick={() => toggleDay(d.num)}
              >
                {t(`dayAbbr.${d.num}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="fgroup">
          <h4>
            {t("filters.subjects")}
            <span className="mini">
              <button onClick={() => setFilters({ subjects: [] })}>{t("common.all")}</button>
            </span>
          </h4>
          <div className="optlist">
            {subjects.map((s) => (
              <button
                key={s}
                className="opt"
                aria-pressed={filters.subjects.includes(s)}
                onClick={() => toggleSubject(s)}
              >
                <i style={{ ["--c" as string]: SUBJECTS[s]?.color ?? "var(--sun)" }} />
                {SUBJECTS[s]?.name ?? s}
              </button>
            ))}
          </div>
        </div>

        <div className="fgroup">
          <h4>
            {t("filters.sections")}
            <span className="mini">
              <button onClick={() => setFilters({ sections: [] })}>{t("common.all")}</button>
            </span>
          </h4>
          <div className="opts">
            {SECTION_IDS.map((s) => (
              <button
                key={s}
                className="opt"
                aria-pressed={filters.sections.includes(s)}
                onClick={() => toggleSection(s)}
              >
                {t(`sections.${s}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="fgroup">
          <h4>{t("filters.classType")}</h4>
          <div className="opts">
            {classTypes.map((k) => (
              <button
                key={k}
                className="opt"
                aria-pressed={filters.types.includes(k)}
                onClick={() => toggleType(k)}
              >
                {t(`kinds.${k}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="fgroup">
          <h4>{t("filters.instructors")}</h4>
          <input
            value={instQ}
            placeholder={t("filters.searchInstructors")}
            onChange={(e) => setInstQ(e.target.value)}
            style={{ marginBottom: 8 }}
          />
          <div className="optlist">
            {shownInst.map((i) => (
              <button
                key={i}
                className="opt"
                aria-pressed={filters.instructors.includes(i)}
                onClick={() => toggleInstructor(i)}
              >
                {i}
              </button>
            ))}
            {shownInst.length === 0 && <span className="pop-sub">{t("filters.noMatch")}</span>}
          </div>
        </div>

        <div className="fgroup">
          <h4>{t("filters.rooms")}</h4>
          <input
            value={roomQ}
            placeholder={t("filters.searchRooms")}
            onChange={(e) => setRoomQ(e.target.value)}
            style={{ marginBottom: 8 }}
          />
          <div className="optlist">
            {shownRooms.map((r) => (
              <button
                key={r}
                className="opt"
                aria-pressed={filters.rooms.includes(r)}
                onClick={() => toggleRoom(r)}
              >
                {r}
              </button>
            ))}
            {shownRooms.length === 0 && <span className="pop-sub">{t("filters.noMatch")}</span>}
          </div>
        </div>

        <div className="fgroup">
          <h4>{t("filters.time")}</h4>
          <div className="opts">
            {timeModes.map((m) => (
              <button
                key={m.mode}
                className="opt"
                aria-pressed={filters.time.mode === m.mode}
                onClick={() => setTime({ mode: m.mode })}
              >
                {m.label}
              </button>
            ))}
          </div>

          {filters.time.mode === "start-after" || filters.time.mode === "end-before" ? (
            <div className="timerow">
              <label>
                {filters.time.mode === "start-after" ? t("filters.startsAfter") : t("filters.endsBefore")}
                <input
                  type="time"
                  value={filters.time.value ?? "12:00"}
                  onChange={(e) => setTime({ mode: filters.time.mode, value: e.target.value })}
                />
              </label>
            </div>
          ) : null}

          {filters.time.mode === "range" ? (
            <div className="timerow">
              <label>
                {t("filters.from")}
                <input
                  type="time"
                  value={filters.time.from ?? ""}
                  onChange={(e) => setTime({ mode: "range", from: e.target.value, to: filters.time.to })}
                />
              </label>
              <label>
                {t("filters.to")}
                <input
                  type="time"
                  value={filters.time.to ?? ""}
                  onChange={(e) => setTime({ mode: "range", from: filters.time.from, to: e.target.value })}
                />
              </label>
            </div>
          ) : null}
        </div>
      </div>

      <div className="panel-actions">
        <button className="btn" onClick={resetFilters}>
          <Icon.refresh />
          {t("filters.clear")}
        </button>
        <span className="pop-sub" style={{ alignSelf: "center" }}>
          {t("filters.combinedNote")}
        </span>
        <button className="btn btn-primary" style={{ marginInlineStart: "auto" }} onClick={onClose}>
          {t("common.close")}
        </button>
      </div>
    </div>
  );
}
