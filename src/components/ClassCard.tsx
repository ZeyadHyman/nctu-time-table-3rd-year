import type { ClassEntry } from "../types";
import { fmtDur, fmtTime, isLive, subjectColor } from "../lib/filtering";
import { useStore } from "../store";
import { useT, subjectName, classSectionLabel } from "../i18n";
import { Icon } from "./Icon";

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
  const settings = useStore((s) => s.settings);
  const editMode = useStore((s) => s.editMode);
  const t = useT();
  const startM = mins(c.start);
  const endM = mins(c.end);
  const color = subjectColor(c.subject, settings.subjectColors);

  const showSectionTag =
    prefs.showSection &&
    c.type !== "combined" &&
    c.sections.length > 0 &&
    !(
      c.type === "network-section" &&
      c.sections.length === 1 &&
      c.sections[0] === "network"
    );

  return (
    <div
      className={
        "cls" +
        (isLive(c) ? " live" : "") +
        (c.type === "combined" ? " combined" : "") +
        (compact ? " n" : "")
      }
      style={{ ["--c" as string]: color }}
      title={c.notes || undefined}
      draggable={editMode}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/class-id", c.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      onClick={() => editMode && onEdit?.(c)}
    >
      <div>
        <b className="subj">{subjectName(c.subject, t)}</b>
        {prefs.showInstructor && <p className="who">{c.instructor}</p>}
      </div>
      <div className="foot">
        <div className="l">
          {prefs.showType && <span className="badge badge-solid">{t(`kinds.${c.type}`)}</span>}
          {showSectionTag && (
            <span className="badge badge-outline">{classSectionLabel(c, t)}</span>
          )}
          {prefs.showTime && (
            <span className="tm">
              {fmtTime(c.start)} – {fmtTime(c.end)}
            </span>
          )}
          <span className="dur">{fmtDur(endM - startM)}</span>
          {c.notes && (
            <span className="notes-badge" title={c.notes}>
              {t("form.notes").split(" ")[0]}
            </span>
          )}
        </div>
        {prefs.showRoom && <span className="room-badge">{c.room}</span>}
      </div>
      {editMode && (
        <>
          <span className="drag-handle" aria-hidden>
            <Icon.grip />
          </span>
          <div className="cls-actions" onClick={(e) => e.stopPropagation()}>
            <button
              className="icon-btn"
              title={t("common.edit")}
              aria-label={t("common.edit")}
              onClick={() => onEdit?.(c)}
            >
              <Icon.pencil />
            </button>
            <button
              className="icon-btn"
              title={t("common.duplicate")}
              aria-label={t("common.duplicate")}
              onClick={() => onDuplicate?.(c)}
            >
              <Icon.copy />
            </button>
            <button
              className="icon-btn danger"
              title={t("common.delete")}
              aria-label={t("common.delete")}
              onClick={() => onDelete?.(c)}
            >
              <Icon.trash />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function mins(s: string) {
  const [h, m] = s.split(":").map(Number);
  return h * 60 + m;
}
