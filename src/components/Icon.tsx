import {
  LayoutDashboard,
  Calendar,
  BarChart3,
  Layers,
  SlidersHorizontal,
  Search,
  Filter,
  Brush,
  Download,
  Printer,
  Image as ImageIcon,
  FileJson,
  Upload,
  Pencil,
  Copy,
  Trash2,
  Plus,
  X,
  Check,
  Undo2,
  Save,
  GripVertical,
  Clock,
  User,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Sun,
  Moon,
  Globe,
  AlertTriangle,
  Play,
  RotateCcw,
  Palette,
  Zap,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & {
  size?: number | string;
  strokeWidth?: number;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
type IconComp = ComponentType<any>;

const FLIP_CLASS = "icon-flip";

function make(Cmp: IconComp, flip = false) {
  return ({ size = 18, strokeWidth = 2, className = "", ...rest }: IconProps = {}) => (
    <Cmp
      size={size}
      strokeWidth={strokeWidth}
      className={flip ? `${FLIP_CLASS} ${className}` : className}
      aria-hidden="true"
      focusable="false"
      {...rest}
    />
  );
}

/** Directional icons flip in RTL; all others stay put. */
export const Icon = {
  dashboard: make(LayoutDashboard),
  calendar: make(Calendar),
  chart: make(BarChart3),
  layers: make(Layers),
  sliders: make(SlidersHorizontal),
  search: make(Search),
  filter: make(Filter),
  brush: make(Brush),
  download: make(Download),
  printer: make(Printer),
  image: make(ImageIcon),
  fileJson: make(FileJson),
  upload: make(Upload),
  pencil: make(Pencil),
  copy: make(Copy),
  trash: make(Trash2),
  plus: make(Plus),
  x: make(X),
  check: make(Check),
  undo: make(Undo2),
  save: make(Save),
  grip: make(GripVertical),
  clock: make(Clock),
  user: make(User),
  pin: make(MapPin),
  chevronLeft: make(ChevronLeft, true),
  chevronRight: make(ChevronRight, true),
  arrowUp: make(ArrowUp, true),
  arrowDown: make(ArrowDown, true),
  sun: make(Sun),
  moon: make(Moon),
  globe: make(Globe),
  alert: make(AlertTriangle),
  play: make(Play),
  trashAll: make(Trash2),
  refresh: make(RotateCcw),
  palette: make(Palette),
  zap: make(Zap),
};
