import { useMemo, useState } from "react";
import type { AttendanceStatus, DayNum } from "../types";
import { useStore } from "../store";
import { useT, subjectName } from "../i18n";
import { fmtTime, mins } from "../lib/filtering";
import { applyProfile, shiftWeek, weekKey, weekLabel } from "../lib/personal";
import { Icon } from "../components/Icon";

const CYCLE: (AttendanceStatus | null)[] = ["attended", "missed", "excused", null];

export function AttendancePage({ go }: { go: (h: string) => void }) {
  const t = useT();
  const classes = useStore((s) => s.classes);
  const profile = useStore((s) => s.profile);
  const attendance = useStore((s) => s.attendance);
  const setAttendance = useStore((s) => s.setAttendance);
  const prefs = useStore((s) => s.prefs);
  const [week, setWeek] = useState(() => weekKey());

  const personal = useMemo(() => applyProfile(classes, profile), [classes, profile]);
  const dayOrder = prefs.dayOrder.filter((d) => !prefs.hiddenDays.includes(d));

  const byDay = useMemo(() => {
    const m = new Map<DayNum, typeof personal>();
    dayOrder.forEach((d) => m.set(d, []));
    personal.forEach((c) => {
      if (!m.has(c.day)) m.set(c.day, []);
      m.get(c.day)!.push(c);
    });
    m.forEach((l) => l.sort((a, b) => mins(a.start) - mins(b.start)));
    return m;
  }, [personal, dayOrder]);

  const statusOf = (id: string) => attendance[`${week}:${id}`] ?? null;

  const all = personal;
  const counts = { attended: 0, missed: 0, excused: 0, pending: 0 };
  all.forEach((c) => {
    const s = statusOf(c.id);
    if (s) counts[s]++;
    else counts.pending++;
  });
  const pct = all.length ? Math.round(((counts.attended + counts.excused) / all.length) * 100) : 0;

  const perSubject = useMemo(() => {
    const map = new Map<string, { attended: number; missed: number; excused: number; total: number }>();
    Object.entries(attendance).forEach(([key, st]) => {
      const id = key.split(":").slice(1).join(":");
      const c = classes.find((x) => x.id === id);
      if (!c) return;
      if (!profile.onboarded || profile.subjects.includes(c.subject) || profile.sessions.includes(c.id)) {
        const e = map.get(c.subject) ?? { attended: 0, missed: 0, excused: 0, total: 0 };
        e.total++;
        e[st]++;
        map.set(c.subject, e);
      }
    });
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [attendance, classes, profile]);

  if (!profile.onboarded) {
    return (
      <div>
        <div className="page-head">
          <h1 className="page-title">{t("nav.attendance")}</h1>
        </div>
        <div className="empty">
          <b>{t("onboard.title")}</b>
          <p>{t("onboard.subtitle")}</p>
          <button className="btn btn-primary" onClick={() => go("#/onboarding")}>
            {t("onboard.getStarted")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1 className="page-title">{t("nav.attendance")}</h1>
          <p className="page-sub">{t("att.subtitle")}</p>
        </div>
        <div className="page-meta">
          <button className="btn btn-sm" onClick={() => setWeek(shiftWeek(week, -1))}>
            <Icon.chevronLeft size={14} />
          </button>
          <span className="meta-pill">
            <span className="dot" />
            <b>{weekLabel(week)}</b>
          </span>
          <button className="btn btn-sm" onClick={() => setWeek(shiftWeek(week, 1))}>
            <Icon.chevronRight size={14} />
          </button>
          <button className="btn btn-sm" onClick={() => setWeek(weekKey())}>
            {t("common.today")}
          </button>
        </div>
      </div>

      <div className="stat-grid" style={{ marginBottom: "var(--sp-5)" }}>
        <div className="stat-card">
          <span className="stat-value">
            {counts.attended + counts.excused + counts.missed} / {all.length}
          </span>
          <span className="stat-label">{t("att.markedOf")}</span>
          <span className="bar" style={{ height: 8, background: "var(--panel-3)", borderRadius: 99, overflow: "hidden" }}>
            <i
              style={{
                display: "block",
                height: "100%",
                width: `${pct}%`,
                background: "var(--success)",
                borderRadius: 99,
              }}
            />
          </span>
          <span className="stat-label">
            {pct}% {t("att.rate")}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-value" style={{ color: "var(--success)" }}>
            {counts.attended}
          </span>
          <span className="stat-label">{t("att.attended")}</span>
        </div>
        <div className="stat-card">
          <span className="stat-value" style={{ color: "var(--danger)" }}>
            {counts.missed}
          </span>
          <span className="stat-label">{t("att.missed")}</span>
        </div>
        <div className="stat-card">
          <span className="stat-value" style={{ color: "var(--sun)" }}>
            {counts.excused}
          </span>
          <span className="stat-label">{t("att.excused")}</span>
        </div>
        <div className="stat-card">
          <span className="stat-value" style={{ color: "var(--soft)" }}>
            {counts.pending}
          </span>
          <span className="stat-label">{t("att.pending")}</span>
        </div>
      </div>

      {dayOrder.map((d) => {
        const list = byDay.get(d) ?? [];
        if (!list.length) return null;
        return (
          <div key={d} style={{ marginBottom: "var(--sp-5)" }}>
            <div className="section-label">{t(`days.${d}`)}</div>
            <div className="views-list" style={{ marginTop: 8 }}>
              {list.map((c) => {
                const st = statusOf(c.id);
                return (
                  <div
                    key={c.id}
                    className={
                      "view-item att-row" + (st ? ` att-${st}` : "")
                    }
                  >
                    <button
                      className="att-box"
                      data-status={st ?? "pending"}
                      aria-label={subjectName(c.subject, t)}
                      onClick={() => {
                        const idx = CYCLE.indexOf(st);
                        const next = CYCLE[(idx + 1) % CYCLE.length];
                        setAttendance(week, c.id, next);
                      }}
                    >
                      {st === "attended" && <Icon.check size={14} />}
                      {st === "missed" && <Icon.x size={14} />}
                      {st === "excused" && <Icon.alert size={13} />}
                    </button>
                    <span className="name">
                      {subjectName(c.subject, t)}
                      <small style={{ display: "block", fontWeight: 500, color: "var(--soft)" }}>
                        {t(`kinds.${c.type}`)}
                        {c.sections.length
                          ? ` · ${c.sections.map((x) => t(`sections.${x}`)).join(" & ")}`
                          : ""}{" "}
                        · {c.room} · {c.instructor}
                      </small>
                    </span>
                    <em style={{ fontStyle: "normal", color: "var(--soft)", fontSize: "0.78rem", whiteSpace: "nowrap" }}>
                      {fmtTime(c.start)}
                    </em>
                    <div className="acts">
                      <button
                        className="btn btn-sm"
                        onClick={() => setAttendance(week, c.id, "attended")}
                        aria-pressed={st === "attended"}
                      >
                        {t("att.attended")}
                      </button>
                      <button
                        className="btn btn-sm"
                        onClick={() => setAttendance(week, c.id, "missed")}
                        aria-pressed={st === "missed"}
                      >
                        {t("att.missed")}
                      </button>
                      <button
                        className="btn btn-sm"
                        onClick={() => setAttendance(week, c.id, "excused")}
                        aria-pressed={st === "excused"}
                      >
                        {t("att.excused")}
                      </button>
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => setAttendance(week, c.id, null)}
                        disabled={!st}
                        title={t("att.undo")}
                      >
                        <Icon.undo size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {all.length === 0 && (
        <div className="empty">
          <b>{t("timetable.empty.title")}</b>
          <p>{t("timetable.empty.body")}</p>
          <button className="btn btn-primary" onClick={() => go("#/onboarding")}>
            {t("profile.edit")}
          </button>
        </div>
      )}

      {perSubject.length > 0 && (
        <div className="card" style={{ marginTop: "var(--sp-5)" }}>
          <div className="card-title">{t("att.bySubject")}</div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ color: "var(--soft)", textAlign: "start" }}>
                  <th style={{ padding: "8px 6px", textAlign: "start" }}>{t("form.subject")}</th>
                  <th style={{ padding: "8px 6px" }}>{t("att.attended")}</th>
                  <th style={{ padding: "8px 6px" }}>{t("att.missed")}</th>
                  <th style={{ padding: "8px 6px" }}>{t("att.excused")}</th>
                  <th style={{ padding: "8px 6px" }}>{t("att.rate")}</th>
                </tr>
              </thead>
              <tbody>
                {perSubject.map(([subj, v]) => {
                  const p = v.total ? Math.round(((v.attended + v.excused) / v.total) * 100) : 0;
                  return (
                    <tr key={subj} style={{ borderTop: "1px solid var(--line)" }}>
                      <td style={{ padding: "9px 6px", fontWeight: 600 }}>
                        {subjectName(subj, t)}
                      </td>
                      <td style={{ padding: "9px 6px", textAlign: "center", color: "var(--success)" }}>
                        {v.attended}
                      </td>
                      <td style={{ padding: "9px 6px", textAlign: "center", color: "var(--danger)" }}>
                        {v.missed}
                      </td>
                      <td style={{ padding: "9px 6px", textAlign: "center", color: "var(--sun)" }}>
                        {v.excused}
                      </td>
                      <td style={{ padding: "9px 6px", textAlign: "center", fontWeight: 700 }}>
                        {p}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
