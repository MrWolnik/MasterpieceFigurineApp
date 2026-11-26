import { LineIcon } from './LineIcon';

/** Arrow around an ellipse: "turn the figurine". */
export function RotateIcon() {
  return (
    <LineIcon>
      <path d="M3 12a9 4 0 0 0 18 0" />
      <path d="M18 9l3 3-3 3" />
    </LineIcon>
  );
}
