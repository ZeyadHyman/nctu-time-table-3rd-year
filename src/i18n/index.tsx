import { createContext, useContext, useMemo, type ReactNode } from "react";
import { en } from "./en";
import { ar } from "./ar";
import { useStore } from "../store";
import type { ClassEntry, DayNum } from "../types";
import { SUBJECTS } from "../types";
import { sectionLabel } from "../lib/filtering";

type Lang = "en" | "ar";
const dicts: Record<Lang, Record<string, string>> = { en, ar };

export type TFn = (key: string, vars?: Record<string, string | number>) => string;

const I18nCtx = createContext<{ t: TFn; lang: Lang }>({ t: (k) => k, lang: "en" });

export function I18nProvider({ children }: { children: ReactNode }) {
  const lang = useStore((s) => s.settings.language);
  const value = useMemo(() => {
    const dict = dicts[lang] ?? en;
    const t: TFn = (key, vars) => {
      let out = dict[key] ?? en[key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          out = out.replace(`{${k}}`, String(v));
        }
      }
      return out;
    };
    return { t, lang };
  }, [lang]);
  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
  return useContext(I18nCtx);
}

export function useT(): TFn {
  return useContext(I18nCtx).t;
}

/** Subject display name (keeps stored English name as data; shows localized label). */
export function subjectName(key: string, t: TFn): string {
  const local = t(`subject.${key}`);
  if (local !== `subject.${key}`) return local;
  return SUBJECTS[key]?.name ?? key;
}

export function dayName(day: DayNum, t: TFn): string {
  return t(`days.${day}`);
}

export function dayAbbr(day: DayNum, t: TFn): string {
  return t(`dayAbbr.${day}`);
}

/** Localized section label for a class entry. */
export function classSectionLabel(c: ClassEntry, t: TFn): string {
  if (c.type === "combined") return t("sections.all");
  if (c.sections.length === 0) {
    if (c.type === "practical") return t("kinds.practical");
    if (c.type === "lecture-section") return t("kinds.lecture-section");
    if (c.type === "network-section") return t("sections.network");
    return sectionLabel(c);
  }
  if (c.sections.length === 1) return t(`sections.${c.sections[0]}`);
  return t("sections.multi", {
    list: c.sections.map((s) => t(`sections.${s}`).replace(/^\S+\s/, "")).join(" & "),
  });
}
