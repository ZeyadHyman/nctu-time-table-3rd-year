import { useRef, useState } from "react";
import { useStore } from "../store";
import { useToast } from "../toast";
import { Panel } from "./Panel";
import { buildExport, downloadJson, validateClasses, validateSavedViews } from "../lib/exportImport";

export function ViewsDataPanel({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const savedViews = useStore((s) => s.savedViews);
  const activeViewId = useStore((s) => s.activeViewId);
  const applyView = useStore((s) => s.applyView);
  const saveCurrentView = useStore((s) => s.saveCurrentView);
  const renameView = useStore((s) => s.renameView);
  const duplicateView = useStore((s) => s.duplicateView);
  const deleteView = useStore((s) => s.deleteView);
  const classes = useStore((s) => s.classes);
  const replaceAllClasses = useStore((s) => s.replaceAllClasses);
  const restoreSeed = useStore((s) => s.restoreSeed);
  const filters = useStore((s) => s.filters);
  const section = useStore((s) => s.section);
  const prefs = useStore((s) => s.prefs);
  const showToast = useToast((s) => s.show);

  const [name, setName] = useState("");
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmRestore, setConfirmRestore] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    downloadJson(
      `timetable-${new Date().toISOString().slice(0, 10)}.json`,
      buildExport(classes, savedViews),
    );
    showToast("Timetable exported as JSON.");
  };

  const handleImport = async (file: File) => {
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const result = validateClasses(json);
      if (!result.ok) {
        showToast("Import failed: " + result.error);
        return;
      }
      replaceAllClasses(result.classes);
      const views = validateSavedViews(json);
      if (views.length) {
        const existing = useStore.getState().savedViews;
        const merged = [...existing];
        views.forEach((v) => {
          if (!merged.some((x) => x.id === v.id)) merged.push(v);
        });
        useStore.setState({ savedViews: merged });
      }
      showToast(`Imported ${result.classes.length} classes.`);
    } catch {
      showToast("Import failed: invalid JSON file.");
    }
  };

  return (
    <Panel
      title="Saved views & data"
      hint={savedViews.length ? `${savedViews.length} saved` : "none yet"}
      open={open}
      onToggle={onToggle}
    >
      <div className="save-row">
        <input
          placeholder="Name this view (e.g. My Section 2)…"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          className="btn primary"
          disabled={!name.trim()}
          onClick={() => {
            saveCurrentView(name.trim());
            setName("");
            showToast("View saved.");
          }}
        >
          Save view
        </button>
      </div>

      {savedViews.length === 0 ? (
        <p style={{ color: "var(--soft)", fontSize: "0.85rem", marginTop: 12 }}>
          No saved views yet. Set your filters, section and customization, then save a view to
          switch between layouts instantly.
        </p>
      ) : (
        <div className="views-list">
          {savedViews.map((v) => (
            <div key={v.id} className={"view-item" + (v.id === activeViewId ? " active" : "")}>
              {renaming === v.id ? (
                <input
                  style={{ flex: 1 }}
                  value={renameVal}
                  onChange={(e) => setRenameVal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && renameVal.trim()) {
                      renameView(v.id, renameVal.trim());
                      setRenaming(null);
                      showToast("View renamed.");
                    }
                    if (e.key === "Escape") setRenaming(null);
                  }}
                  autoFocus
                />
              ) : (
                <button className="name" onClick={() => applyView(v.id)}>
                  {v.name}
                  {v.id === activeViewId ? " · active" : ""}
                </button>
              )}
              <div className="acts">
                <button
                  className="btn sm"
                  onClick={() => {
                    setRenaming(v.id);
                    setRenameVal(v.name);
                  }}
                >
                  Rename
                </button>
                <button
                  className="btn sm"
                  onClick={() => {
                    duplicateView(v.id);
                    showToast("View duplicated.");
                  }}
                >
                  Duplicate
                </button>
                {confirmDelete === v.id ? (
                  <button
                    className="btn sm danger"
                    onClick={() => {
                      deleteView(v.id);
                      setConfirmDelete(null);
                      showToast("View deleted.");
                    }}
                  >
                    Confirm delete
                  </button>
                ) : (
                  <button className="btn sm danger" onClick={() => setConfirmDelete(v.id)}>
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="panel-actions">
        <button className="btn" onClick={handleExport}>
          Export JSON
        </button>
        <button className="btn" onClick={() => fileRef.current?.click()}>
          Import JSON
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleImport(f);
            e.target.value = "";
          }}
        />
        {confirmRestore ? (
          <button
            className="btn danger"
            onClick={() => {
              restoreSeed();
              setConfirmRestore(false);
              showToast("Original timetable restored.");
            }}
          >
            Confirm restore
          </button>
        ) : (
          <button className="btn danger" onClick={() => setConfirmRestore(true)}>
            Restore original timetable
          </button>
        )}
      </div>
      <p style={{ fontSize: "0.74rem", color: "var(--soft)", marginTop: 10 }}>
        Edits and saved views are stored in your browser (localStorage) and survive refreshes.
        Export keeps a portable backup; restore resets classes only — saved views are never
        overwritten by editing. Current snapshot: {classes.length} classes · filters{" "}
        {JSON.stringify({ section, view: prefs.view }).slice(1, -1)}.
      </p>
    </Panel>
  );
}
