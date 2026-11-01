import { useMemo } from "react";
import { useStore } from "../store";
import { useT, subjectName } from "../i18n";
import {
  computeStats,
  filterClasses,
  fmtDur,
  nextClass,
  subjectColor,
} from "../lib/filtering";
import { Icon } from "../components/Icon";

export function StatisticsPage() {
  const t = useT();
  const classes = useStore((s) => s.classes);
  const filters = useStore((s) => s.filters);
  const section = useStore((s) => s.section);
  const prefs = useStore((s) => s.prefs);

  const visible = useMemo(
    () =>
      filterClasses(classes, section, filters, {
        subjects: prefs.hiddenSubjects,
        instructors: prefs.hiddenInstructors,
        days: prefs.hiddenDays,
        hideCombined: !prefs.showCombined,
      }),
    [classes, section, filters, prefs],
  );

  const stats = computeStats(visible);
  const next = nextClass(visible);

  const maxSubject = Math.max(1, ...stats.perSubject.map((s) => s.minutes));
  const maxDay = Math.max(1, ...stats.perDay.map((d) => d.count));
  const busiest = stats.perDay.reduce<(typeof stats.perDay)[number] | null>(
    (a, b) => (!a || b.count > a.count ? b : a),
    null,
  );
  const lightest = stats.perDay.reduce<(typeof stats.perDay)[number] | null>(
    (a, b) => (!a || b.count < a.count ? b : a),
    null,
  );

  return (
    <div>
      <div className="page-head">
        <div>
          <h1 className="page-title">{t("stats.title")}</h1>
          <p className="page-sub">{t("stats.subtitle")}</p>
        </div>
        <div className="page-meta">
          <span className="meta-pill">
            <span className="dot" />
            {visible.length} {t("common.classes")}
          </span>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="empty">
          <b>{t("stats.noData")}</b>
          <p>{t("timetable.empty.body")}</p>
        </div>
      ) : (
        <>
          <div className="stat-grid">
            <div className="stat-card">
              <span className="stat-icon">
                <Icon.calendar />
              </span>
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">{t("stats.totalClasses")}</span>
            </div>
            <div className="stat-card">
              <span className="stat-icon">
                <Icon.clock />
              </span>
              <span className="stat-value">{stats.hours}h</span>
              <span className="stat-label">{t("stats.totalHours")}</span>
            </div>
            <div className="stat-card">
              <span className="stat-icon">
                <Icon.layers />
              </span>
              <span className="stat-value">{stats.perSubject.length}</span>
              <span className="stat-label">{t("stats.subjects")}</span>
            </div>
            <div className="stat-card">
              <span className="stat-icon">
                <Icon.user />
              </span>
              <span className="stat-value">{stats.instructors}</span>
              <span className="stat-label">{t("stats.instructors")}</span>
            </div>
            <div className="stat-card">
              <span className="stat-icon">
                <Icon.chart />
              </span>
              <span className="stat-value">{stats.perDay.length}</span>
              <span className="stat-label">{t("stats.activeDays")}</span>
            </div>
            <div className="stat-card">
              <span className="stat-icon">
                <Icon.zap />
              </span>
              <span className="stat-value" style={{ fontSize: "1.15rem", lineHeight: 1.25 }}>
                {busiest ? t(`days.${busiest.day}`) : "—"}
              </span>
              <span className="stat-label">{t("stats.busiestDay")}</span>
            </div>
          </div>

          <div className="stats-cols">
            <div className="card">
              <div className="card-title">{t("stats.hoursPerSubject")}</div>
              {stats.perSubject.map((s) => (
                <div className="stat-row" key={s.key}>
                  <span className="lbl" title={subjectName(s.key, t)}>
                    {subjectName(s.key, t)}
                  </span>
                  <span className="bar">
                    <i
                      style={{
                        ["--c" as string]: subjectColor(s.key, {}),
                        width: `${Math.round((s.minutes / maxSubject) * 100)}%`,
                      }}
                    />
                  </span>
                  <em>
                    {fmtDur(s.minutes)} · {s.count}×
                  </em>
                </div>
              ))}
            </div>

            <div className="card">
              <div className="card-title">{t("stats.classesPerDay")}</div>
              {stats.perDay.map((d) => (
                <div className="stat-row" key={d.day}>
                  <span className="lbl">{t(`days.${d.day}`)}</span>
                  <span className="bar">
                    <i style={{ width: `${Math.round((d.count / maxDay) * 100)}%` }} />
                  </span>
                  <em>
                    {t("stats.perDay", { count: d.count, hours: fmtDur(d.minutes) })}
                  </em>
                </div>
              ))}
              <div className="panel-actions" style={{ marginTop: 14 }}>
                <span className="meta-pill">
                  {t("stats.busiestDay")}: <b>{busiest ? t(`days.${busiest.day}`) : "—"}</b>
                </span>
                <span className="meta-pill">
                  {t("stats.lightestDay")}: <b>{lightest ? t(`days.${lightest.day}`) : "—"}</b>
                </span>
              </div>
            </div>
          </div>

          {next && (
            <div className="card" style={{ marginTop: "var(--sp-5)" }}>
              <div className="card-title">{t("stats.nextUp")}</div>
              <div className="stat-row">
                <span className="lbl">
                  {subjectName(next.subject, t)} — {next.instructor}
                </span>
                <em>
                  {t(`days.${next.day}`)} · {next.start}–{next.end} · {next.room}
                </em>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
