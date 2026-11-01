import { Fragment, useMemo, useRef } from "react";
import type { ClassEntry, DayNum } from "../types";
import { SLOTS } from "../types";
import { fmtDur, fmtTime, mins } from "../lib/filtering";
import { useStore } from "../store";
import { useT } from "../i18n";
import { ClassCard } from "./ClassCard";
import { Icon } from "./Icon";

interface Props {
  classes: ClassEntry[]; // already filtered
  selectedDay: DayNum | "today";
  onSelectDay: (d: DayNum) => void;
  onEdit: (c: ClassEntry) => void;
  onDuplicate: (c: ClassEntry) => void;
  onDelete: (c: ClassEntry) => void;
  gridRef?: React.RefObject<HTMLDivElement>;
}

function slotIndexFor(c: ClassEntry): number {
  const s = mins(c.start);
  const mid = (s + mins(c.end)) / 2;
  const i = SLOTS.findIndex(([a, b]) => s >= mins(a) && s < mins(b));
  if (i >= 0) return i;
  const j = SLOTS.findIndex(([a, b]) => mid >= mins(a) && mid <= mins(b));
  return j >= 0 ? j : 0;
}

export function TimetableViews({
  classes,
  selectedDay,
  onSelectDay,
  onEdit,
  onDuplicate,
  onDelete,
  gridRef,
}: Props) {
  const t = useT();
  const prefs = useStore((s) => s.prefs);
  const editMode = useStore((s) => s.editMode);
  const moveClass = useStore((s) => s.moveClass);
  const touch = useRef<{ x: number; y: number } | null>(null);

  const dayOrder = prefs.dayOrder.filter((d) => !prefs.hiddenDays.includes(d));
  const today = new Date().getDay() as DayNum;

  const byDay = useMemo(() => {
    const m = new Map<DayNum, ClassEntry[]>();
    dayOrder.forEach((d) => m.set(d, []));
    const sortFn =
      prefs.sortBy === "subject"
        ? (a: ClassEntry, b: ClassEntry) => a.subject.localeCompare(b.subject)
        : (a: ClassEntry, b: ClassEntry) => mins(a.start) - mins(b.start);
    classes.forEach((c) => {
      if (!m.has(c.day)) m.set(c.day, []);
      m.get(c.day)!.push(c);
    });
    m.forEach((list) => list.sort(sortFn));
    return m;
  }, [classes, prefs.sortBy, prefs.hiddenDays.join(",")]);

  if (prefs.view === "grid") {
    return (
      <div
        className={"board" + (editMode ? " editing" : "")}
        ref={gridRef}
        id="timetable-board"
      >
        <div className="lines" aria-hidden>
          {SLOTS.map((_, i) => (
            <div key={i} />
          ))}
        </div>
        {SLOTS.map(([a, b], i) => (
          <div key={i} className="th" style={{ gridColumn: i + 2 }}>
            {fmtTime(a)}
            <small>– {fmtTime(b)}</small>
          </div>
        ))}
        {dayOrder.map((d) => (
          <Fragment key={d}>
            <div className={"day" + (d === today ? " today" : "")}>
              <b>{t(`dayAbbr.${d}`)}</b>
              <small>
                {byDay.get(d)?.length
                  ? t("timetable.classesCount", { n: byDay.get(d)!.length })
                  : t("timetable.freeDay")}
              </small>
            </div>
            {SLOTS.map(([a, b], si) => {
              const cellClasses = (byDay.get(d) ?? []).filter(
                (c) => slotIndexFor(c) === si,
              );
              return (
                <div
                  key={si}
                  className="cell"
                  onDragOver={(e) => {
                    if (!editMode) return;
                    e.preventDefault();
                    e.currentTarget.classList.add("dragover");
                  }}
                  onDragLeave={(e) => e.currentTarget.classList.remove("dragover")}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove("dragover");
                    const id = e.dataTransfer.getData("text/class-id");
                    if (id) moveClass(id, d, a, b);
                  }}
                >
                  {cellClasses.map((c) => (
                    <ClassCard
                      key={c.id}
                      c={c}
                      compact
                      onEdit={onEdit}
                      onDuplicate={onDuplicate}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              );
            })}
            <div className="sep" />
          </Fragment>
        ))}
      </div>
    );
  }

  // Daily list
  const activeDay: DayNum = selectedDay === "today" ? today : selectedDay;
  const dayClasses = byDay.get(activeDay) ?? [];
  const dayMinutes = dayClasses.reduce((acc, c) => acc + (mins(c.end) - mins(c.start)), 0);

  const stepDay = (dir: -1 | 1) => {
    const idx = dayOrder.indexOf(activeDay);
    if (idx < 0) return;
    const next = dayOrder[idx + dir];
    if (next !== undefined) onSelectDay(next);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    const tch = e.changedTouches[0];
    touch.current = { x: tch.clientX, y: tch.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touch.current) return;
    const tch = e.changedTouches[0];
    const dx = tch.clientX - touch.current.x;
    const dy = tch.clientY - touch.current.y;
    touch.current = null;
    if (Math.abs(dx) > 56 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      // RTL: swipe right goes to previous visually — normalize by direction attribute
      const dir = document.dir === "rtl" ? (dx > 0 ? 1 : -1) : dx > 0 ? -1 : 1;
      stepDay(dir as -1 | 1);
    }
  };

  return (
    <div>
      <div className="day-tabs" role="tablist" aria-label={t("timetable.title")}>
        {dayOrder.map((d) => (
          <button
            key={d}
            role="tab"
            className={"day-tab" + (d === today ? " is-today" : "")}
            aria-selected={d === activeDay}
            onClick={() => onSelectDay(d)}
          >
            <em />
            {t(`dayAbbr.${d}`)}
            <small style={{ opacity: 0.7 }}>
              {byDay.get(d)?.length || ""}
            </small>
          </button>
        ))}
        <button className="day-tab" onClick={() => onSelectDay(today)} style={{ marginInlineStart: "auto" }}>
          <Icon.play />
          {t("common.today")}
        </button>
      </div>

      <div className="dh">
        <h2>{t(`days.${activeDay}`)}</h2>
        <p>
          {dayClasses.length
            ? t("timetable.classesCount", { n: dayClasses.length }) +
              " · " +
              fmtDur(dayMinutes)
            : t("timetable.noClassesDay")}
        </p>
      </div>

      {dayClasses.length === 0 ? (
        <div className="empty">
          <b>{t("timetable.noClassesDay")}</b>
          <p>{t("timetable.empty.body")}</p>
        </div>
      ) : (
        <div className="timeline" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          {dayClasses.map((c, i) => {
            const prev = dayClasses[i - 1];
            const gap =
              prev && mins(c.start) - mins(prev.end) >= 15
                ? mins(c.start) - mins(prev.end)
                : 0;
            return (
              <Fragment key={c.id}>
                {gap > 0 && (
                  <div className="gap-line">
                    {t("timetable.break")} {fmtDur(gap)}
                  </div>
                )}
                <div className="it">
                  <div className="when">
                    <b>{fmtTime(c.start)}</b>
                    <span>{fmtTime(c.end)}</span>
                    <span style={{ fontSize: "0.66rem" }}>{fmtDur(mins(c.end) - mins(c.start))}</span>
                  </div>
                  <div className="stack">
                    <ClassCard
                      c={c}
                      onEdit={onEdit}
                      onDuplicate={onDuplicate}
                      onDelete={onDelete}
                    />
                  </div>
                </div>
              </Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
}
