import { useMemo } from "react";
import type { ClassEntry } from "../types";
import { computeStats, nextClass, fmtTime, fmtDur, mins, kindLabel, sectionLabel } from "../lib/filtering";
import { useStore } from "../store";
import { Panel } from "./Panel";
import { SUBJECTS, DAYS } from "../types";

export function StatsPanel({ classes, open, onToggle }: { classes: ClassEntry[]; open: boolean; onToggle: () => void }) {
  const stats = useMemo(() => computeStats(classes), [classes]);
  const upcoming = useMemo(() => nextClass(classes), [classes]);
  const now = new Date();

  const maxSubj = Math.max(1, ...stats.perSubject.map((s) => s.minutes));

  return (
    <Panel title="Statistics" hint="updates with your filters" open={open} onToggle={onToggle}>
      <div className="stat-cards">
        <div className="stat-card">
          <b>{stats.total}</b>
          <span>classes this week</span>
        </div>
        <div className="stat-card">
          <b>{stats.hours}h</b>
          <span>total hours</span>
        </div>
        <div className="stat-card">
          <b>{stats.perDay.length}</b>
          <span>active days</span>
        </div>
        <div className="stat-card">
          <b>{stats.perSubject.length}</b>
          <span>subjects</span>
        </div>
      </div>

      {upcoming && (
        <div
          className="stat-card"
          style={{ marginTop: 10, display: "flex", gap: 12, alignItems: "center" }}
        >
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: SUBJECTS[upcoming.subject]?.color,
              flex: "none",
            }}
          />
          <div style={{ fontSize: "0.9rem" }}>
            <b style={{ fontFamily: "Archivo Black", fontWeight: 400 }}>
              {SUBJECTS[upcoming.subject]?.name}
            </b>{" "}
            <span style={{ color: "var(--soft)" }}>
              · {kindLabel(upcoming)} · {sectionLabel(upcoming)} · {DAYS.find((d) => d.num === upcoming.day)?.name}{" "}
              {fmtTime(upcoming.start)} · {upcoming.room}
              {upcoming.day === now.getDay() && mins(upcoming.start) <= now.getHours() * 60 + now.getMinutes()
                ? " · happening now"
                : ""}
            </span>
          </div>
        </div>
      )}

      <div className="stats-cols">
        <div>
          <h4>Hours per subject</h4>
          {stats.perSubject.map((s) => (
            <div className="stat-row" key={s.key}>
              <span style={{ width: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {s.name}
              </span>
              <span className="bar">
                <i style={{ width: `${(s.minutes / maxSubj) * 100}%`, ["--c" as string]: s.color }} />
              </span>
              <em>
                {s.count}× · {fmtDur(s.minutes)}
              </em>
            </div>
          ))}
          {stats.perSubject.length === 0 && <p style={{ color: "var(--soft)", fontSize: "0.82rem" }}>No classes match.</p>}
        </div>
        <div>
          <h4>Classes per day</h4>
          {stats.perDay.map((d) => (
            <div className="stat-row" key={d.day}>
              <span style={{ width: 90 }}>{d.name}</span>
              <span className="bar">
                <i
                  style={{
                    width: `${(d.count / Math.max(1, ...stats.perDay.map((x) => x.count))) * 100}%`,
                    ["--c" as string]: "var(--blue)",
                  }}
                />
              </span>
              <em>
                {d.count} classes · {fmtDur(d.minutes)}
              </em>
            </div>
          ))}
          {stats.perDay.length === 0 && <p style={{ color: "var(--soft)", fontSize: "0.82rem" }}>No classes match.</p>}
        </div>
      </div>
    </Panel>
  );
}
