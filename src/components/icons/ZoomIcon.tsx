import { LineIcon } from './LineIcon';

/** Magnifier with a plus. */
export function ZoomIcon() {
  return (
    <LineIcon strokeWidth={1.8}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5L21 21M10.5 7.5v6M7.5 10.5h6" />
    </LineIcon>
  );
}
