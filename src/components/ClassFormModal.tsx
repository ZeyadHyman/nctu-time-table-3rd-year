import { useEffect, useState } from "react";
import type { ClassEntry, DayNum, Department, SectionId } from "../types";
import { DAYS, SECTION_IDS, SUBJECTS, DEFAULT_DEPT } from "../types";
import { classTypes, findOverlapsSafe, mins } from "../lib/formUtils";
import { useStore } from "../store";
import { useT } from "../i18n";
import { Icon } from "./Icon";

interface Props {
  initial?: ClassEntry | null;
  onClose: () => void;
  onSaved?: (c: ClassEntry) => void;
}

interface FormState {
  subject: string;
  instructor: string;
  room: string;
  day: DayNum;
  start: string;
  end: string;
  type: ClassEntry["type"];
  sections: SectionId[];
  dept: Department;
  notes: string;
}

export function ClassFormModal({ initial, onClose, onSaved }: Props) {
  const t = useT();
  const addClass = useStore((s) => s.addClass);
  const updateClass = useStore((s) => s.updateClass);
  const classes = useStore((s) => s.classes);

  const [f, setF] = useState<FormState>(() =>
    initial
      ? {
          subject: initial.subject,
          instructor: initial.instructor,
          room: initial.room,
          day: initial.day,
          start: initial.start,
          end: initial.end,
          type: initial.type,
          sections: [...initial.sections],
          dept: initial.dept ?? DEFAULT_DEPT[initial.subject] ?? "both",
          notes: initial.notes ?? "",
        }
      : {
          subject: Object.keys(SUBJECTS)[0],
          instructor: "",
          room: "",
          day: 6,
          start: "09:00",
          end: "10:20",
          type: "practical",
          sections: ["2"],
          dept: DEFAULT_DEPT[Object.keys(SUBJECTS)[0]] ?? "both",
          notes: "",
        },
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [ackOverlap, setAckOverlap] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setF((p) => ({ ...p, [k]: v }));

  const toggleSection = (id: SectionId) =>
    setF((p) => ({
      ...p,
      sections: p.sections.includes(id)
        ? p.sections.filter((s) => s !== id)
        : [...p.sections, id],
    }));

  const overlaps = findOverlapsSafe(classes, f, initial?.id);
  const showOverlapWarn = overlaps.length > 0 && !ackOverlap;

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!f.instructor.trim()) e.instructor = t("form.errInstructor");
    if (!f.room.trim()) e.room = t("form.errRoom");
    if (!f.start) e.start = t("form.errStart");
    if (!f.end) e.end = t("form.errEnd");
    if (f.start && f.end && f.end <= f.start) e.end = t("form.errEndAfter");
    if (f.type !== "combined" && f.sections.length === 0)
      e.sections = t("form.errSections");
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function submit(force = false) {
    if (!validate()) return;
    if (overlaps.length > 0 && !force && !ackOverlap) return;
    const payload = {
      subject: f.subject,
      instructor: f.instructor.trim(),
      room: f.room.trim(),
      day: f.day,
      start: f.start,
      end: f.end,
      type: f.type,
      sections: f.type === "combined" ? [] : f.sections,
      dept: f.dept,
      notes: f.notes.trim() || undefined,
    };
    if (initial) {
      updateClass(initial.id, payload);
      onSaved?.({ ...initial, ...payload });
    } else {
      const created = addClass(payload);
      onSaved?.(created);
    }
    onClose();
  }

  const dur = f.start && f.end && f.end > f.start ? mins(f.end) - mins(f.start) : 0;

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true">
        <h3>{initial ? t("form.editTitle") : t("form.addTitle")}</h3>

        <div className="form-grid">
          <label className="field full">
            <span>{t("form.subject")}</span>
            <select value={f.subject} onChange={(e) => set("subject", e.target.value)}>
              {Object.entries(SUBJECTS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>{t("form.instructor")}</span>
            <input
              value={f.instructor}
              placeholder={t("form.instructorPlaceholder")}
              onChange={(e) => set("instructor", e.target.value)}
            />
            {errors.instructor && <span className="err">{errors.instructor}</span>}
          </label>

          <label className="field">
            <span>{t("form.room")}</span>
            <input
              value={f.room}
              placeholder={t("form.roomPlaceholder")}
              onChange={(e) => set("room", e.target.value)}
            />
            {errors.room && <span className="err">{errors.room}</span>}
          </label>

          <label className="field">
            <span>{t("form.day")}</span>
            <select
              value={f.day}
              onChange={(e) => set("day", Number(e.target.value) as DayNum)}
            >
              {DAYS.map((d) => (
                <option key={d.num} value={d.num}>
                  {t(`days.${d.num}`)}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>{t("form.classType")}</span>
            <select
              value={f.type}
              onChange={(e) => {
                const type = e.target.value as ClassEntry["type"];
                set("type", type);
                if (type === "combined") set("sections", []);
              }}
            >
              {classTypes.map((k) => (
                <option key={k} value={k}>
                  {t(`kinds.${k}`)}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>{t("profile.department")}</span>
            <select value={f.dept} onChange={(e) => set("dept", e.target.value as Department)}>
              <option value="software">{t("dept.software")}</option>
              <option value="network">{t("dept.network")}</option>
              <option value="both">{t("dept.both")}</option>
            </select>
          </label>

          <label className="field">
            <span>{t("form.startTime")}</span>
            <input
              type="time"
              value={f.start}
              onChange={(e) => set("start", e.target.value)}
            />
            {errors.start && <span className="err">{errors.start}</span>}
          </label>

          <label className="field">
            <span>{t("form.endTime")}</span>
            <input type="time" value={f.end} onChange={(e) => set("end", e.target.value)} />
            {errors.end && <span className="err">{errors.end}</span>}
          </label>

          {f.type !== "combined" && (
            <div className="field full">
              <span>{t("form.sections")}</span>
              <div className="checks">
                {SECTION_IDS.map((id) => (
                  <label key={id}>
                    <input
                      type="checkbox"
                      checked={f.sections.includes(id)}
                      onChange={() => toggleSection(id)}
                    />
                    {t(`sections.${id}`)}
                  </label>
                ))}
              </div>
              <span className="hint">{t("form.sectionsHint")}</span>
              {errors.sections && <span className="err">{errors.sections}</span>}
            </div>
          )}

          <label className="field full">
            <span>{t("form.notes")}</span>
            <textarea
              rows={2}
              value={f.notes}
              placeholder={t("form.notesPlaceholder")}
              onChange={(e) => set("notes", e.target.value)}
            />
          </label>
        </div>

        {showOverlapWarn && (
          <div className="warn" role="alert">
            <b>{t("form.overlapTitle")}</b>{" "}
            {t("form.overlapBody", { n: overlaps.length })}
          </div>
        )}

        <div className="modal-actions">
          {dur > 0 && (
            <span className="duration-note">{t("form.duration", { dur: fmtDurLocal(dur) })}</span>
          )}
          <button className="btn" onClick={onClose}>
            {t("common.cancel")}
          </button>
          {showOverlapWarn ? (
            <button className="btn btn-primary" onClick={() => { setAckOverlap(true); submit(true); }}>
              {t("form.overlapAck")}
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => submit()}>
              <Icon.save />
              {initial ? t("form.saveSubmit") : t("form.addSubmit")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function fmtDurLocal(m: number) {
  const h = Math.floor(m / 60);
  const r = m % 60;
  return h ? `${h}h${r ? " " + r + "m" : ""}` : `${r}m`;
}
