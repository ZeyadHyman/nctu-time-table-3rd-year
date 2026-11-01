import { useMemo } from "react";
import { useStore } from "../store";
import { useT, subjectName } from "../i18n";
import {
  computeStats,
  filterClasses,
  fmtDur,
  fmtTime,
  nextClass,
  subjectColor,
  mins,
} from "../lib/filtering";
import type { DayNum } from "../types";
import { Icon } from "../components/Icon";

export function DashboardPage({ go }: { go: (route: string) => void }) {
  const t = useT();
  const classes = useStore((s) => s.classes);
  const filters = useStore((s) => s.filters);
  const section = useStore((s) => s.section);
  const prefs = useStore((s) => s.prefs);

  const visible = filterClasses(classes, section, filters, {
    subjects: prefs.hiddenSubjects,
    instructors: prefs.hiddenInstructors,
    days: prefs.hiddenDays,
    hideCombined: !prefs.showCombined,
  });

  const stats = computeStats(visible);
  const now = new Date();
  const today = now.getDay() as DayNum;
  const next = nextClass(visible, now);
  const todayClasses = visible.filter((c) => c.day === today);
  const todayMinutes = todayClasses.reduce((a, c) => a + (mins(c.end) - mins(c.start)), 0);

  const weekBars = useMemo(() => {
    const order = prefs.dayOrder;
    const max = Math.max(1, ...order.map((d) => visible.filter((c) => c.day === d).length));
    return order.map((d) => ({
      day: d,
      count: visible.filter((c) => c.day === d).length,
      pct: Math.round((visible.filter((c) => c.day === d).length / max) * 100),
    }));
  }, [visible, prefs.dayOrder]);

  const nextColor = next ? subjectColor(next.subject, {}) : "var(--accent)";

  return (
    <div>
      <div className="page-head">
        <div>
          <h1 className="page-title">{t("dashboard.title")}</h1>
          <p className="page-sub">
            {t("dashboard.greeting")} · {t("app.subtitle")}
          </p>
        </div>
        <div className="page-meta">
          <span className="meta-pill">
            <Icon.calendar size={14} />
            <b>{t(`days.${today}`)}</b>
          </span>
          <span className="meta-pill">
            <span className="dot" />
            {t("dashboard.todayClasses")}: <b>{todayClasses.length}</b>
          </span>
        </div>
      </div>

      <div className="dash-hero">
        <div className="next-card" style={{ ["--c" as string]: nextColor }}>
          <span className="dot" />
          <div style={{ minWidth: 0 }}>
            <div className="label">
              {next && isLiveNow(next, now)
                ? t("timetable.now")
                : next
                  ? t("dashboard.nextClass")
                  : t("dashboard.noNext")}
            </div>
            <div className="subject">
              {next
                ? subjectName(next.subject, t)
                : todayClasses.length > 0
                  ? t("dashboard.noNext")
                  : t("dashboard.noClassesToday")}
            </div>
            {next && (
              <div className="meta">
                {next.instructor} · {next.room} · {fmtTimeRange(next.start, next.end)} ·{" "}
                {t(`dayAbbr.${next.day}`)}
              </div>
            )}
            {!next && (
              <div className="meta" style={{ marginTop: 10 }}>
                <button className="btn btn-primary btn-sm" onClick={() => go("#/timetable")}>
                  {t("dashboard.jumpToTimetable")}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-title">{t("dashboard.weekOverview")}</div>
          <div className="week-strip">
            {weekBars.map((w) => (
              <div
                key={w.day}
                className="week-bar"
                role="button"
                tabIndex={0}
                title={`${t(`days.${w.day}`)}: ${w.count}`}
                onClick={() => go("#/timetable")}
                onKeyDown={(e) => e.key === "Enter" && go("#/timetable")}
              >
                <span className="num">{w.count}</span>
                <div className="col" style={{ height: 74 }}>
                  <i style={{ height: `${w.pct}%` }} />
                </div>
                <span className="lbl">{t(`dayAbbr.${w.day}`)}</span>
              </div>
            ))}
          </div>
          <p className="page-sub" style={{ marginTop: 12 }}>
            <b>{stats.total}</b> {t("dashboard.classesThisWeek")} · <b>{stats.hours}</b>h ·{" "}
            <b>{stats.instructors}</b> {t("stats.instructors").toLowerCase()}
          </p>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard
          icon={<Icon.calendar />}
          value={String(todayClasses.length)}
          label={t("dashboard.todayClasses")}
        />
        <StatCard
          icon={<Icon.clock />}
          value={fmtDur(todayMinutes)}
          label={t("dashboard.todayHours")}
        />
        <StatCard
          icon={<Icon.chart />}
          value={String(stats.total)}
          label={t("stats.totalClasses")}
        />
        <StatCard
          icon={<Icon.layers />}
          value={String(section === "full" ? t("sections.full") : t(`sections.${section}`))}
          label={t("dashboard.currentSection")}
        />
      </div>

      <div className="stats-cols">
        <div className="card">
          <div className="card-title">{t("stats.classesPerDay")}</div>
          {stats.perDay.map((d) => (
            <div className="stat-row" key={d.day}>
              <span className="lbl">{t(`days.${d.day}`)}</span>
              <span className="bar">
                <i
                  style={{
                    width: `${Math.round((d.count / Math.max(1, ...stats.perDay.map((x) => x.count))) * 100)}%`,
                  }}
                />
              </span>
              <em>
                {t("stats.perDay", {
                  count: d.count,
                  hours: fmtDur(d.minutes),
                })}
              </em>
            </div>
          ))}
          {stats.perDay.length === 0 && <p className="page-sub">{t("stats.noData")}</p>}
        </div>

        <div className="card">
          <div className="card-title">{t("stats.hoursPerSubject")}</div>
          {stats.perSubject.slice(0, 6).map((s) => (
            <div className="stat-row" key={s.key}>
              <span className="lbl">{subjectName(s.key, t)}</span>
              <span className="bar">
                <i
                  style={{
                    ["--c" as string]: subjectColor(s.key, {}),
                    width: `${Math.round(
                      (s.minutes / Math.max(1, ...stats.perSubject.map((x) => x.minutes))) * 100,
                    )}%`,
                  }}
                />
              </span>
              <em>{fmtDur(s.minutes)}</em>
            </div>
          ))}
          {stats.perSubject.length === 0 && <p className="page-sub">{t("stats.noData")}</p>}
        </div>
      </div>

      <div className="page-foot">
        <button className="btn btn-sm" onClick={() => go("#/timetable")}>
          <Icon.calendar size={14} />
          {t("dashboard.openTimetable")}
        </button>
        <button className="btn btn-sm" onClick={() => go("#/stats")}>
          <Icon.chart size={14} />
          {t("nav.statistics")}
        </button>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="stat-card">
      <span className="stat-icon">{icon}</span>
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

function isLiveNow(c: { day: number; start: string; end: string }, now: Date) {
  const nm = now.getHours() * 60 + now.getMinutes();
  return c.day === now.getDay() && nm >= mins(c.start) && nm < mins(c.end);
}

function fmtTimeRange(a: string, b: string) {
  return `${fmtTime(a)} – ${fmtTime(b)}`;
}
