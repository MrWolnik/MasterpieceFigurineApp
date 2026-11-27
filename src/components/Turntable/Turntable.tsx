import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import { useTranslation } from 'react-i18next';
import styles from './Turntable.module.css';
import { frameAngle, frameFromDrag, framePath, wrapFrame } from './turntableMath';
import { useAutoRotate } from './useAutoRotate';
import { useFramePreloader } from './useFramePreloader';
import { RotateIcon } from '../icons/RotateIcon';

interface TurntableProps {
  /** Work slug; frames live in `/works/<slug>/frames/`. */
  slug: string;
  /** Number of frames in a full turn. */
  frames: number;
  /** Frame file extension, e.g. `webp` → `/works/<slug>/frames/001.webp`. */
  format: string;
  /** Work title, used in the accessible name. */
  title: string;
  /** Spin slowly until the user interacts (never with reduced motion). */
  autoRotate?: boolean;
}

interface Drag {
  pointerId: number;
  startX: number;
  startFrame: number;
  pxPerFrame: number;
}

/**
 * 360° view built from photos taken on a turntable. Rotate by dragging (mouse, pen or touch)
 * or with the arrow keys. Exposed as a slider whose value is the rotation angle.
 */
export function Turntable({ slug, frames, format, title, autoRotate = true }: TurntableProps) {
  const { t } = useTranslation();
  const rootRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<Drag | null>(null);
  const [frame, setFrame] = useState(0);
  const [interacted, setInteracted] = useState(false);
  // Set synchronously on the first interaction: the interval may still fire once before React
  // re-renders and clears it, and that late step must not move the frame under the user.
  const interactedRef = useRef(false);

  const urls = useMemo(
    () => Array.from({ length: frames }, (_, i) => framePath(slug, i, format)),
    [slug, frames, format],
  );
  const loaded = useFramePreloader(urls);
  const ready = loaded >= frames;

  const step = useCallback(() => {
    if (interactedRef.current) return;
    setFrame((current) => wrapFrame(current + 1, frames));
  }, [frames]);
  useAutoRotate(rootRef, autoRotate && ready && !interacted, step);

  function stopAutoRotate() {
    interactedRef.current = true;
    setInteracted(true);
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    stopAutoRotate();
    event.currentTarget.setPointerCapture(event.pointerId);
    const width = event.currentTarget.getBoundingClientRect().width || frames;
    // One full turn per component width feels natural on both phones and desktops.
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startFrame: frame,
      pxPerFrame: Math.max(width / frames, 1),
    };
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (drag?.pointerId !== event.pointerId) return;
    setFrame(frameFromDrag(drag.startFrame, event.clientX - drag.startX, frames, drag.pxPerFrame));
  }

  function handlePointerEnd(event: PointerEvent<HTMLDivElement>) {
    if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null;
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const moves: Partial<Record<string, (current: number) => number>> = {
      ArrowRight: (current) => current + 1,
      ArrowUp: (current) => current + 1,
      ArrowLeft: (current) => current - 1,
      ArrowDown: (current) => current - 1,
      Home: () => 0,
      End: () => frames - 1,
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    stopAutoRotate();
    setFrame((current) => wrapFrame(move(current), frames));
  }

  const angle = frameAngle(frame, frames);

  return (
    <figure className={styles.turntable}>
      <div
        ref={rootRef}
        className={styles.stage}
        role="slider"
        tabIndex={0}
        aria-label={t('turntable.label', { title })}
        aria-valuemin={0}
        aria-valuemax={frameAngle(frames - 1, frames)}
        aria-valuenow={angle}
        aria-valuetext={t('turntable.angle', { angle })}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onKeyDown={handleKeyDown}
        onFocus={stopAutoRotate}
      >
        <img
          className={styles.frame}
          src={urls[frame]}
          alt=""
          draggable={false}
          data-frame={frame}
        />
        {!ready && (
          <div
            className={styles.progress}
            role="progressbar"
            aria-label={t('turntable.loading')}
            aria-valuemin={0}
            aria-valuemax={frames}
            aria-valuenow={loaded}
          >
            <span style={{ width: `${String((loaded / frames) * 100)}%` }} />
          </div>
        )}
      </div>
      <figcaption className={styles.hint} data-hidden={interacted}>
        <RotateIcon />
        {t('turntable.hint')}
      </figcaption>
    </figure>
  );
}
