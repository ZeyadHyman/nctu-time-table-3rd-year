import { Fragment, useMemo, useState } from "react";
import type { ClassEntry, DayNum } from "../types";
import { DAYS, SLOTS } from "../types";
import { mins, fmtTime, fmtDur } from "../lib/filtering";
import { useStore } from "../store";
import { ClassCard } from "./ClassCard";

const slotIndex = (s: string) => SLOTS.findIndex((p) => p[0] === s);
const slotEnd = (s: string) => {
  const t = mins(s);
  return SLOTS.findIndex((p) => mins(p[0]) < t && t <= mins(p[1]));
};
const spanOf = (c: ClassEntry) => {
  const a = slotIndex(c.start);
  const b = slotEnd(c.end);
  return b < a ? 1 : b - a + 1;
};

export function TimetableGrid({
  classes,
  onEdit,
  onDuplicate,
  onDelete,
  onMove,
}: {
  classes: ClassEntry[];
  onEdit: (c: ClassEntry) => void;
  onDuplicate: (c: ClassEntry) => void;
  onDelete: (c: ClassEntry) => void;
  onMove: (id: string, day: DayNum, start: string) => void;
}) {
  const prefs = useStore((s) => s.prefs);
  const editMode = useStore((s) => s.editMode);
  const today = new Date().getDay();
  const [dragOver, setDragOver] = useState<string | null>(null);

  const dayOrder = prefs.dayOrder.filter((d) => !prefs.hiddenDays.includes(d));
  const shownDays = dayOrder.filter((d) => classes.some((c) => c.day === d) || !editMode);
  // Always show every day in dayOrder when editing so you can drop onto empty cells
  const rows = editMode ? dayOrder : shownDays;

  return (
    <div className={"desk board" + (editMode ? " editing" : "")} id="board">
      <div className="lines">
        {SLOTS.map((_, i) => (
          <div key={i} />
        ))}
      </div>
      {SLOTS.map((p, i) => (
        <div className="th" key={p[0]} style={{ gridColumn: i + 2 }}>
          {fmtTime(p[0])}
          <small>{fmtTime(p[1])}</small>
        </div>
      ))}
      {rows.map((dayNum, i) => {
        const meta = DAYS.find((d) => d.num === dayNum)!;
        const dayClasses = classes.filter((c) => c.day === dayNum);
        const r = i + 2;
        const groups = new Map<number, ClassEntry[]>();
        dayClasses.slice().sort((a, b) => mins(a.start) - mins(b.start)).forEach((c) => {
          const s = Math.max(0, slotIndex(c.start));
          if (!groups.has(s)) groups.set(s, []);
          groups.get(s)!.push(c);
        });
        return (
          <Fragment key={dayNum}>
            <div className="sep" style={{ gridRow: r }} />
            <div className={"day" + (dayNum === today ? " today" : "")} style={{ gridRow: r }}>
              <b>{meta.name}</b>
              <small>
                {dayNum === today
                  ? "Today"
                  : dayClasses.length
                    ? `${dayClasses.length} classes`
                    : editMode
                      ? "free"
                      : ""}
              </small>
            </div>
            {editMode
              ? SLOTS.map((_, s) => {
                  const list = groups.get(s) ?? [];
                  const span = list.length ? Math.max(...list.map(spanOf)) : 1;
                  const key = `${dayNum}-${s}`;
                  return (
                    <div
                      key={s}
                      className={"cell" + (dragOver === key ? " dragover" : "")}
                      style={{ gridColumn: `${s + 2} / span ${span}`, gridRow: r }}
                      onDragOver={(e) => {
                        if (!editMode) return;
                        e.preventDefault();
                        setDragOver(key);
                      }}
                      onDragLeave={() => setDragOver((k) => (k === key ? null : k))}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragOver(null);
                        const id = e.dataTransfer.getData("text/class-id");
                        if (!id) return;
                        onMove(id, dayNum as DayNum, SLOTS[s][0]);
                      }}
                    >
                      {list.map((c) => (
                        <ClassCard
                          key={c.id}
                          c={c}
                          compact={spanOf(c) === 1}
                          onEdit={onEdit}
                          onDuplicate={onDuplicate}
                          onDelete={onDelete}
                        />
                      ))}
                    </div>
                  );
                })
              : [...groups.entries()].map(([s, list]) => {
                  const span = Math.max(...list.map(spanOf));
                  return (
                    <div
                      key={s}
                      className="cell"
                      style={{ gridColumn: `${s + 2} / span ${span}`, gridRow: r }}
                    >
                      {list.map((c) => (
                        <ClassCard
                          key={c.id}
                          c={c}
                          compact={spanOf(c) === 1}
                          onEdit={onEdit}
                          onDuplicate={onDuplicate}
                          onDelete={onDelete}
                        />
                      ))}
                    </div>
                  );
                })}
          </Fragment>
        );
      })}
    </div>
  );
}

