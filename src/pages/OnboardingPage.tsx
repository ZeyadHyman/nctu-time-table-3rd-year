import { useMemo, useState } from "react";
import type { ClassEntry, Department } from "../types";
import { SUBJECTS, classDept, EMPTY_FILTERS } from "../types";
import { filterClasses, fmtTime, overlaps } from "../lib/filtering";
import { applyProfile, previewProfile } from "../lib/personal";
import { useStore } from "../store";
import { useT, subjectName } from "../i18n";
import { toast } from "../toast";
import { Icon } from "../components/Icon";

const STEPS = ["welcome", "dept", "subjects", "sessions", "review", "done"] as const;
type Step = (typeof STEPS)[number];

export function OnboardingPage({ go }: { go: (hash: string) => void }) {
  const t = useT();
  const classes = useStore((s) => s.classes);
  const profile = useStore((s) => s.profile);
  const setProfile = useStore((s) => s.setProfile);
  const setFilters = useStore((s) => s.setFilters);

  const editing = profile.onboarded;
  const [step, setStep] = useState<Step>(editing ? "dept" : "welcome");
  const [dept, setDept] = useState<"software" | "network">(profile.department);
  const [subjects, setSubjects] = useState<string[]>(
    profile.onboarded ? [...profile.subjects] : [],
  );
  const [sessions, setSessions] = useState<string[]>(
    profile.onboarded ? [...profile.sessions] : [],
  );
  const [q, setQ] = useState("");

  const deptAllowed = (c: ClassEntry) => {
    const d = classDept(c);
    return d === "both" || d === dept;
  };

  const availableSubjects = useMemo(() => {
    const set = new Set<string>();
    classes.filter(deptAllowed).forEach((c) => set.add(c.subject));
    return [...set].sort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classes, dept]);

  const filteredSubjects = availableSubjects.filter((s) =>
    subjectName(s, t).toLowerCase().includes(q.toLowerCase()),
  );

  const sessionsFor = (subject: string) =>
    classes.filter((c) => c.subject === subject && c.type !== "combined" && deptAllowed(c));

  const combinedFor = (subject: string) =>
    classes.filter((c) => c.subject === subject && c.type === "combined" && deptAllowed(c));

  const preview = applyProfile(
    filterClasses(classes, "full", EMPTY_FILTERS, {
      subjects: [],
      instructors: [],
      days: [],
    }),
    previewProfile(dept, subjects, sessions),
  );

  const conflicts = useMemo(() => {
    const out: string[] = [];
    for (let i = 0; i < preview.length; i++)
      for (let j = i + 1; j < preview.length; j++)
        if (overlaps(preview[i], preview[j]))
          out.push(
            `${subjectName(preview[i].subject, t)} ↔ ${subjectName(preview[j].subject, t)} (${t(
              `dayAbbr.${preview[i].day}`,
            )})`,
          );
    return out;
  }, [preview, t]);

  const toggleSubject = (s: string) => {
    setSubjects((p) => {
      if (p.includes(s)) {
        setSessions((sp) => {
          const ids = new Set(classes.filter((c) => c.subject === s).map((c) => c.id));
          return sp.filter((id) => !ids.has(id));
        });
        return p.filter((x) => x !== s);
      }
      return [...p, s];
    });
  };

  const toggleSession = (id: string, subject: string) => {
    setSessions((p) => {
      if (p.includes(id)) return p.filter((x) => x !== id);
      // keep one session per subject by default? allow multi but drop same-subject others optional — keep multi allowed
      return [...p, id];
    });
  };

  function finish() {
    setProfile({ onboarded: true, department: dept, subjects, sessions });
    setFilters({ dept });
    toast(t("onboard.readyShort"));
    go("#/dashboard");
  }

  const stepIdx = STEPS.indexOf(step);

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "var(--sp-6) var(--sp-4)" }}>
      <div className="page-head" style={{ marginBottom: "var(--sp-4)" }}>
        <div>
          <h1 className="page-title">{editing ? t("profile.title") : t("onboard.title")}</h1>
          <p className="page-sub">{t("onboard.subtitle")}</p>
        </div>
        <div className="page-meta">
          {STEPS.filter((s) => s !== "done").map((s, i) => (
            <span
              key={s}
              className="meta-pill"
              style={{
                borderColor:
                  STEPS.indexOf(step) >= i ? "var(--accent)" : "var(--line)",
                opacity: STEPS.indexOf(step) >= i ? 1 : 0.5,
              }}
            >
              {i + 1}
            </span>
          ))}
        </div>
      </div>

      <div className="card">
        {step === "welcome" && (
          <div style={{ textAlign: "center", padding: "var(--sp-6) 0" }}>
            <div className="brand-mark" style={{ margin: "0 auto var(--sp-4)", width: 56, height: 56, fontSize: "1.4rem" }}>
              SW
            </div>
            <h2 className="page-title" style={{ fontSize: "1.6rem" }}>
              {t("onboard.welcome")}
            </h2>
            <p className="page-sub" style={{ marginTop: 10, marginBottom: 22 }}>
              {t("onboard.welcomeSub")}
            </p>
            <button className="btn btn-primary btn-lg" onClick={() => setStep("dept")}>
              {t("onboard.getStarted")}
              <Icon.chevronRight />
            </button>
          </div>
        )}

        {step === "dept" && (
          <div>
            <h2 className="card-title">{t("onboard.deptTitle")}</h2>
            <p className="page-sub" style={{ marginBottom: 16 }}>
              {t("onboard.deptSub")}
            </p>
            <div className="opts" style={{ gap: 12 }}>
              {(["software", "network"] as const).map((d) => (
                <button
                  key={d}
                  className="opt"
                  style={{ padding: "18px 28px", fontSize: "1rem", borderRadius: "var(--r-lg)" }}
                  aria-pressed={dept === d}
                  onClick={() => {
                    setDept(d);
                    setSubjects([]);
                    setSessions([]);
                  }}
                >
                  {t(`dept.${d}`)}
                </button>
              ))}
            </div>
            <div className="modal-actions" style={{ marginTop: 24 }}>
              <button className="btn" onClick={() => setStep("welcome")}>
                <Icon.chevronLeft />
                {t("common.back")}
              </button>
              <button className="btn btn-primary" onClick={() => setStep("subjects")}>
                {t("common.next")}
                <Icon.chevronRight />
              </button>
            </div>
          </div>
        )}

        {step === "subjects" && (
          <div>
            <div className="pop-head">
              <div>
                <h2 className="card-title" style={{ marginBottom: 0 }}>
                  {t("onboard.subjectsTitle")}
                </h2>
                <p className="pop-sub">{t("onboard.subjectsSub")}</p>
              </div>
              <div className="page-meta">
                <button
                  className="btn btn-sm"
                  onClick={() => setSubjects(availableSubjects)}
                >
                  {t("customize.showAll")}
                </button>
                <button className="btn btn-sm" onClick={() => setSubjects([])}>
                  {t("common.none")}
                </button>
              </div>
            </div>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("onboard.searchSubjects")}
              style={{ marginBottom: 12 }}
            />
            <div className="opts">
              {filteredSubjects.map((s) => (
                <button
                  key={s}
                  className="opt"
                  aria-pressed={subjects.includes(s)}
                  onClick={() => toggleSubject(s)}
                >
                  {subjectName(s, t)}
                </button>
              ))}
            </div>
            <div className="modal-actions" style={{ marginTop: 24 }}>
              <button className="btn" onClick={() => setStep("dept")}>
                <Icon.chevronLeft />
                {t("common.back")}
              </button>
              <span className="duration-note">
                {subjects.length} {t("common.subjectsCount")}
              </span>
              <button
                className="btn btn-primary"
                disabled={subjects.length === 0}
                onClick={() => setStep("sessions")}
              >
                {t("common.next")}
                <Icon.chevronRight />
              </button>
            </div>
          </div>
        )}

        {step === "sessions" && (
          <div>
            <h2 className="card-title">{t("onboard.sessionsTitle")}</h2>
            <p className="page-sub" style={{ marginBottom: 16 }}>
              {t("onboard.sessionsSub")}
            </p>
            {subjects.map((subj) => (
              <div key={subj} style={{ marginBottom: 18 }}>
                <div className="section-label">{subjectName(subj, t)}</div>
                {combinedFor(subj).length > 0 && (
                  <p className="pop-sub" style={{ marginBottom: 6 }}>
                    <Icon.check size={12} /> {t("onboard.combinedAuto")}
                  </p>
                )}
                <div className="views-list" style={{ marginTop: 6 }}>
                  {sessionsFor(subj).map((c) => (
                    <label
                      key={c.id}
                      className={
                        "view-item" + (sessions.includes(c.id) ? " active" : "")
                      }
                      style={{ cursor: "pointer" }}
                    >
                      <input
                        type="checkbox"
                        checked={sessions.includes(c.id)}
                        onChange={() => toggleSession(c.id, subj)}
                        style={{ width: "auto", accentColor: "var(--accent)" }}
                      />
                      <span className="name" style={{ fontWeight: 600 }}>
                        {c.sections.length
                          ? c.sections
                              .map((x) => t(`sections.${x}`))
                              .join(" & ")
                          : t("kinds." + c.type)}
                      </span>
                      <em style={{ fontStyle: "normal", color: "var(--soft)", fontSize: "0.78rem" }}>
                        {c.instructor} · {t(`dayAbbr.${c.day}`)} · {fmtTime(c.start)}–
                        {fmtTime(c.end)} · {c.room}
                      </em>
                    </label>
                  ))}
                  {sessionsFor(subj).length === 0 && (
                    <p className="pop-sub">{t("onboard.noSessions")}</p>
                  )}
                </div>
              </div>
            ))}
            <div className="modal-actions" style={{ marginTop: 12 }}>
              <button className="btn" onClick={() => setStep("subjects")}>
                <Icon.chevronLeft />
                {t("common.back")}
              </button>
              <button className="btn btn-primary" onClick={() => setStep("review")}>
                {t("onboard.review")}
                <Icon.chevronRight />
              </button>
            </div>
          </div>
        )}

        {step === "review" && (
          <div>
            <h2 className="card-title">{t("onboard.reviewTitle")}</h2>
            <p className="page-sub" style={{ marginBottom: 12 }}>
              {t("onboard.reviewSub")}
            </p>
            <div className="stat-grid" style={{ marginBottom: 16 }}>
              <div className="stat-card">
                <span className="stat-value">{t(`dept.${dept}`)}</span>
                <span className="stat-label">{t("profile.department")}</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{subjects.length}</span>
                <span className="stat-label">{t("common.subjectsCount")}</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{preview.length}</span>
                <span className="stat-label">{t("stats.totalClasses")}</span>
              </div>
            </div>
            {conflicts.length > 0 && (
              <div className="warn" role="alert">
                <b>{t("onboard.conflicts")}:</b>
                <ul style={{ marginInlineStart: 18, marginTop: 4 }}>
                  {conflicts.slice(0, 6).map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="views-list" style={{ maxHeight: 320, overflow: "auto" }}>
              {preview
                .slice()
                .sort((a, b) => a.day - b.day || a.start.localeCompare(b.start))
                .map((c) => (
                  <div key={c.id} className="view-item" style={{ padding: "8px 12px" }}>
                    <span className="name" style={{ fontWeight: 600 }}>
                      {subjectName(c.subject, t)}
                    </span>
                    <em style={{ fontStyle: "normal", color: "var(--soft)", fontSize: "0.76rem" }}>
                      {t(`dayAbbr.${c.day}`)} {fmtTime(c.start)}–{fmtTime(c.end)} · {c.room} ·{" "}
                      {c.instructor}
                    </em>
                  </div>
                ))}
              {preview.length === 0 && <p className="pop-sub">{t("timetable.empty.title")}</p>}
            </div>
            <div className="modal-actions" style={{ marginTop: 18 }}>
              <button className="btn" onClick={() => setStep("sessions")}>
                <Icon.chevronLeft />
                {t("common.back")}
              </button>
              <button className="btn btn-primary" onClick={() => setStep("done")}>
                {t("common.next")}
                <Icon.chevronRight />
              </button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div style={{ textAlign: "center", padding: "var(--sp-6) 0" }}>
            <div
              className="stat-icon"
              style={{ margin: "0 auto var(--sp-4)", width: 56, height: 56, color: "var(--success)" }}
            >
              <Icon.check size={28} />
            </div>
            <h2 className="page-title" style={{ fontSize: "1.5rem" }}>
              {t("onboard.ready")}
            </h2>
            <p className="page-sub" style={{ margin: "10px 0 22px" }}>
              {subjects.length} {t("common.subjectsCount")} · {preview.length}{" "}
              {t("stats.totalClasses").toLowerCase()}
            </p>
            <button className="btn btn-primary btn-lg" onClick={finish}>
              {t("onboard.goDashboard")}
              <Icon.chevronRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
