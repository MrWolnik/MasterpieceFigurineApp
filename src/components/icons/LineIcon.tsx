import type { ReactNode } from 'react';

interface LineIconProps {
  /** Width and height in px; the glyph is drawn on a 24×24 grid. */
  size?: number;
  strokeWidth?: number;
  children: ReactNode;
  /** Extra attributes, e.g. `data-kind` for tests. */
  [data: `data-${string}`]: string;
}

/** Decorative line icon stroked with `currentColor`; the caller provides the accessible name. */
export function LineIcon({ size = 20, strokeWidth = 1.6, children, ...data }: LineIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...data}
    >
      {children}
    </svg>
  );
}
