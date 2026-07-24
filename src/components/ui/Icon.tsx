import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronsUpDown,
  CircleUserRound,
  Clock4,
  Cloud,
  Ellipsis,
  FolderOpen,
  Headset,
  Home,
  HousePlug,
  ImagePlus,
  Info,
  LampDesk,
  LibraryBig,
  ListChecks,
  ListFilter,
  LogOut,
  MailCheck,
  MailOpen,
  PanelLeft,
  Plus,
  RefreshCw,
  Search,
  SearchSlash,
  Settings,
  ShieldCheck,
  SquarePen,
  SquareDashedBottomCode,
  Timer,
  Trash,
  UserPen,
  X,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const icons = {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronsUpDown,
  CircleUserRound,
  Clock4,
  Cloud,
  Ellipsis,
  FolderOpen,
  Headset,
  Home,
  HousePlug,
  ImagePlus,
  Info,
  LampDesk,
  LibraryBig,
  ListChecks,
  ListFilter,
  LogOut,
  MailCheck,
  MailOpen,
  PanelLeft,
  Plus,
  RefreshCw,
  Search,
  SearchSlash,
  Settings,
  ShieldCheck,
  SquarePen,
  SquareDashedBottomCode,
  Timer,
  Trash,
  UserPen,
  X,
  Zap,
} satisfies Record<string, LucideIcon>;

const iconSizes = {
  xs: { size: 10, visualStrokeWidth: 0.625 },
  '2xs': { size: 12, visualStrokeWidth: 0.75 },
  sm: { size: 14, visualStrokeWidth: 0.875 },
  md: { size: 16, visualStrokeWidth: 1 },
  lg: { size: 20, visualStrokeWidth: 1.25 },
  xl: { size: 24, visualStrokeWidth: 1.5 },
  '2xl': { size: 32, visualStrokeWidth: 2 },
};

type IconName = keyof typeof icons;
type IconSize = keyof typeof iconSizes;

type IconProps = {
  name: IconName;
  size?: IconSize;
  strokeWidth?: number;
  className?: string;
  'aria-label'?: string;
};

type SortChevronsIconProps = {
  direction?: 'asc' | 'desc' | null;
  className?: string;
  'aria-label'?: string;
};

export function Icon({
  name,
  size = 'md',
  strokeWidth: customStrokeWidth,
  className,
  'aria-label': ariaLabel,
}: IconProps) {
  const LucideIcon = icons[name];
  const iconSize = iconSizes[size];
  const strokeWidth =
    customStrokeWidth ?? (iconSize.visualStrokeWidth * 24) / iconSize.size;

  return (
    <LucideIcon
      aria-hidden={ariaLabel ? undefined : true}
      aria-label={ariaLabel}
      className={className}
      focusable="false"
      size={iconSize.size}
      strokeWidth={strokeWidth}
    />
  );
}

export function SortChevronsIcon({
  direction = null,
  className,
  'aria-label': ariaLabel,
}: SortChevronsIconProps) {
  const iconSize = 14;
  const strokeWidth = 24 / iconSize;

  return (
    <svg
      aria-hidden={ariaLabel ? undefined : true}
      aria-label={ariaLabel}
      className={className}
      fill="none"
      focusable="false"
      height={iconSize}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      viewBox="0 0 24 24"
      width={iconSize}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        className={direction === 'desc' ? 'stroke-current' : 'stroke-text-hint'}
        d="m7 15 5 5 5-5"
      />
      <path
        className={direction === 'asc' ? 'stroke-current' : 'stroke-text-hint'}
        d="m7 9 5-5 5 5"
      />
    </svg>
  );
}
