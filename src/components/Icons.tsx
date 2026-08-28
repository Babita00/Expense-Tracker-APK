interface IconProps {
  size?: number;
  strokeWidth?: number;
}

function base(size: number, strokeWidth: number) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };
}

export const ChartIcon = ({ size = 22, strokeWidth = 1.8 }: IconProps) => (
  <svg {...base(size, strokeWidth)}>
    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
  </svg>
);

export const ListIcon = ({ size = 22, strokeWidth = 1.8 }: IconProps) => (
  <svg {...base(size, strokeWidth)}>
    <path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />
  </svg>
);

export const TagIcon = ({ size = 22, strokeWidth = 1.8 }: IconProps) => (
  <svg {...base(size, strokeWidth)}>
    <path d="M3 3h7l11 11-7 7L3 10V3Z" />
    <circle cx="7.5" cy="7.5" r="1.4" />
  </svg>
);

export const GearIcon = ({ size = 22, strokeWidth = 1.8 }: IconProps) => (
  <svg {...base(size, strokeWidth)}>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-2.9-1.2l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 3 15a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.2-2.9l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 10 4.6a2 2 0 1 1 4 0 1.7 1.7 0 0 0 2.9 1.2l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 21 11a2 2 0 1 1 0 4Z" />
  </svg>
);

export const PlusIcon = ({ size = 26, strokeWidth = 2.2 }: IconProps) => (
  <svg {...base(size, strokeWidth)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const ChevronLeft = ({ size = 20, strokeWidth = 2 }: IconProps) => (
  <svg {...base(size, strokeWidth)}>
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

export const ChevronRight = ({ size = 20, strokeWidth = 2 }: IconProps) => (
  <svg {...base(size, strokeWidth)}>
    <path d="M9 18l6-6-6-6" />
  </svg>
);

export const CloseIcon = ({ size = 20, strokeWidth = 2 }: IconProps) => (
  <svg {...base(size, strokeWidth)}>
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

export const TrashIcon = ({ size = 18, strokeWidth = 1.8 }: IconProps) => (
  <svg {...base(size, strokeWidth)}>
    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v5M14 11v5" />
  </svg>
);

export const CalendarIcon = ({ size = 19, strokeWidth = 1.8 }: IconProps) => (
  <svg {...base(size, strokeWidth)}>
    <rect x="3" y="5" width="18" height="16" rx="2.5" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </svg>
);

export const PencilIcon = ({ size = 18, strokeWidth = 1.8 }: IconProps) => (
  <svg {...base(size, strokeWidth)}>
    <path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3Z" />
  </svg>
);

export const DownloadIcon = ({ size = 19, strokeWidth = 1.8 }: IconProps) => (
  <svg {...base(size, strokeWidth)}>
    <path d="M12 3v12M7 11l5 5 5-5M4 21h16" />
  </svg>
);

export const UploadIcon = ({ size = 19, strokeWidth = 1.8 }: IconProps) => (
  <svg {...base(size, strokeWidth)}>
    <path d="M12 16V4M7 8l5-5 5 5M4 21h16" />
  </svg>
);

export const SearchIcon = ({ size = 18, strokeWidth = 1.8 }: IconProps) => (
  <svg {...base(size, strokeWidth)}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </svg>
);
