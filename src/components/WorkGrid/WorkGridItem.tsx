import { useReveal } from '../../lib/useReveal';
import type { Work } from '../../lib/works';
import { WorkCard } from '../WorkCard/WorkCard';

/** Tiles in a row of up to 4 come in one after another, this far apart. */
export const TILE_STAGGER_MS = 80;
const ROW_LENGTH = 4;

interface WorkGridItemProps {
  work: Work;
  /** Position in the grid, used to stagger the tiles of one row. */
  index: number;
  eager: boolean;
  headingLevel: 2 | 3;
}

/** One grid tile that fades in when it scrolls into view. */
export function WorkGridItem({ work, index, eager, headingLevel }: WorkGridItemProps) {
  const reveal = useReveal<HTMLLIElement>({ delay: (index % ROW_LENGTH) * TILE_STAGGER_MS });

  return (
    <li {...reveal}>
      <WorkCard work={work} eager={eager} headingLevel={headingLevel} />
    </li>
  );
}
