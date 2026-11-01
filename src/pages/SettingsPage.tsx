import { useRef, useState } from "react";
import type { DayNum, SectionView, Settings } from "../types";
import { DAYS, SECTION_IDS, SUBJECTS } from "../types";
import { buildExport, downloadJson, validateClasses, validateSavedViews } from "../lib/exportImport";
import { useStore } from "../store";
import { useT } from "../i18n";
import { toast } from "../toast";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Icon } from "../components/Icon";

type Tab = "general" | "appearance" | "timetable" | "data" | "a11y";
type ModalState =
  | { kind: "restore" }
  | { kind: "clearViews" }
  | { kind: "resetSettings" }
  | null;

const ACCENTS = ["#ffd23a", "#5d86ff", "#4fe0a0", "#ff5a3c", "#b39cff", "#ff9f45", "#5fd4e6", "#ff9fd0"];

export function SettingsPage() {
  const t = useT();
  const settings = useStore((s) => s.settings);
  const setSettings = useStore((s) => s.setSettings);
  const resetSettings = useStore((s) => s.resetSettings);
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);
  const prefs = useStore((s) => s.prefs);
  const setPrefs = useStore((s) => s.setPrefs);
  const filters = useStore((s) => s.filters);
  const setFilters = useStore((s) => s.setFilters);
  const resetFilters = useStore((s) => s.resetFilters);
  const classes = useStore((s) => s.classes);
  const savedViews = useStore((s) => s.savedViews);
  const replaceAllClasses = useStore((s) => s.replaceAllClasses);
  const restoreSeed = useStore((s) => s.restoreSeed);
  const clearViews = useStore((s) => s.clearViews);

  const [tab, setTab] = useState<Tab>("general");
  const [modal, setModal] = useState<ModalState>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setSettings({ [k]: v } as never);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "general", label: t("settings.general"), icon: <Icon.sliders size={15} /> },
    { id: "appearance", label: t("settings.appearance"), icon: <Icon.palette size={15} /> },
    { id: "timetable", label: t("settings.timetable"), icon: <Icon.calendar size={15} /> },
    { id: "data", label: t("settings.data"), icon: <Icon.fileJson size={15} /> },
    { id: "a11y", label: t("settings.accessibility"), icon: <Icon.zap size={15} /> },
  ];

  function onImport(file: File) {
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
        const views = validateSavedViews(data);
        if (views.length) {
          useStore.setState({ savedViews: views });
        }
        toast(t("data.imported", { n: res.classes.length }));
      } catch {
        toast(t("data.importInvalid"), "error");
      }
    };
    reader.readAsText(file);
  }

  const activeFilterCount =
    filters.days.length +
    filters.subjects.length +
    filters.sections.length +
    filters.instructors.length +
    filters.rooms.length +
    filters.types.length +
    (filters.time.mode !== "all" ? 1 : 0) +
    (filters.search.trim() ? 1 : 0);

  return (
    <div>
      <div className="page-head">
        <div>
          <h1 className="page-title">{t("settings.title")}</h1>
          <p className="page-sub">{t("settings.subtitle")}</p>
        </div>
        <div className="page-meta">
          <span className="meta-pill">{t("settings.savedInstantly")}</span>
        </div>
      </div>

      <div className="settings-tabs" role="tablist">
        {tabs.map((tb) => (
          <button
            key={tb.id}
            role="tab"
            className="settings-tab"
            aria-selected={tab === tb.id}
            onClick={() => setTab(tb.id)}
          >
            <span style={{ display: "inline-flex", verticalAlign: "-2px", marginInlineEnd: 6 }}>
              {tb.icon}
            </span>
            {tb.label}
          </button>
        ))}
      </div>

      {tab === "general" && (
        <div className="set-group">
          <SettingRow
            title={t("settings.language")}
            desc={t("settings.languageDesc")}
            control={
              <div className="seg">
                <button aria-pressed={settings.language === "en"} onClick={() => set("language", "en")}>
                  {t("lang.en")}
                </button>
                <button aria-pressed={settings.language === "ar"} onClick={() => set("language", "ar")}>
                  {t("lang.ar")}
                </button>
              </div>
            }
          />
          <SettingRow
            title={t("settings.theme")}
            desc={t("settings.themeSystem")}
            control={
              <div className="seg">
                <button aria-pressed={theme === null} onClick={() => setTheme(null)}>
                  <Icon.globe size={14} />
                </button>
                <button aria-pressed={theme === "dark"} onClick={() => setTheme("dark")}>
                  <Icon.moon size={14} /> {t("settings.themeDark")}
                </button>
                <button aria-pressed={theme === "light"} onClick={() => setTheme("light")}>
                  <Icon.sun size={14} /> {t("settings.themeLight")}
                </button>
              </div>
            }
          />
          <SettingRow
            title={t("settings.timeFormat")}
            control={
              <div className="seg">
                <button aria-pressed={settings.timeFormat === "12"} onClick={() => set("timeFormat", "12")}>
                  {t("settings.time12")}
                </button>
                <button aria-pressed={settings.timeFormat === "24"} onClick={() => set("timeFormat", "24")}>
                  {t("settings.time24")}
                </button>
              </div>
            }
          />
          <SettingRow
            title={t("settings.rememberFilters")}
            desc={t("settings.rememberFiltersDesc")}
            control={
              <Toggle
                checked={settings.rememberFilters}
                onChange={(v) => set("rememberFilters", v)}
              />
            }
          />
          <SettingRow
            title={t("settings.rememberSection")}
            desc={t("settings.rememberSectionDesc")}
            control={
              <Toggle
                checked={settings.rememberSection}
                onChange={(v) => set("rememberSection", v)}
              />
            }
          />
          <SettingRow
            title={t("settings.autoViews")}
            desc={t("settings.autoViewsDesc")}
            control={<Toggle checked={settings.autoApplyViews} onChange={(v) => set("autoApplyViews", v)} />}
          />
        </div>
      )}

      {tab === "appearance" && (
        <>
          <div className="set-group">
            <SettingRow
              title={t("settings.accent")}
              control={
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {ACCENTS.map((c) => (
                    <button
                      key={c}
                      className="color-dot-btn"
                      style={{ background: c, borderColor: settings.accent === c ? "var(--ink)" : undefined }}
                      aria-label={c}
                      onClick={() => set("accent", c)}
                    />
                  ))}
                </div>
              }
            />
            <SettingRow
              title={t("settings.density")}
              control={
                <div className="seg">
                  <button
                    aria-pressed={settings.density === "compact"}
                    onClick={() => set("density", "compact")}
                  >
                    {t("settings.densityCompact")}
                  </button>
                  <button
                    aria-pressed={settings.density === "comfortable"}
                    onClick={() => set("density", "comfortable")}
                  >
                    {t("settings.densityComfortable")}
                  </button>
                </div>
              }
            />
            <SettingRow
              title={t("settings.fontSize")}
              control={
                <div className="seg">
                  <button aria-pressed={settings.fontSize === "sm"} onClick={() => set("fontSize", "sm")}>
                    {t("settings.fontSm")}
                  </button>
                  <button aria-pressed={settings.fontSize === "md"} onClick={() => set("fontSize", "md")}>
                    {t("settings.fontMd")}
                  </button>
                  <button aria-pressed={settings.fontSize === "lg"} onClick={() => set("fontSize", "lg")}>
                    {t("settings.fontLg")}
                  </button>
                </div>
              }
            />
            <SettingRow
              title={t("settings.animations")}
              desc={t("settings.reducedMotionNote")}
              control={<Toggle checked={settings.animations} onChange={(v) => set("animations", v)} />}
            />
          </div>

          <div className="set-group">
            <div className="section-label">{t("settings.subjectColors")}</div>
            <p className="page-sub" style={{ marginBottom: 10 }}>
              {t("settings.subjectColorsDesc")}
            </p>
            <div className="subject-colors">
              {Object.entries(SUBJECTS).map(([key, meta]) => (
                <div className="subject-color-item" key={key}>
                  <span
                    className="color-dot-btn"
                    style={{ background: settings.subjectColors[key] ?? meta.color }}
                  >
                    <input
                      type="color"
                      value={settings.subjectColors[key] ?? meta.color}
                      onChange={(e) =>
                        setSettings({
                          subjectColors: { ...settings.subjectColors, [key]: e.target.value },
                        })
                      }
                      aria-label={meta.name}
                    />
                  </span>
                  {meta.name}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12 }}>
              <button
                className="btn btn-sm"
                onClick={() => {
                  set("subjectColors", {});
                  toast(t("data.settingsReset"));
                }}
              >
                <Icon.refresh size={14} />
                {t("settings.resetSubjectColors")}
              </button>
            </div>
          </div>
        </>
      )}

      {tab === "timetable" && (
        <div className="set-group">
          <SettingRow
            title={t("settings.defaultView")}
            control={
              <div className="seg">
                <button
                  aria-pressed={settings.defaultView === "grid"}
                  onClick={() => {
                    set("defaultView", "grid");
                    setPrefs({ view: "grid" });
                  }}
                >
                  {t("timetable.weeklyGrid")}
                </button>
                <button
                  aria-pressed={settings.defaultView === "list"}
                  onClick={() => {
                    set("defaultView", "list");
                    setPrefs({ view: "list" });
                  }}
                >
                  {t("timetable.dailyList")}
                </button>
              </div>
            }
          />
          <SettingRow
            title={t("settings.defaultDay")}
            control={
              <select
                style={{ width: 180 }}
                value={String(settings.defaultDay)}
                onChange={(e) =>
                  set(
                    "defaultDay",
                    e.target.value === "today" ? "today" : (Number(e.target.value) as DayNum),
                  )
                }
              >
                <option value="today">{t("common.today")}</option>
                {DAYS.map((d) => (
                  <option key={d.num} value={d.num}>
                    {t(`days.${d.num}`)}
                  </option>
                ))}
              </select>
            }
          />
          <SettingRow
            title={t("settings.defaultSection")}
            control={
              <select
                style={{ width: 180 }}
                value={settings.defaultSection}
                onChange={(e) => set("defaultSection", e.target.value as SectionView)}
              >
                <option value="full">{t("sections.full")}</option>
                {SECTION_IDS.map((s) => (
                  <option key={s} value={s}>
                    {t(`sections.${s}`)}
                  </option>
                ))}
              </select>
            }
          />
          <SettingRow
            title={t("settings.weekStart")}
            control={
              <div className="seg">
                <button
                  aria-pressed={settings.weekStart === "saturday"}
                  onClick={() => {
                    set("weekStart", "saturday");
                    setPrefs({ dayOrder: [6, 0, 1, 2, 3] });
                  }}
                >
                  {t("settings.weekSat")}
                </button>
                <button
                  aria-pressed={settings.weekStart === "sunday"}
                  onClick={() => {
                    set("weekStart", "sunday");
                    setPrefs({ dayOrder: [0, 1, 2, 3, 4] });
                  }}
                >
                  {t("settings.weekSun")}
                </button>
              </div>
            }
          />
          <SettingRow
            title={t("settings.defaultFilters")}
            desc={t("settings.defaultFiltersDesc", { n: activeFilterCount })}
            control={
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="btn btn-sm"
                  disabled={activeFilterCount === 0}
                  onClick={() => {
                    setSettings({
                      defaultFilters: {
                        ...filters,
                        days: [...filters.days],
                        subjects: [...filters.subjects],
                        sections: [...filters.sections],
                        instructors: [...filters.instructors],
                        rooms: [...filters.rooms],
                        types: [...filters.types],
                        time: { ...filters.time },
                      },
                    });
                    toast(t("toast.saved"));
                  }}
                >
                  <Icon.save size={14} />
                  {t("common.save")}
                </button>
                <button
                  className="btn btn-sm"
                  disabled={!settings.defaultFilters}
                  onClick={() => {
                    set("defaultFilters", null);
                    toast(t("data.filterPrefsReset"));
                  }}
                >
                  {t("common.reset")}
                </button>
              </div>
            }
          />
          <SettingRow
            title={t("settings.defaultSort")}
            control={
              <div className="seg">
                <button
                  aria-pressed={prefs.sortBy === "time"}
                  onClick={() => setPrefs({ sortBy: "time" })}
                >
                  {t("customize.sortTime")}
                </button>
                <button
                  aria-pressed={prefs.sortBy === "subject"}
                  onClick={() => setPrefs({ sortBy: "subject" })}
                >
                  {t("customize.sortSubject")}
                </button>
              </div>
            }
          />
          <SettingRow
            title={t("settings.showCombined")}
            control={<Toggle checked={prefs.showCombined} onChange={(v) => setPrefs({ showCombined: v })} />}
          />
          <SettingRow
            title={t("settings.showInstructor")}
            control={<Toggle checked={prefs.showInstructor} onChange={(v) => setPrefs({ showInstructor: v })} />}
          />
          <SettingRow
            title={t("settings.showRoom")}
            control={<Toggle checked={prefs.showRoom} onChange={(v) => setPrefs({ showRoom: v })} />}
          />
          <SettingRow
            title={t("settings.showSection")}
            control={<Toggle checked={prefs.showSection} onChange={(v) => setPrefs({ showSection: v })} />}
          />
          <SettingRow
            title={t("settings.showType")}
            control={<Toggle checked={prefs.showType} onChange={(v) => setPrefs({ showType: v })} />}
          />
        </div>
      )}

      {tab === "data" && (
        <div className="set-group">
          <SettingRow
            title={t("settings.exportJson")}
            desc={t("settings.exportJsonDesc")}
            control={
              <button
                className="btn"
                onClick={() => {
                  downloadJson(
                    `timetable-${new Date().toISOString().slice(0, 10)}.json`,
                    buildExport(classes, savedViews),
                  );
                  toast(t("data.exported"));
                }}
              >
                <Icon.download size={15} />
                {t("common.export")}
              </button>
            }
          />
          <SettingRow
            title={t("settings.importJson")}
            desc={t("settings.importJsonDesc")}
            control={
              <>
                <button className="btn" onClick={() => fileRef.current?.click()}>
                  <Icon.upload size={15} />
                  {t("common.import")}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/json,.json"
                  hidden
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onImport(f);
                    e.target.value = "";
                  }}
                />
              </>
            }
          />
          <SettingRow
            title={t("settings.restore")}
            desc={t("settings.restoreDesc")}
            control={
              <button className="btn btn-danger" onClick={() => setModal({ kind: "restore" })}>
                <Icon.refresh size={15} />
                {t("confirm.restoreAction")}
              </button>
            }
          />
          <SettingRow
            title={t("settings.clearViews")}
            desc={t("settings.clearViewsDesc")}
            control={
              <button
                className="btn btn-danger"
                disabled={savedViews.length === 0}
                onClick={() => setModal({ kind: "clearViews" })}
              >
                <Icon.trashAll size={15} />
                {t("common.delete")}
              </button>
            }
          />
          <SettingRow
            title={t("settings.resetFilterPrefs")}
            control={
              <button
                className="btn"
                onClick={() => {
                  resetFilters();
                  toast(t("data.filterPrefsReset"));
                }}
              >
                <Icon.refresh size={15} />
                {t("common.reset")}
              </button>
            }
          />
          <SettingRow
            title={t("settings.resetSettings")}
            desc={t("settings.resetSettingsDesc")}
            control={
              <button className="btn btn-danger" onClick={() => setModal({ kind: "resetSettings" })}>
                <Icon.refresh size={15} />
                {t("common.reset")}
              </button>
            }
          />
        </div>
      )}

      {tab === "a11y" && (
        <div className="set-group">
          <SettingRow
            title={t("settings.densityA11y")}
            desc={t("settings.densityComfortable")}
            control={
              <div className="seg">
                <button
                  aria-pressed={settings.density === "compact"}
                  onClick={() => set("density", "compact")}
                >
                  {t("settings.densityCompact")}
                </button>
                <button
                  aria-pressed={settings.density === "comfortable"}
                  onClick={() => set("density", "comfortable")}
                >
                  {t("settings.densityComfortable")}
                </button>
              </div>
            }
          />
          <SettingRow
            title={t("settings.fontSizeA11y")}
            control={
              <div className="seg">
                <button aria-pressed={settings.fontSize === "sm"} onClick={() => set("fontSize", "sm")}>
                  {t("settings.fontSm")}
                </button>
                <button aria-pressed={settings.fontSize === "md"} onClick={() => set("fontSize", "md")}>
                  {t("settings.fontMd")}
                </button>
                <button aria-pressed={settings.fontSize === "lg"} onClick={() => set("fontSize", "lg")}>
                  {t("settings.fontLg")}
                </button>
              </div>
            }
          />
          <SettingRow
            title={t("settings.animations")}
            desc={t("settings.reducedMotionNote")}
            control={<Toggle checked={settings.animations} onChange={(v) => set("animations", v)} />}
          />
          <div className="card">
            <p className="page-sub">{t("settings.azDesc")}</p>
          </div>
        </div>
      )}

      {modal?.kind === "restore" && (
        <ConfirmDialog
          title={t("confirm.restoreTitle")}
          body={t("confirm.restoreBody")}
          confirmLabel={t("confirm.restoreAction")}
          danger
          onConfirm={() => {
            restoreSeed();
            toast(t("data.restored"));
          }}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.kind === "clearViews" && (
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
      {modal?.kind === "resetSettings" && (
        <ConfirmDialog
          title={t("confirm.resetSettingsTitle")}
          body={t("confirm.resetSettingsBody")}
          confirmLabel={t("common.reset")}
          danger
          onConfirm={() => {
            resetSettings();
            toast(t("data.settingsReset"));
          }}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

function SettingRow({
  title,
  desc,
  control,
}: {
  title: string;
  desc?: string;
  control: React.ReactNode;
}) {
  return (
    <div className="set-row">
      <div className="info">
        <b>{title}</b>
        {desc && <span>{desc}</span>}
      </div>
      <div className="ctrl">{control}</div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="switch">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <i />
    </label>
  );
}
