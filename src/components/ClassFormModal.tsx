import { useMemo, useState } from "react";
import type { ClassEntry, ClassKind, DayNum, SectionId } from "../types";
import { DAYS, KIND_LABELS, SECTION_IDS, SECTION_LABELS, SUBJECTS } from "../types";
import { classTypes, fmtDur, mins } from "../lib/filtering";
import { useStore } from "../store";

type Mode = "add" | "edit" | "duplicate";

export function ClassFormModal({
  mode,
  entry,
  onClose,
  onSaved,
}: {
  mode: Mode;
  entry: ClassEntry | null;
  onClose: () => void;
  onSaved: (msg: string) => void;
}) {
  const classes = useStore((s) => s.classes);
  const addClass = useStore((s) => s.addClass);
  const updateClass = useStore((s) => s.updateClass);
  const duplicateClass = useStore((s) => s.duplicateClass);

  const [subject, setSubject] = useState(entry?.subject ?? Object.keys(SUBJECTS)[0]);
  const [instructor, setInstructor] = useState(entry?.instructor ?? "");
  const [room, setRoom] = useState(entry?.room ?? "");
  const [day, setDay] = useState<DayNum>(entry?.day ?? 6);
  const [start, setStart] = useState(entry?.start ?? "09:00");
  const [end, setEnd] = useState(entry?.end ?? "10:20");
  const [type, setType] = useState<ClassKind>(entry?.type ?? "combined");
  const [sections, setSections] = useState<SectionId[]>(entry?.sections ?? []);
  const [notes, setNotes] = useState(entry?.notes ?? "");
  const [touched, setTouched] = useState(false);
  const [ackOverlap, setAckOverlap] = useState(false);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!instructor.trim()) e.instructor = "Instructor is required.";
    if (!room.trim()) e.room = "Room is required.";
    if (!start) e.start = "Start time is required.";
    if (!end) e.end = "End time is required.";
    if (start && end && end <= start) e.end = "End time must be after start time.";
    if (
      (type === "individual-section" || type === "network-section") &&
      sections.length === 0
    )
      e.sections = "Pick at least one section.";
    return e;
  }, [instructor, room, start, end, type, sections]);

  const overlaps = useMemo(() => {
    if (errors.start || errors.end) return [];
    const cand: ClassEntry = {
      id: entry?.id ?? "__new__",
      subject,
      instructor,
      room,
      day,
      start,
      end,
      type,
      sections,
    };
    return classes.filter(
      (c) => c.id !== entry?.id && c.day === day && mins(c.start) < mins(end) && mins(start) < mins(c.end),
    );
  }, [classes, subject, instructor, room, day, start, end, type, sections, entry, errors]);

  const valid = Object.keys(errors).length === 0;
  const needsAck = overlaps.length > 0 && !ackOverlap;

  const submit = () => {
    setTouched(true);
    if (!valid) return;
    if (needsAck) return;
    const payload = {
      subject,
      instructor: instructor.trim(),
      room: room.trim().toUpperCase(),
      day,
      start,
      end,
      type,
      sections: type === "combined" ? SECTION_IDS : sections,
      notes: notes.trim() || undefined,
    };
    if (mode === "add") {
      addClass(payload);
      onSaved("Class added.");
    } else if (mode === "edit" && entry) {
      updateClass(entry.id, payload);
      onSaved("Class updated.");
    } else if (mode === "duplicate" && entry) {
      duplicateClass(entry.id, payload);
      onSaved("Class duplicated.");
    }
    onClose();
  };

  const title =
    mode === "add" ? "Add Class" : mode === "edit" ? "Edit Class" : "Duplicate Class";

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <h3>{title}</h3>
        <div className="form-grid">
          <label className="field full">
            <span>Subject</span>
            <select value={subject} onChange={(e) => setSubject(e.target.value)}>
              {Object.entries(SUBJECTS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Instructor</span>
            <input
              value={instructor}
              onChange={(e) => setInstructor(e.target.value)}
              placeholder="e.g. Eng. Norhan"
            />
            {touched && errors.instructor && <span className="err">{errors.instructor}</span>}
          </label>
          <label className="field">
            <span>Room</span>
            <input
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="e.g. B303"
            />
            {touched && errors.room && <span className="err">{errors.room}</span>}
          </label>
          <label className="field">
            <span>Day</span>
            <select value={day} onChange={(e) => setDay(Number(e.target.value) as DayNum)}>
              {[6, 0, 1, 2, 3, 4, 5].map((d) => (
                <option key={d} value={d}>
                  {DAYS.find((x) => x.num === d)!.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Class type</span>
            <select
              value={type}
              onChange={(e) => {
                const t = e.target.value as ClassKind;
                setType(t);
                if (t === "combined") setSections([...SECTION_IDS]);
                else if (t === "practical" || t === "lecture-section") setSections([]);
              }}
            >
              {classTypes.map((t) => (
                <option key={t} value={t}>
                  {KIND_LABELS[t]}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Start time</span>
            <input type="time" value={start} onChange={(e) => setStart(e.target.value)} />
            {touched && errors.start && <span className="err">{errors.start}</span>}
          </label>
          <label className="field">
            <span>End time</span>
            <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
            {touched && errors.end && <span className="err">{errors.end}</span>}
          </label>
          <div className="field full">
            <span>Sections</span>
            <div className="checks">
              {SECTION_IDS.map((s) => (
                <label key={s}>
                  <input
                    type="checkbox"
                    checked={sections.includes(s)}
                    onChange={() =>
                      setSections((prev) =>
                        prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
                      )
                    }
                  />
                  {SECTION_LABELS[s]}
                </label>
              ))}
            </div>
            {touched && errors.sections && <span className="err">{errors.sections}</span>}
            <span style={{ fontSize: "0.72rem", color: "var(--soft)", textTransform: "none", letterSpacing: 0, fontWeight: 400 }}>
              Combined lectures cover all sections. Practicals / Lecture-Section may stay unassigned.
            </span>
          </div>
          <label className="field full">
            <span>Notes (optional)</span>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything worth remembering…"
            />
          </label>
        </div>
        {overlaps.length > 0 && (
          <div className="warn">
            <b>Overlap warning:</b> this class overlaps {overlaps.length} existing{" "}
            {overlaps.length === 1 ? "class" : "classes"} (
            {overlaps
              .slice(0, 3)
              .map((c) => `${SUBJECTS[c.subject]?.name} · ${c.room}`)
              .join(", ")}
            {overlaps.length > 3 ? "…" : ""}). Different sections may meet simultaneously — save
            anyway?
            {!ackOverlap && (
              <label style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8, fontSize: "0.8rem" }}>
                <input type="checkbox" checked={ackOverlap} onChange={(e) => setAckOverlap(e.target.checked)} />
                Yes, keep this overlap
              </label>
            )}
          </div>
        )}
        <div className="modal-actions">
          <span style={{ marginRight: "auto", fontSize: "0.78rem", color: "var(--soft)", alignSelf: "center" }}>
            {start && end && end > start ? `Duration ${fmtDur(mins(end) - mins(start))}` : ""}
          </span>
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn primary" onClick={submit}>
            {mode === "edit" ? "Save changes" : "Add to timetable"}
          </button>
        </div>
      </div>
    </div>
  );
}
