import type { WorkKind } from '../../lib/works';
import type { ReactNode } from 'react';

// Our own simplified line glyphs (24×24, stroked with currentColor).
const glyphs: Record<WorkKind, ReactNode> = {
  // Miniature on a round base.
  figurine: (
    <>
      <circle cx="12" cy="5.5" r="2.5" />
      <path d="M8.5 17l1-7.5h5l1 7.5" />
      <ellipse cx="12" cy="19" rx="6" ry="2" />
    </>
  ),
  // Framed picture.
  painting: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="1" />
      <path d="M6.5 16.5l4-5 3 3.5 2-2 2 3.5" />
      <circle cx="15.5" cy="8.5" r="1.25" />
    </>
  ),
};

/** Decorative icon; the caller provides the accessible name. */
export function WorkKindIcon({ kind }: { kind: WorkKind }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      data-kind={kind}
    >
      {glyphs[kind]}
    </svg>
  );
}
