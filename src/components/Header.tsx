import { useEffect } from "react";
import { useStore } from "../store";

export default function Header() {
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);

  useEffect(() => {
    const r = document.documentElement;
    if (theme) r.dataset.theme = theme;
    else delete r.dataset.theme;
  }, [theme]);

  return (
    <header>
      <h1>
        Software
        <br />
        Timetable
      </h1>
      <div className="info">
        <strong>Software &amp; Network</strong>
        Third Year · First Semester
        <br />
        2026/2027 · New Cairo Technological University
        <div className="hbtns">
          <button
            className="btn"
            onClick={() => {
              const dark = document.documentElement.dataset.theme
                ? document.documentElement.dataset.theme === "dark"
                : !matchMedia("(prefers-color-scheme:light)").matches;
              setTheme(dark ? "light" : "dark");
            }}
          >
            Light / Dark
          </button>
        </div>
      </div>
    </header>
  );
}
