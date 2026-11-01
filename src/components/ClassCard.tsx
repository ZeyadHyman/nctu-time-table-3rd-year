import type { ClassEntry } from "../types";
import { SUBJECTS } from "../types";
import { fmtDur, fmtTime, isLive, kindLabel, sectionLabel } from "../lib/filtering";
import { useStore } from "../store";

export function ClassCard({
  c,
  compact,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  c: ClassEntry;
  compact?: boolean;
  onEdit?: (c: ClassEntry) => void;
  onDuplicate?: (c: ClassEntry) => void;
  onDelete?: (c: ClassEntry) => void;
}) {
  const prefs = useStore((s) => s.prefs);
  const editMode = useStore((s) => s.editMode);
  const subj = SUBJECTS[c.subject];
  const startM = toMin(c.start);
  const endM = toMin(c.end);

  const tagCls =
    c.type === "combined"
      ? ""
      : c.type === "individual-section" || c.type === "lecture-section"
        ? " sec"
        : "";
  const net = c.type === "network-section" || c.sections.includes("network");

  return (
    <div
      className={
        "cls" +
        (isLive(c) ? " live" : "") +
        (c.type === "combined" ? " combined" : "") +
        (compact ? " n" : "")
      }
      style={{ ["--c" as string]: subj?.color ?? "var(--sun)" }}
      title={c.notes || undefined}
      draggable={editMode}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/class-id", c.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      onClick={() => editMode && onEdit?.(c)}
    >
      <div>
        <b>{subj?.name ?? c.subject}</b>
        {prefs.showInstructor && <p className="who">{c.instructor}</p>}
      </div>
      <div className="foot">
        <div className="l">
          {prefs.showType &&
            !(prefs.showSection && c.type === "individual-section" && c.sections.length > 0) && (
              <span className={"tag" + tagCls + (net && c.type === "network-section" ? " net" : "")}>
                {kindLabel(c)}
              </span>
            )}
          {prefs.showSection &&
            c.type !== "combined" &&
            c.sections.length > 0 &&
            !(c.type === "network-section" && c.sections.length === 1 && c.sections[0] === "network") && (
              <span className="tag sec">{sectionLabel(c)}</span>
            )}
          {prefs.showTime && <span className="tm">{fmtTime(c.start)} – {fmtTime(c.end)}</span>}
          <span className="dur">{fmtDur(endM - startM)}</span>
          {c.notes && <span className="notes-badge" title={c.notes}>note</span>}
        </div>
        {prefs.showRoom && <span className="room">{c.room}</span>}
      </div>
      {editMode && (
        <div
          style={{
            position: "absolute",
            top: 6,
            right: 6,
            display: "flex",
            gap: 4,
            zIndex: 2,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="btn sm" onClick={() => onEdit?.(c)} title="Edit">
            ✎
          </button>
          <button className="btn sm" onClick={() => onDuplicate?.(c)} title="Duplicate">
            ⧉
          </button>
          <button className="btn sm danger" onClick={() => onDelete?.(c)} title="Delete">
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

function toMin(s: string) {
  const [h, m] = s.split(":").map(Number);
  return h * 60 + m;
}
