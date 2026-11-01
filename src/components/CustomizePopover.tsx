import { useMemo, useState } from "react";
import type { DayNum } from "../types";
import { DAYS } from "../types";
import { useStore } from "../store";
import { useT, subjectName } from "../i18n";
import { Icon } from "./Icon";

export function CustomizePopover({ onClose }: { onClose: () => void }) {
  const t = useT();
  const prefs = useStore((s) => s.prefs);
  const setPrefs = useStore((s) => s.setPrefs);
  const classes = useStore((s) => s.classes);
  const [instQ, setInstQ] = useState("");

  const subjects = useMemo(() => [...new Set(classes.map((c) => c.subject))].sort(), [classes]);
  const instructors = useMemo(
    () => [...new Set(classes.map((c) => c.instructor))].sort(),
    [classes],
  );
  const shownInst = instructors.filter((i) => i.toLowerCase().includes(instQ.toLowerCase()));

  const toggleHidden = (
    key: "hiddenSubjects" | "hiddenInstructors" | "hiddenDays",
    id: string | DayNum,
  ) => {
    const list = prefs[key] as (string | DayNum)[];
    setPrefs({
      [key]: list.includes(id) ? list.filter((x) => x !== id) : [...list, id],
    } as never);
  };

  const toggleField = (
    key:
      | "showInstructor"
      | "showRoom"
      | "showType"
      | "showSection"
      | "showTime"
      | "showCombined",
  ) => setPrefs({ [key]: !prefs[key] } as never);

  const moveDay = (idx: number, dir: -1 | 1) => {
    const order = [...prefs.dayOrder];
    const j = idx + dir;
    if (j < 0 || j >= order.length) return;
    [order[idx], order[j]] = [order[j], order[idx]];
    setPrefs({ dayOrder: order });
  };

  const fieldToggles: { key: Parameters<typeof toggleField>[0]; label: string }[] = [
    { key: "showInstructor", label: t("customize.instructorNames") },
    { key: "showRoom", label: t("customize.roomNumbers") },
    { key: "showType", label: t("customize.classTypes") },
    { key: "showSection", label: t("customize.sectionNumbers") },
    { key: "showTime", label: t("customize.times") },
    { key: "showCombined", label: t("customize.combinedLectures") },
  ];

  return (
    <div className="popover" role="dialog" aria-label={t("customize.title")}>
      <div className="pop-head">
        <div>
          <div className="pop-title">{t("customize.title")}</div>
          <div className="pop-sub">{t("customize.subtitle")}</div>
        </div>
        <button className="icon-btn" onClick={onClose} aria-label={t("common.close")}>
          <Icon.x />
        </button>
      </div>

      <div className="filter-grid">
        <div className="fgroup">
          <h4>{t("customize.cardFields")}</h4>
          <div className="opts">
            {fieldToggles.map((f) => (
              <button
                key={f.key}
                className="opt"
                aria-pressed={prefs[f.key]}
                onClick={() => toggleField(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="fgroup">
          <h4>
            {t("customize.subjectsShown")}
            <span className="mini">
              <button onClick={() => setPrefs({ hiddenSubjects: [] })}>
                {t("customize.showAll")}
              </button>
              <button
                onClick={() =>
                  setPrefs({
                    hiddenSubjects: subjects.filter((s) => !prefs.hiddenSubjects.includes(s)),
                  })
                }
              >
                {t("customize.hideAll")}
              </button>
            </span>
          </h4>
          <div className="optlist">
            {subjects.map((s) => (
              <button
                key={s}
                className="opt"
                aria-pressed={!prefs.hiddenSubjects.includes(s)}
                onClick={() => toggleHidden("hiddenSubjects", s)}
              >
                {subjectName(s, t)}
              </button>
            ))}
          </div>
        </div>

        <div className="fgroup">
          <h4>
            {t("customize.instructorsShown")}
            <span className="mini">
              <button onClick={() => setPrefs({ hiddenInstructors: [] })}>
                {t("customize.showAll")}
              </button>
            </span>
          </h4>
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
                aria-pressed={!prefs.hiddenInstructors.includes(i)}
                onClick={() => toggleHidden("hiddenInstructors", i)}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        <div className="fgroup">
          <h4>{t("customize.daysShown")}</h4>
          <div className="opts">
            {DAYS.map((d) => (
              <button
                key={d.num}
                className="opt"
                aria-pressed={!prefs.hiddenDays.includes(d.num)}
                onClick={() => toggleHidden("hiddenDays", d.num)}
              >
                {t(`dayAbbr.${d.num}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="fgroup">
          <h4>{t("customize.dayOrder")}</h4>
          <div className="opts" style={{ flexDirection: "column", alignItems: "stretch" }}>
            {prefs.dayOrder.map((d, idx) => (
              <div key={d} className="view-item" style={{ padding: "6px 10px" }}>
                <span className="name" style={{ fontWeight: 600 }}>
                  {t(`days.${d}`)}
                </span>
                <div className="acts">
                  <button
                    className="icon-btn"
                    onClick={() => moveDay(idx, -1)}
                    aria-label={t("customize.moveUp")}
                    disabled={idx === 0}
                  >
                    <Icon.arrowUp />
                  </button>
                  <button
                    className="icon-btn"
                    onClick={() => moveDay(idx, 1)}
                    aria-label={t("customize.moveDown")}
                    disabled={idx === prefs.dayOrder.length - 1}
                  >
                    <Icon.arrowDown />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="fgroup">
          <h4>{t("customize.sortBy")}</h4>
          <div className="opts">
            <button
              className="opt"
              aria-pressed={prefs.sortBy === "time"}
              onClick={() => setPrefs({ sortBy: "time" })}
            >
              {t("customize.sortTime")}
            </button>
            <button
              className="opt"
              aria-pressed={prefs.sortBy === "subject"}
              onClick={() => setPrefs({ sortBy: "subject" })}
            >
              {t("customize.sortSubject")}
            </button>
          </div>
        </div>
      </div>

      <div className="panel-actions">
        <button
          className="btn"
          onClick={() =>
            setPrefs({
              hiddenSubjects: [],
              hiddenInstructors: [],
              hiddenDays: [],
              showInstructor: true,
              showRoom: true,
              showType: true,
              showSection: true,
              showTime: true,
              showCombined: true,
              sortBy: "time",
              dayOrder: [6, 0, 1, 2, 3],
            })
          }
        >
          <Icon.refresh />
          {t("customize.reset")}
        </button>
        <button
          className="btn btn-primary"
          style={{ marginInlineStart: "auto" }}
          onClick={onClose}
        >
          {t("common.close")}
        </button>
      </div>
    </div>
  );
}
