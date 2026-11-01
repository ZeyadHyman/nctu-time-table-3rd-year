import { useEffect, useMemo, useState } from "react";
import { useStore } from "../store";
import { useT, subjectName, classSectionLabel } from "../i18n";
import {
  computeStats,
  filterClasses,
  fmtDur,
  fmtTime,
  isLive,
  mins,
  subjectColor,
} from "../lib/filtering";
import { applyProfile, weekKey } from "../lib/personal";
import { classDept } from "../types";
import type { ClassEntry, DayNum } from "../types";
import { Icon } from "../components/Icon";

export function DashboardPage({ go }: { go: (route: string) => void }) {
  const t = useT();
  const classes = useStore((s) => s.classes);
  const filters = useStore((s) => s.filters);
  const section = useStore((s) => s.section);
  const prefs = useStore((s) => s.prefs);
  const profile = useStore((s) => s.profile);
  const attendance = useStore((s) => s.attendance);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(id);
  }, []);

  const base = filterClasses(classes, section, filters, {
    subjects: prefs.hiddenSubjects,
    instructors: prefs.hiddenInstructors,
    days: prefs.hiddenDays,
    hideCombined: !prefs.showCombined,
  });
  const visible = useMemo(() => applyProfile(base, profile), [base, profile]);

  const stats = computeStats(visible);
  const today = now.getDay() as DayNum;
  const todayClasses = visible
    .filter((c) => c.day === today)
    .sort((a, b) => mins(a.start) - mins(b.start));
  const todayMinutes = todayClasses.reduce((a, c) => a + (mins(c.end) - mins(c.start)), 0);
  const nm = now.getHours() * 60 + now.getMinutes();
  const completed = todayClasses.filter((c) => mins(c.end) <= nm).length;
  const remaining = todayClasses.length - completed;
  const next = nextOf(todayClasses, nm);

  const wk = weekKey(now);
  const weekAtt = useMemo(() => {
    let done = 0;
    let total = visible.length;
    visible.forEach((c) => {
      if (attendance[`${wk}:${c.id}`]) done++;
    });
    return { done, total };
  }, [attendance, visible, wk]);

  const weekBars = useMemo(() => {
    const order = prefs.dayOrder;
    const max = Math.max(1, ...order.map((d) => visible.filter((c) => c.day === d).length));
    return order.map((d) => {
      const dayClasses = visible.filter((c) => c.day === d);
      const mins_ = dayClasses.reduce((a, c) => a + (mins(c.end) - mins(c.start)), 0);
      return {
        day: d,
        count: dayClasses.length,
        hours: Math.round((mins_ / 60) * 10) / 10,
        pct: Math.round((dayClasses.length / max) * 100),
      };
    });
  }, [visible, prefs.dayOrder]);

  const busiest = weekBars.reduce((a, b) => (b.count > a.count ? b : a), weekBars[0]);

  const dateStr = now.toLocaleDateString(profile.department === "software" ? "en" : "ar", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div>
      <div className="page-head">
        <div>
          <h1 className="page-title">{t("dashboard.title")}</h1>
          <p className="page-sub">{dateStr}</p>
        </div>
        <div className="page-meta">
          <span className="meta-pill">
            <Icon.layers size={13} />
            {t(`dept.${profile.onboarded ? profile.department : "all"}`)}
          </span>
          <span className="meta-pill">
            <span className="dot" />
            {t("dashboard.todayClasses")}: <b>{todayClasses.length}</b>
          </span>
        </div>
      </div>

      <div className="dash-hero">
        {next ? (
          <NextCard c={next} now={now} go={go} />
        ) : (
          <div className="next-card">
            <span className="dot" style={{ ["--c" as string]: "var(--mark)" }} />
            <div>
              <div className="label">{t("dashboard.noNext")}</div>
              <div className="subject">
                {todayClasses.length
                  ? t("dashboard.noNext")
                  : t("dashboard.noClassesToday")}
              </div>
              <div className="meta" style={{ marginTop: 10 }}>
                <button className="btn btn-primary btn-sm" onClick={() => go("#/timetable")}>
                  {t("dashboard.jumpToTimetable")}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="card">
          <div className="card-title">{t("dashboard.weekOverview")}</div>
          <div className="week-strip">
            {weekBars.map((w) => (
              <div
                key={w.day}
                className={"week-bar" + (w.day === today ? " is-today" : "")}
                role="button"
                tabIndex={0}
                title={`${t(`days.${w.day}`)}: ${w.count} · ${w.hours}h`}
                onClick={() => go("#/timetable")}
                onKeyDown={(e) => e.key === "Enter" && go("#/timetable")}
              >
                <span className="num">{w.count}</span>
                <div className="col" style={{ height: 64 }}>
                  <i style={{ height: `${w.pct}%` }} />
                </div>
                <span className="lbl">{t(`dayAbbr.${w.day}`)}</span>
              </div>
            ))}
          </div>
          <p className="page-sub" style={{ marginTop: 10, fontSize: "0.78rem" }}>
            {t("att.weekProgress", { done: weekAtt.done, total: weekAtt.total })} ·{" "}
            {t("stats.busiestDay")}: <b>{busiest ? t(`days.${busiest.day}`) : "—"}</b>
          </p>
        </div>
      </div>

      <div className="stat-grid" style={{ marginBottom: "var(--sp-5)" }}>
        <StatCard icon={<Icon.calendar />} value={String(todayClasses.length)} label={t("dashboard.todayClasses")} />
        <StatCard icon={<Icon.clock />} value={fmtDur(todayMinutes)} label={t("dashboard.todayHours")} />
        <StatCard icon={<Icon.check />} value={`${completed}`} label={t("dashboard.completed")} />
        <StatCard icon={<Icon.play />} value={`${remaining}`} label={t("dashboard.remaining")} />
      </div>

      <div className="card" style={{ marginBottom: "var(--sp-4)" }}>
        <div className="card-title">{t("dashboard.timeline")}</div>
        {todayClasses.length === 0 ? (
          <p className="page-sub">{t("dashboard.noClassesToday")}</p>
        ) : (
          <div className="views-list">
            {todayClasses.map((c) => {
              const state = isLive(c, now)
                ? "live"
                : mins(c.end) <= nm
                  ? "done"
                  : "upcoming";
              return (
                <div key={c.id} className={"view-item tl-" + state}>
                  <span
                    className="dot"
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 99,
                      flex: "none",
                      background:
                        state === "live"
                          ? "var(--accent)"
                          : state === "done"
                            ? "var(--mark)"
                            : subjectColor(c.subject, {}),
                    }}
                  />
                  <span className="name">
                    {subjectName(c.subject, t)}
                    <small style={{ display: "block", fontWeight: 500, color: "var(--soft)" }}>
                      {classSectionLabel(c, t)} · {c.room} · {c.instructor}
                    </small>
                  </span>
                  <em style={{ fontStyle: "normal", fontSize: "0.78rem", color: "var(--soft)", whiteSpace: "nowrap" }}>
                    {fmtTime(c.start)} – {fmtTime(c.end)}
                  </em>
                  <span
                    className="badge"
                    style={{
                      borderColor:
                        state === "live"
                          ? "var(--accent)"
                          : state === "done"
                            ? "var(--line)"
                            : "var(--success)",
                    }}
                  >
                    {t(`dashboard.state.${state}`)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-title">{t("dashboard.quickActions")}</div>
        <div className="opts" style={{ gap: 10 }}>
          <button className="opt" onClick={() => go("#/timetable")}>
            <Icon.calendar size={14} /> {t("nav.timetable")}
          </button>
          <button className="opt" onClick={() => go("#/attendance")}>
            <Icon.check size={14} /> {t("att.mark")}
          </button>
          <button className="opt" onClick={() => go("#/onboarding")}>
            <Icon.pencil size={14} /> {t("profile.changeSubjects")}
          </button>
          <button className="opt" onClick={() => go("#/onboarding")}>
            <Icon.layers size={14} /> {t("profile.changeSessions")}
          </button>
          <button className="opt" onClick={() => go("#/stats")}>
            <Icon.chart size={14} /> {t("dashboard.weeklyProgress")}
          </button>
        </div>
      </div>
    </div>
  );
}

function NextCard({ c, now, go }: { c: ClassEntry; now: Date; go: (h: string) => void }) {
  const t = useT();
  const [tick, setTick] = useState(() => Math.floor((mins(c.start) - (now.getHours() * 60 + now.getMinutes())) * 60));
  useEffect(() => {
    const id = window.setInterval(
      () =>
        setTick(
          Math.max(
            0,
            Math.floor((mins(c.start) - (new Date().getHours() * 60 + new Date().getMinutes())) * 60),
          ),
        ),
      1000,
    );
    return () => window.clearInterval(id);
  }, [c.id, c.start]);

  const live = isLive(c, now);
  const h = Math.floor(tick / 3600);
  const m = Math.floor((tick % 3600) / 60);
  const s = tick % 60;

  return (
    <div className="next-card" style={{ ["--c" as string]: subjectColor(c.subject, {}) }}>
      <span className="dot" />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div className="label">
          {live ? t("timetable.now") : t("dashboard.nextClass")}
          {!live && tick > 0 && (
            <span style={{ marginInlineStart: 10, color: "var(--accent)", fontWeight: 700 }}>
              {h > 0 ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${m}:${String(s).padStart(2, "0")}`}
            </span>
          )}
        </div>
        <div className="subject">{subjectName(c.subject, t)}</div>
        <div className="meta">
          {c.instructor} · {c.room} · {classSectionLabel(c, t)} · {fmtTime(c.start)}–
          {fmtTime(c.end)}
        </div>
        <div className="meta" style={{ marginTop: 8 }}>
          <button className="btn btn-sm" onClick={() => go("#/timetable")}>
            {t("dashboard.openTimetable")}
          </button>
          <button className="btn btn-sm" onClick={() => go("#/attendance")}>
            {t("att.mark")}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="stat-card">
      <span className="stat-icon">{icon}</span>
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

function nextOf(list: ClassEntry[], nm: number): ClassEntry | null {
  return list.find((c) => mins(c.end) > nm) ?? null;
}
