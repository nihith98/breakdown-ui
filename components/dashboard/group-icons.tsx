type IconProps = { size?: number; className?: string };

function svg(size: number, className: string | undefined, children: React.ReactNode) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const PlusIcon = ({ size = 15, className }: IconProps) =>
  svg(size, className, (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ));

export const LoginIcon = ({ size = 15, className }: IconProps) =>
  svg(size, className, (
    <>
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" y1="12" x2="3" y2="12" />
    </>
  ));

export const SearchIcon = ({ size = 15, className }: IconProps) =>
  svg(size, className, (
    <>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </>
  ));

export const SortIcon = ({ size = 13, className }: IconProps) =>
  svg(size, className, (
    <>
      <path d="M11 5h10" />
      <path d="M11 9h7" />
      <path d="M11 13h4" />
      <path d="M3 17l3 3 3-3" />
      <path d="M6 18V4" />
    </>
  ));

export const ArrowUpIcon = ({ size = 14, className }: IconProps) =>
  svg(size, className, (
    <>
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </>
  ));

export const ArrowDownIcon = ({ size = 14, className }: IconProps) =>
  svg(size, className, (
    <>
      <line x1="12" y1="5" x2="12" y2="19" />
      <polyline points="19 12 12 19 5 12" />
    </>
  ));

export const ChevronRightIcon = ({ size = 16, className }: IconProps) =>
  svg(size, className, <polyline points="9 18 15 12 9 6" />);

export const HomeIcon = ({ size = 18, className }: IconProps) =>
  svg(size, className, (
    <>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </>
  ));

export const LinkIcon = ({ size = 14, className }: IconProps) =>
  svg(size, className, (
    <>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </>
  ));

export const CheckIcon = ({ size = 24, className }: IconProps) =>
  svg(size, className, (
    <>
      <polyline points="20 6 9 17 4 12" />
    </>
  ));
