import { useEffect } from "react";
import { useT } from "../i18n";

interface Props {
  title: string;
  body: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({ title, body, confirmLabel, danger, onConfirm, onClose }: Props) {
  const t = useT();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="alertdialog" aria-modal="true" style={{ width: 440 }}>
        <h3>{title}</h3>
        <p className="body">{body}</p>
        <div className="modal-actions">
          <button className="btn" onClick={onClose}>
            {t("common.cancel")}
          </button>
          <button
            className={"btn " + (danger ? "btn-danger" : "btn-primary")}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel ?? t("common.confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}
