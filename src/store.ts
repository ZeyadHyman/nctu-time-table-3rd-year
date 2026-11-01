import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ClassEntry,
  DayNum,
  DisplayPrefs,
  Filters,
  SavedView,
  SectionView,
} from "./types";
import { DEFAULT_PREFS, EMPTY_FILTERS } from "./types";
import { SEED_CLASSES } from "./data/seed";
import { overlaps } from "./lib/filtering";

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

interface TimetableState {
  classes: ClassEntry[];
  filters: Filters;
  section: SectionView;
  prefs: DisplayPrefs;
  savedViews: SavedView[];
  activeViewId: string | null;
  editMode: boolean;
  theme: "dark" | "light" | null;

  setFilters: (f: Partial<Filters>) => void;
  resetFilters: () => void;
  setSection: (s: SectionView) => void;
  setPrefs: (p: Partial<DisplayPrefs>) => void;
  setEditMode: (on: boolean) => void;
  setTheme: (t: "dark" | "light" | null) => void;

  addClass: (c: Omit<ClassEntry, "id">) => ClassEntry;
  updateClass: (id: string, patch: Partial<Omit<ClassEntry, "id">>) => void;
  deleteClass: (id: string) => void;
  duplicateClass: (id: string, patch?: Partial<Omit<ClassEntry, "id" | "id">>) => ClassEntry | null;
  moveClass: (id: string, day: DayNum, start: string, end: string) => void;
  replaceAllClasses: (classes: ClassEntry[]) => void;
  restoreSeed: () => void;
  undo: () => void;
  canUndo: boolean;

  saveCurrentView: (name: string) => void;
  applyView: (id: string) => void;
  renameView: (id: string, name: string) => void;
  duplicateView: (id: string) => void;
  deleteView: (id: string) => void;
  clearActiveView: () => void;
}

let undoStack: ClassEntry[][] = [];
const UNDO_MAX = 30;

function pushUndo(classes: ClassEntry[]) {
  undoStack.push(classes.map((c) => ({ ...c })));
  if (undoStack.length > UNDO_MAX) undoStack.shift();
}

export const useStore = create<TimetableState>()(
  persist(
    (set, get) => ({
      classes: SEED_CLASSES.map((c) => ({ ...c })),
      filters: { ...EMPTY_FILTERS },
      section: "full",
      prefs: { ...DEFAULT_PREFS },
      savedViews: [],
      activeViewId: null,
      editMode: false,
      theme: null,
      canUndo: false,

      setFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f }, activeViewId: null })),
      resetFilters: () => set({ filters: { ...EMPTY_FILTERS, time: { mode: "all" } } }),
      setSection: (section) => set({ section, activeViewId: null }),
      setPrefs: (p) =>
        set((s) => ({
          prefs: { ...s.prefs, ...p },
          savedViews: s.activeViewId
            ? s.savedViews.map((v) =>
                v.id === s.activeViewId ? { ...v, prefs: { ...v.prefs, ...p } } : v,
              )
            : s.savedViews,
        })),
      setEditMode: (editMode) => set({ editMode }),
      setTheme: (theme) => set({ theme }),

      addClass: (c) => {
        const entry: ClassEntry = { ...c, id: uid() };
        pushUndo(get().classes);
        set((s) => ({ classes: [...s.classes, entry], canUndo: true }));
        return entry;
      },
      updateClass: (id, patch) => {
        pushUndo(get().classes);
        set((s) => ({
          classes: s.classes.map((c) => (c.id === id ? { ...c, ...patch } : c)),
          canUndo: true,
        }));
      },
      deleteClass: (id) => {
        pushUndo(get().classes);
        set((s) => ({ classes: s.classes.filter((c) => c.id !== id), canUndo: true }));
      },
      duplicateClass: (id, patch) => {
        const src = get().classes.find((c) => c.id === id);
        if (!src) return null;
        const copy: ClassEntry = { ...src, ...patch, id: uid() };
        pushUndo(get().classes);
        set((s) => ({ classes: [...s.classes, copy], canUndo: true }));
        return copy;
      },
      moveClass: (id, day, start, end) => {
        pushUndo(get().classes);
        set((s) => ({
          classes: s.classes.map((c) => (c.id === id ? { ...c, day, start, end } : c)),
          canUndo: true,
        }));
      },
      replaceAllClasses: (classes) => {
        pushUndo(get().classes);
        set({ classes, canUndo: true });
      },
      restoreSeed: () => {
        pushUndo(get().classes);
        set({ classes: SEED_CLASSES.map((c) => ({ ...c })), canUndo: true });
      },
      undo: () => {
        const prev = undoStack.pop();
        if (!prev) return;
        set({ classes: prev, canUndo: undoStack.length > 0 });
      },

      saveCurrentView: (name) => {
        const s = get();
        const view: SavedView = {
          id: uid(),
          name,
          filters: { ...s.filters },
          section: s.section,
          prefs: { ...s.prefs },
        };
        set({ savedViews: [...s.savedViews, view], activeViewId: view.id });
      },
      applyView: (id) => {
        const v = get().savedViews.find((x) => x.id === id);
        if (!v) return;
        set({
          filters: { ...v.filters },
          section: v.section,
          prefs: { ...v.prefs },
          activeViewId: id,
        });
      },
      renameView: (id, name) =>
        set((s) => ({
          savedViews: s.savedViews.map((v) => (v.id === id ? { ...v, name } : v)),
        })),
      duplicateView: (id) => {
        const v = get().savedViews.find((x) => x.id === id);
        if (!v) return;
        const copy: SavedView = { ...v, id: uid(), name: v.name + " (copy)", filters: { ...v.filters }, prefs: { ...v.prefs } };
        set((s) => ({ savedViews: [...s.savedViews, copy] }));
      },
      deleteView: (id) =>
        set((s) => ({
          savedViews: s.savedViews.filter((v) => v.id !== id),
          activeViewId: s.activeViewId === id ? null : s.activeViewId,
        })),
      clearActiveView: () => set({ activeViewId: null }),
    }),
    {
      name: "software-timetable-v2",
      partialize: (s) => ({
        classes: s.classes,
        filters: s.filters,
        section: s.section,
        prefs: s.prefs,
        savedViews: s.savedViews,
        activeViewId: s.activeViewId,
        theme: s.theme,
      }),
    },
  ),
);

export function findOverlaps(classes: ClassEntry[], candidate: ClassEntry, ignoreId?: string) {
  return classes.filter((c) => c.id !== ignoreId && overlaps(c, candidate));
}
