import { useEffect, useState, type ComponentType } from "react";
import { useStore } from "./store";
import { I18nProvider, useT } from "./i18n";
import { setLang, setTimeFormat } from "./lib/filtering";
import { ToastHost } from "./toast";
import { Icon } from "./components/Icon";
import { DashboardPage } from "./pages/DashboardPage";
import { TimetablePage } from "./pages/TimetablePage";
import { StatisticsPage } from "./pages/StatisticsPage";
import { SavedViewsPage } from "./pages/SavedViewsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { AttendancePage } from "./pages/AttendancePage";
import { OnboardingPage } from "./pages/OnboardingPage";
import type { SectionView, DayNum } from "./types";

type Route =
  | "dashboard"
  | "timetable"
  | "attendance"
  | "stats"
  | "views"
  | "settings"
  | "onboarding";

/* eslint-disable @typescript-eslint/no-explicit-any */
const ROUTES: { id: Route; hash: string; labelKey: string; icon: ComponentType<any> }[] = [
  { id: "dashboard", hash: "#/dashboard", labelKey: "nav.dashboard", icon: Icon.dashboard },
  { id: "timetable", hash: "#/timetable", labelKey: "nav.timetable", icon: Icon.calendar },
  { id: "attendance", hash: "#/attendance", labelKey: "nav.attendance", icon: Icon.check },
  { id: "stats", hash: "#/stats", labelKey: "nav.statistics", icon: Icon.chart },
  { id: "views", hash: "#/views", labelKey: "nav.views", icon: Icon.layers },
  { id: "settings", hash: "#/settings", labelKey: "nav.settings", icon: Icon.sliders },
];

function parseHash(): Route {
  const h = window.location.hash.replace(/^#\/?/, "").toLowerCase();
  if (h.startsWith("timetable")) return "timetable";
  if (h.startsWith("attendance")) return "attendance";
  if (h.startsWith("stats") || h.startsWith("statistics")) return "stats";
  if (h.startsWith("views")) return "views";
  if (h.startsWith("settings")) return "settings";
  if (h.startsWith("onboarding") || h.startsWith("profile")) return "onboarding";
  return "dashboard";
}

function go(hash: string) {
  window.location.hash = hash;
}

function Shell() {
  const t = useT();
  const settings = useStore((s) => s.settings);
  const theme = useStore((s) => s.theme);

  // theme / accent / density / font / motion / lang on <html>
  useEffect(() => {
    const root = document.documentElement;
    const resolvedTheme =
      theme ??
      (window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark");
    root.dataset.theme = resolvedTheme;
    root.dataset.density = settings.density;
    root.dataset.fontsize = settings.fontSize;
    root.dataset.motion = settings.animations ? "on" : "off";
    root.style.setProperty("--accent", settings.accent);
    // accent ink: dark text on light accents, light text on dark accents
    const hex = settings.accent.replace("#", "");
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    root.style.setProperty("--accent-ink", luminance > 0.55 ? "#111" : "#fff");
  }, [theme, settings.density, settings.fontSize, settings.animations, settings.accent]);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = settings.language;
    root.dir = settings.language === "ar" ? "rtl" : "ltr";
  }, [settings.language]);

  // set locale BEFORE children render so fmtTime picks up Arabic meridiem immediately
  setLang(settings.language);
  setTimeFormat(settings.timeFormat);

  // boot: remember prefs / auto-apply view
  useEffect(() => {
    const s = useStore.getState();
    if (!s.settings.rememberFilters) s.resetFilters();
    if (!s.settings.rememberSection) s.setSection(s.settings.defaultSection as SectionView);
    if (s.settings.autoApplyViews && s.activeViewId) s.applyView(s.activeViewId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <ShellInner />;
}

function ShellInner() {
  const t = useT();
  const route = useStoreRoute();
  const settings = useStore((s) => s.settings);
  const theme = useStore((s) => s.theme);
  const onboarded = useStore((s) => s.profile.onboarded);
  const resolvedTheme =
    theme ?? (window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark");

  // first-time gate: force onboarding until profile exists
  const effective: Route =
    !onboarded && route !== "onboarding" ? "onboarding" : route;

  const page =
    effective === "onboarding" ? (
      <OnboardingPage go={go} />
    ) : effective === "timetable" ? (
      <TimetablePage />
    ) : effective === "attendance" ? (
      <AttendancePage go={go} />
    ) : effective === "stats" ? (
      <StatisticsPage />
    ) : effective === "views" ? (
      <SavedViewsPage go={go} />
    ) : effective === "settings" ? (
      <SettingsPage go={go} />
    ) : (
      <DashboardPage go={go} />
    );

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">SW</span>
          <span className="brand-name">
            {t("app.title")}
            <small>{t("app.subtitle")}</small>
          </span>
        </div>
        <nav className="nav" aria-label={t("nav.open")}>
          {ROUTES.map((r) => (
            <button
              key={r.id}
              className={"nav-item" + (effective === r.id ? " active" : "")}
              aria-current={effective === r.id ? "page" : undefined}
              onClick={() => go(r.hash)}
            >
              <r.icon />
              <span>{t(r.labelKey)}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-foot">
          <button
            className="btn btn-sm"
            onClick={() => {
              const s = useStore.getState();
              s.setSettings({
                language: s.settings.language === "en" ? "ar" : "en",
              });
            }}
            title={t("settings.language")}
          >
            <Icon.globe size={14} />
            <span>{settings.language === "en" ? "AR" : "EN"}</span>
          </button>
          <button
            className="btn btn-sm"
            onClick={() => {
              const s = useStore.getState();
              const cur =
                s.theme ??
                (window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark");
              s.setTheme(cur === "dark" ? "light" : "dark");
            }}
            title={t("settings.theme")}
          >
            {resolvedTheme === "dark" ? <Icon.sun size={14} /> : <Icon.moon size={14} />}
            <span>{resolvedTheme === "dark" ? t("settings.themeLight") : t("settings.themeDark")}</span>
          </button>
        </div>
      </aside>

      <main className="main">{page}</main>

      <nav className="bottomnav" aria-label={t("nav.open")}>
        {ROUTES.map((r) => (
          <button
            key={r.id}
            className={effective === r.id ? "active" : ""}
            aria-current={effective === r.id ? "page" : undefined}
            onClick={() => go(r.hash)}
          >
            <r.icon size={20} />
            {t(r.labelKey)}
          </button>
        ))}
      </nav>

      <ToastHost />
    </div>
  );
}

function useStoreRoute(): Route {
  const [route, setRoute] = useHashRoute();
  return route;
}

function useHashRoute(): [Route, (r: Route) => void] {
  const [route, setRoute] = useState<Route>(parseHash);
  useEffect(() => {
    const onChange = () => setRoute(parseHash());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return [route, (r) => go(ROUTES.find((x) => x.id === r)?.hash ?? "#/dashboard")];
}

export default function App() {
  return (
    <I18nProvider>
      <Shell />
    </I18nProvider>
  );
}
