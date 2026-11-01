import type { DayNum, DisplayPrefs } from "../types";
import { DAYS, SUBJECTS } from "../types";
import { useStore } from "../store";
import { Panel } from "./Panel";

function toggle<T>(arr: T[], v: T): T[] {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}

export function CustomizePanel({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const prefs = useStore((s) => s.prefs);
  const setPrefs = useStore((s) => s.setPrefs);
  const classes = useStore((s) => s.classes);

  const instructors = [...new Set(classes.map((c) => c.instructor))].sort();

  const moveDay = (d: DayNum, dir: -1 | 1) => {
    const order = [...prefs.dayOrder];
    const i = order.indexOf(d);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= order.length) return;
    [order[i], order[j]] = [order[j], order[i]];
    setPrefs({ dayOrder: order });
  };

  const setP = (patch: Partial<DisplayPrefs>) => setPrefs(patch);

  return (
    <Panel
      title="Customize"
      hint="visibility · card fields · layout"
      open={open}
      onToggle={onToggle}
    >
      <div className="filter-grid">
        <div className="fgroup">
          <h4>
            Subjects shown
            <span className="mini">
              <button onClick={() => setP({ hiddenSubjects: [] })}>Show all</button>
              <button onClick={() => setP({ hiddenSubjects: Object.keys(SUBJECTS) })}>Hide all</button>
            </span>
          </h4>
          <div className="opts">
            {Object.entries(SUBJECTS).map(([k, v]) => (
              <button
                key={k}
                type="button"
                className="opt"
                aria-pressed={!prefs.hiddenSubjects.includes(k)}
                onClick={() => setP({ hiddenSubjects: toggle(prefs.hiddenSubjects, k) })}
              >
                <i style={{ ["--c" as string]: v.color }} />
                {v.name}
              </button>
            ))}
          </div>
        </div>

        <div className="fgroup">
          <h4>
            Instructors shown
            <span className="mini">
              <button onClick={() => setP({ hiddenInstructors: [] })}>Show all</button>
            </span>
          </h4>
          <div className="optlist">
            {instructors.map((i) => (
              <button
                key={i}
                type="button"
                className="opt"
                aria-pressed={!prefs.hiddenInstructors.includes(i)}
                onClick={() => setP({ hiddenInstructors: toggle(prefs.hiddenInstructors, i) })}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        <div className="fgroup">
          <h4>
            Days shown
            <span className="mini">
              <button onClick={() => setP({ hiddenDays: [] })}>Show all</button>
            </span>
          </h4>
          <div className="opts">
            {DAYS.map((d) => (
              <button
                key={d.num}
                type="button"
                className="opt"
                aria-pressed={!prefs.hiddenDays.includes(d.num)}
                onClick={() => setP({ hiddenDays: toggle(prefs.hiddenDays, d.num) })}
              >
                {d.abbr}
              </button>
            ))}
          </div>
        </div>

        <div className="fgroup">
          <h4>Day display order</h4>
          <div className="opts">
            {prefs.dayOrder.map((d, i) => {
              const meta = DAYS.find((x) => x.num === d)!;
              return (
                <span key={d} className="opt" style={{ cursor: "default" }}>
                  {i + 1}. {meta.name}
                  <button
                    className="btn sm"
                    style={{ padding: "1px 7px", marginLeft: 4 }}
                    onClick={() => moveDay(d, -1)}
                    disabled={i === 0}
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    className="btn sm"
                    style={{ padding: "1px 7px" }}
                    onClick={() => moveDay(d, 1)}
                    disabled={i === prefs.dayOrder.length - 1}
                    title="Move down"
                  >
                    ↓
                  </button>
                </span>
              );
            })}
          </div>
        </div>

        <div className="fgroup">
          <h4>Card fields</h4>
          <div className="opts">
            {(
              [
                ["showInstructor", "Instructor names"],
                ["showRoom", "Room numbers"],
                ["showType", "Class types"],
                ["showSection", "Section numbers"],
                ["showTime", "Times"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                className="opt"
                aria-pressed={prefs[key]}
                onClick={() => setP({ [key]: !prefs[key] } as Partial<DisplayPrefs>)}
              >
                {prefs[key] ? "✓ " : ""}
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="panel-actions">
        <button
          className="btn"
          onClick={() =>
            setPrefs({
              hiddenSubjects: [],
              hiddenInstructors: [],
              hiddenDays: [],
              showInstructor: true,
              showRoom: true,
              showType: true,
              showSection: true,
              showTime: true,
              dayOrder: [6, 0, 1, 2, 3],
            })
          }
        >
          Reset customization
        </button>
      </div>
    </Panel>
  );
}
