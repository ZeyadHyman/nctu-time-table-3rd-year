type Props = { size?: number; className?: string; strokeWidth?: number };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

export const Icon = {
  dashboard: ({ size = 18, strokeWidth = 2, ...rest }: Props = {}) => (
    <svg {...base(size)} strokeWidth={strokeWidth} {...rest}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  ),
  calendar: ({ size = 18, strokeWidth = 2, ...rest }: Props = {}) => (
    <svg {...base(size)} strokeWidth={strokeWidth} {...rest}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  ),
  chart: ({ size = 18, strokeWidth = 2, ...rest }: Props = {}) => (
    <svg {...base(size)} strokeWidth={strokeWidth} {...rest}>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </svg>
  ),
  layers: ({ size = 18, strokeWidth = 2, ...rest }: Props = {}) => (
    <svg {...base(size)} strokeWidth={strokeWidth} {...rest}>
      <path d="M12 3 3 8l9 5 9-5-9-5Z" />
      <path d="m3 13 9 5 9-5" />
    </svg>
  ),
  sliders: ({ size = 18, strokeWidth = 2, ...rest }: Props = {}) => (
    <svg {...base(size)} strokeWidth={strokeWidth} {...rest}>
      <path d="M4 8h10M18 8h2M4 16h4M12 16h8" />
      <circle cx="16" cy="8" r="2" />
      <circle cx="10" cy="16" r="2" />
    </svg>
  ),
  search: ({ size = 16, strokeWidth = 2, ...rest }: Props = {}) => (
    <svg {...base(size)} strokeWidth={strokeWidth} {...rest}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  ),
  filter: ({ size = 16, strokeWidth = 2, ...rest }: Props = {}) => (
    <svg {...base(size)} strokeWidth={strokeWidth} {...rest}>
      <path d="M4 6h16M7 12h10M10 18h4" />
    </svg>
  ),
  brush: ({ size = 16, strokeWidth = 2, ...rest }: Props = {}) => (
    <svg {...base(size)} strokeWidth={strokeWidth} {...rest}>
      <path d="M15 4 20 9 9 20H4v-5L15 4Z" />
      <path d="m13 6 5 5" />
    </svg>
  ),
  download: ({ size = 16, strokeWidth = 2, ...rest }: Props = {}) => (
    <svg {...base(size)} strokeWidth={strokeWidth} {...rest}>
      <path d="M12 4v11M7.5 11 12 15.5 16.5 11M5 19h14" />
    </svg>
  ),
  printer: ({ size = 16, strokeWidth = 2, ...rest }: Props = {}) => (
    <svg {...base(size)} strokeWidth={strokeWidth} {...rest}>
      <path d="M7 8V4h10v4M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" />
      <rect x="7" y="14" width="10" height="7" rx="1" />
    </svg>
  ),
  image: ({ size = 16, strokeWidth = 2, ...rest }: Props = {}) => (
    <svg {...base(size)} strokeWidth={strokeWidth} {...rest}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="m4 17 5-4 4 3 3-2 4 4" />
    </svg>
  ),
  fileJson: ({ size = 16, strokeWidth = 2, ...rest }: Props = {}) => (
    <svg {...base(size)} strokeWidth={strokeWidth} {...rest}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
      <path d="M14 3v5h5" />
      <path d="M10 12.5c-.8 0-1 .6-1 1.5s0 1.5 1 1.5c1 0 1 1 1 1.5M14 12.5c.8 0 1 .6 1 1.5s0 1.5-1 1.5c-1 0-1 1-1 1.5" />
    </svg>
  ),
  upload: ({ size = 16, strokeWidth = 2, ...rest }: Props = {}) => (
    <svg {...base(size)} strokeWidth={strokeWidth} {...rest}>
      <path d="M12 20V9M7.5 13 12 8.5 16.5 13M5 5h14" />
    </svg>
  ),
  pencil: ({ size = 15, strokeWidth = 2, ...rest }: Props = {}) => (
    <svg {...base(size)} strokeWidth={strokeWidth} {...rest}>
      <path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17v3Z" />
      <path d="m14.5 6.5 3 3" />
    </svg>
  ),
  copy: ({ size = 15, strokeWidth = 2, ...rest }: Props = {}) => (
    <svg {...base(size)} strokeWidth={strokeWidth} {...rest}>
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
    </svg>
  ),
  trash: ({ size = 15, strokeWidth = 2, ...rest }: Props = {}) => (
    <svg {...base(size)} strokeWidth={strokeWidth} {...rest}>
      <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v5M14 11v5" />
    </svg>
  ),
  plus: ({ size = 16, strokeWidth = 2.2, ...rest }: Props = {}) => (
    <svg {...base(size)} strokeWidth={strokeWidth} {...rest}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  x: ({ size = 15, strokeWidth = 2.2, ...rest }: Props = {}) => (
    <svg {...base(size)} strokeWidth={strokeWidth} {...rest}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  ),
  check: ({ size = 15, strokeWidth = 2.4, ...rest }: Props = {}) => (
    <svg {...base(size)} strokeWidth={strokeWidth} {...rest}>
      <path d="m5 13 4 4L19 7" />
    </svg>
  ),
  undo: ({ size = 16, strokeWidth = 2, ...rest }: Props = {}) => (
    <svg {...base(size)} strokeWidth={strokeWidth} {...rest}>
      <path d="M4 8h9a5 5 0 0 1 0 10H7" />
      <path d="m8 4-4 4 4 4" />
    </svg>
  ),
  save: ({ size = 16, strokeWidth = 2, ...rest }: Props = {}) => (
    <svg {...base(size)} strokeWidth={strokeWidth} {...rest}>
      <path d="M5 4h11l3 3v13H5V4Z" />
      <path d="M8 4v5h7M8 20v-6h8v6" />
    </svg>
  ),
  grip: ({ size = 14, strokeWidth = 2, ...rest }: Props = {}) => (
    <svg {...base(size)} strokeWidth={strokeWidth} {...rest}>
      <circle cx="9" cy="6" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="6" r="1" fill="currentColor" stroke="none" />
      <circle cx="9" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="9" cy="18" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="18" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  clock: ({ size = 14, strokeWidth = 2, ...rest }: Props = {}) => (
    <svg {...base(size)} strokeWidth={strokeWidth} {...rest}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  ),
  user: ({ size = 14, strokeWidth = 2, ...rest }: Props = {}) => (
    <svg {...base(size)} strokeWidth={strokeWidth} {...rest}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c.8-3.4 3.5-5 7-5s6.2 1.6 7 5" />
    </svg>
  ),
  pin: ({ size = 14, strokeWidth = 2, ...rest }: Props = {}) => (
    <svg {...base(size)} strokeWidth={strokeWidth} {...rest}>
      <path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  ),
  chevronLeft: ({ size = 16, strokeWidth = 2.2, ...rest }: Props = {}) => (
    <svg {...base(size)} strokeWidth={strokeWidth} {...rest}>
      <path d="m14 6-6 6 6 6" />
    </svg>
  ),
  chevronRight: ({ size = 16, strokeWidth = 2.2, ...rest }: Props = {}) => (
    <svg {...base(size)} strokeWidth={strokeWidth} {...rest}>
      <path d="m10 6 6 6-6 6" />
    </svg>
  ),
  arrowUp: ({ size = 13, strokeWidth = 2.2, ...rest }: Props = {}) => (
    <svg {...base(size)} strokeWidth={strokeWidth} {...rest}>
      <path d="M12 19V5M6 11l6-6 6 6" />
    </svg>
  ),
  arrowDown: ({ size = 13, strokeWidth = 2.2, ...rest }: Props = {}) => (
    <svg {...base(size)} strokeWidth={strokeWidth} {...rest}>
      <path d="M12 5v14M6 13l6 6 6-6" />
    </svg>
  ),
  sun: ({ size = 16, strokeWidth = 2, ...rest }: Props = {}) => (
    <svg {...base(size)} strokeWidth={strokeWidth} {...rest}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  ),
  moon: ({ size = 16, strokeWidth = 2, ...rest }: Props = {}) => (
    <svg {...base(size)} strokeWidth={strokeWidth} {...rest}>
      <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z" />
    </svg>
  ),
  globe: ({ size = 16, strokeWidth = 2, ...rest }: Props = {}) => (
    <svg {...base(size)} strokeWidth={strokeWidth} {...rest}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z" />
    </svg>
  ),
  alert: ({ size = 16, strokeWidth = 2, ...rest }: Props = {}) => (
    <svg {...base(size)} strokeWidth={strokeWidth} {...rest}>
      <path d="M12 4 2.8 20h18.4L12 4Z" />
      <path d="M12 10v4M12 17.2v.1" />
    </svg>
  ),
  play: ({ size = 14, strokeWidth = 2, ...rest }: Props = {}) => (
    <svg {...base(size)} strokeWidth={strokeWidth} {...rest}>
      <path d="M8 5.5v13l11-6.5L8 5.5Z" />
    </svg>
  ),
  trashAll: ({ size = 16, strokeWidth = 2, ...rest }: Props = {}) => (
    <svg {...base(size)} strokeWidth={strokeWidth} {...rest}>
      <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
      <path d="M10 11v5M14 11v5" />
    </svg>
  ),
  refresh: ({ size = 16, strokeWidth = 2, ...rest }: Props = {}) => (
    <svg {...base(size)} strokeWidth={strokeWidth} {...rest}>
      <path d="M20 12a8 8 0 1 1-2.3-5.6" />
      <path d="M20 4v5h-5" />
    </svg>
  ),
  palette: ({ size = 16, strokeWidth = 2, ...rest }: Props = {}) => (
    <svg {...base(size)} strokeWidth={strokeWidth} {...rest}>
      <path d="M12 3a9 9 0 1 0 0 18c1.2 0 1.8-.9 1.8-1.8 0-1.6-1.4-1.9-1.4-3 0-.9.7-1.5 1.7-1.5H16a5 5 0 0 0 5-5c0-3.9-4-6.7-9-6.7Z" />
      <circle cx="7.5" cy="11" r="1" fill="currentColor" stroke="none" />
      <circle cx="10" cy="7.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="7.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  zap: ({ size = 16, strokeWidth = 2, ...rest }: Props = {}) => (
    <svg {...base(size)} strokeWidth={strokeWidth} {...rest}>
      <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
    </svg>
  ),
};
