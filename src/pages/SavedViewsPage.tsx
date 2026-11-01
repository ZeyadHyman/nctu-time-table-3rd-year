import { useState } from "react";
import { useStore } from "../store";
import { useT } from "../i18n";
import { toast } from "../toast";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Icon } from "../components/Icon";

type ModalState =
  | { kind: "rename"; id: string; name: string }
  | { kind: "delete"; id: string }
  | { kind: "clearAll" }
  | null;

export function SavedViewsPage({ go }: { go: (route: string) => void }) {
  const t = useT();
  const savedViews = useStore((s) => s.savedViews);
  const activeViewId = useStore((s) => s.activeViewId);
  const saveCurrentView = useStore((s) => s.saveCurrentView);
  const applyView = useStore((s) => s.applyView);
  const renameView = useStore((s) => s.renameView);
  const duplicateView = useStore((s) => s.duplicateView);
  const deleteView = useStore((s) => s.deleteView);
  const clearViews = useStore((s) => s.clearViews);

  const [name, setName] = useState("");
  const [modal, setModal] = useState<ModalState>(null);

  function save() {
    const n = name.trim();
    if (!n) return;
    saveCurrentView(n);
    setName("");
    toast(t("views.viewSaved"));
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1 className="page-title">{t("views.title")}</h1>
          <p className="page-sub">{t("views.subtitle")}</p>
        </div>
        <div className="page-meta">
          <span className="meta-pill">
            <Icon.layers size={14} />
            <b>{savedViews.length}</b>
          </span>
          {savedViews.length > 0 && (
            <button className="btn btn-sm btn-danger" onClick={() => setModal({ kind: "clearAll" })}>
              <Icon.trashAll size={14} />
              {t("confirm.clearViewsTitle").replace("?", "")}
            </button>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-title">{t("views.saveCurrent")}</div>
        <p className="page-sub" style={{ marginBottom: 12 }}>
          {t("edit.viewHint")}
        </p>
        <div className="save-row">
          <input
            value={name}
            placeholder={t("views.placeholder")}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && save()}
          />
          <button className="btn btn-primary" onClick={save} disabled={!name.trim()}>
            <Icon.save size={15} />
            {t("views.save")}
          </button>
        </div>

        {savedViews.length === 0 ? (
          <div className="empty" style={{ marginTop: 20 }}>
            <b>{t("views.title")}</b>
            <p>{t("views.empty")}</p>
          </div>
        ) : (
          <div className="views-list">
            {savedViews.map((v) => (
              <div
                key={v.id}
                className={"view-item" + (activeViewId === v.id ? " active" : "")}
              >
                <button
                  className="name"
                  onClick={() => {
                    applyView(v.id);
                    toast(t("views.viewApplied"));
                    go("#/timetable");
                  }}
                  title={t("views.openView")}
                >
                  {v.name}
                </button>
                {activeViewId === v.id && (
                  <span className="badge badge-dot" style={{ borderColor: "var(--accent)" }}>
                    {t("common.active")}
                  </span>
                )}
                <div className="acts">
                  <button
                    className="btn btn-sm"
                    onClick={() => {
                      applyView(v.id);
                      toast(t("views.viewApplied"));
                      go("#/timetable");
                    }}
                  >
                    <Icon.play size={13} />
                    {t("common.apply")}
                  </button>
                  <button
                    className="btn btn-sm"
                    onClick={() => setModal({ kind: "rename", id: v.id, name: v.name })}
                  >
                    <Icon.pencil size={13} />
                    {t("common.rename")}
                  </button>
                  <button
                    className="btn btn-sm"
                    onClick={() => {
                      duplicateView(v.id);
                      toast(t("views.viewDuplicated"));
                    }}
                  >
                    <Icon.copy size={13} />
                    {t("common.duplicate")}
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => setModal({ kind: "delete", id: v.id })}
                  >
                    <Icon.trash size={13} />
                    {t("common.delete")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal?.kind === "rename" && (
        <RenameModal
          initial={modal.name}
          onClose={() => setModal(null)}
          onConfirm={(n) => {
            renameView(modal.id, n);
            toast(t("views.viewRenamed"));
          }}
        />
      )}

      {modal?.kind === "delete" && (
        <ConfirmDialog
          title={t("views.confirmDelete")}
          body={t("confirm.clearViewsBody")}
          confirmLabel={t("common.delete")}
          danger
          onConfirm={() => {
            deleteView(modal.id);
            toast(t("views.viewDeleted"));
          }}
          onClose={() => setModal(null)}
        />
      )}

      {modal?.kind === "clearAll" && (
        <ConfirmDialog
          title={t("confirm.clearViewsTitle")}
          body={t("confirm.clearViewsBody")}
          confirmLabel={t("common.delete")}
          danger
          onConfirm={() => {
            clearViews();
            toast(t("data.cleared"));
          }}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

function RenameModal({
  initial,
  onConfirm,
  onClose,
}: {
  initial: string;
  onConfirm: (name: string) => void;
  onClose: () => void;
}) {
  const t = useT();
  const [name, setName] = useState(initial);
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" style={{ width: 420 }}>
        <h3>{t("common.rename")}</h3>
        <label className="field">
          <span>{t("common.name")}</span>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && name.trim()) {
                onConfirm(name.trim());
                onClose();
              }
            }}
          />
        </label>
        <div className="modal-actions">
          <button className="btn" onClick={onClose}>
            {t("common.cancel")}
          </button>
          <button
            className="btn btn-primary"
            disabled={!name.trim()}
            onClick={() => {
              onConfirm(name.trim());
              onClose();
            }}
          >
            {t("common.save")}
          </button>
        </div>
      </div>
    </div>
  );
}