export function DayList({
  classes,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  classes: ClassEntry[];
  onEdit: (c: ClassEntry) => void;
  onDuplicate: (c: ClassEntry) => void;
  onDelete: (c: ClassEntry) => void;
}) {
  const prefs = useStore((s) => s.prefs);
  const today = new Date().getDay();
  const dayOrder = prefs.dayOrder.filter((d) => !prefs.hiddenDays.includes(d));
  const withClasses = dayOrder.filter((d) => classes.some((c) => c.day === d));
  const days = withClasses.length ? withClasses : dayOrder;
  const [sel, setSel] = useState<DayNum>(() => {
    if (withClasses.includes(today as DayNum)) return today as DayNum;
    return days[0] ?? 6;
  });
  const active = days.includes(sel) ? sel : (days[0] ?? 6);
  const dayClasses = classes.filter((c) => c.day === active).sort((a, b) => mins(a.start) - mins(b.start));
  const meta = DAYS.find((d) => d.num === active)!;

  const groups = useMemo(() => {
    const g: { key: string; start: string; end: string; items: ClassEntry[] }[] = [];
    dayClasses.forEach((c) => {
      const key = c.start + "|" + c.end;
      let x = g.find((y) => y.key === key);
      if (!x) {
        x = { key, start: c.start, end: c.end, items: [] };
        g.push(x);
      }
      x.items.push(c);
    });
    return g;
  }, [dayClasses]);

  return (
    <div className={prefs.view === "list" ? "" : "mob-only"}>
      <div className="tabs" role="tablist">
        {days.map((d) => {
          const m = DAYS.find((x) => x.num === d)!;
          return (
            <button
              key={d}
              className={"tab" + (d === today ? " t" : "")}
              role="tab"
              aria-selected={d === active}
              onClick={() => setSel(d)}
            >
              {m.abbr}
              <em />
            </button>
          );
        })}
      </div>
      {dayClasses.length === 0 ? (
        <div className="empty">
          <b>No classes</b>
          {meta.name} has no classes matching your filters.
        </div>
      ) : (
        <>
          <div className="dh">
            <h2>{meta.name}</h2>
            <p>
              {dayClasses.length} classes · {fmtTime(dayClasses[0].start)} to{" "}
              {fmtTime(dayClasses[dayClasses.length - 1].end)}
              {active === today ? " · Today" : ""}
            </p>
          </div>
          {groups.map((g, j) => (
            <div key={g.key}>
              {j > 0 && mins(g.start) - mins(groups[j - 1].end) > 0 && (
                <div className="gap">
                  {fmtDur(mins(g.start) - mins(groups[j - 1].end))} break
                </div>
              )}
              <div className="it">
                <div className="when">
                  <b>{fmtTime(g.start)}</b>
                  <span>{fmtTime(g.end)}</span>
                </div>
                <div className="stack">
                  {g.items.map((c) => (
                    <ClassCard key={c.id} c={c} onEdit={onEdit} onDuplicate={onDuplicate} onDelete={onDelete} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}


