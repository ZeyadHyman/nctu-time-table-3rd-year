import type { ReactNode } from "react";

export function Panel({
  title,
  hint,
  open,
  onToggle,
  children,
}: {
  title: string;
  hint?: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <section className="panel">
      <button
        className="panel-head"
        aria-expanded={open}
        onClick={onToggle}
        type="button"
      >
        <span>
          {title}
          {hint ? <span className="hint"> · {hint}</span> : null}
        </span>
        <span className="caret">›</span>
      </button>
      {open ? <div className="panel-body">{children}</div> : null}
    </section>
  );
}
