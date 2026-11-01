import { useRef, useState } from "react";
import { buildExport, downloadJson, validateClasses, validateSavedViews } from "../lib/exportImport";
import { useStore } from "../store";
import { useT } from "../i18n";
import { toast } from "../toast";
import { Icon } from "./Icon";

interface Props {
  gridRef: React.RefObject<HTMLDivElement>;
  view: "grid" | "list";
}

export function ExportMenu({ gridRef, view }: Props) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const classes = useStore((s) => s.classes);
  const savedViews = useStore((s) => s.savedViews);
  const replaceAllClasses = useStore((s) => s.replaceAllClasses);
  const fileRef = useRef<HTMLInputElement>(null);

  async function exportPng() {
    setOpen(false);
    if (view !== "grid") {
      toast(t("toast.gridOnly"), "error");
      return;
    }
    const node = gridRef.current;
    if (!node) return;
    try {
      const { exportNodePng } = await import("../lib/image");
      await exportNodePng(node, `timetable-${new Date().toISOString().slice(0, 10)}.png`);
      toast(t("toast.imageExported"));
    } catch {
      toast(t("toast.imageFailed"), "error");
    }
  }

  function exportJson() {
    setOpen(false);
    downloadJson(
      `timetable-${new Date().toISOString().slice(0, 10)}.json`,
      buildExport(classes, savedViews),
    );
    toast(t("data.exported"));
  }

  function onImportFile(file: File) {
    setOpen(false);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        const res = validateClasses(data);
        if (!res.ok) {
          toast(t("data.importFailed", { error: res.error }), "error");
          return;
        }
        replaceAllClasses(res.classes);
        toast(t("data.imported", { n: res.classes.length }));
      } catch {
        toast(t("data.importInvalid"), "error");
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="popover-wrap">
      <button
        className={"btn" + (open ? " btn-on" : "")}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <Icon.download />
        <span>{t("common.export")}</span>
      </button>
      {open && (
        <>
          <div className="overlay" style={{ background: "transparent", zIndex: 55 }} onClick={() => setOpen(false)} />
          <div className="menu" role="menu">
            <button className="menu-item" role="menuitem" onClick={exportPng}>
              <Icon.image /> {t("common.png")}
            </button>
            <button
              className="menu-item"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                window.print();
              }}
            >
              <Icon.printer /> {t("common.pdf")}
            </button>
            <div className="menu-sep" />
            <button className="menu-item" role="menuitem" onClick={exportJson}>
              <Icon.fileJson /> {t("common.json")}
            </button>
            <button className="menu-item" role="menuitem" onClick={() => fileRef.current?.click()}>
              <Icon.upload /> {t("common.import")}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onImportFile(f);
                e.target.value = "";
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}

export { validateSavedViews };
