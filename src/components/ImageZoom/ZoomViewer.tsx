import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import type { ImageZoomProps } from './ImageZoom';
import styles from './ImageZoom.module.css';
import { useZoomGestures } from './useZoomGestures';
import { MAX_SCALE, MIN_SCALE, ZOOM_STEP } from './zoomMath';

/** Arrow-key pan distance in px. */
const KEY_PAN = 60;

interface ZoomViewerProps extends ImageZoomProps {
  onClose: () => void;
}

/** Contents of the open viewer: toolbar, zoomable stage and hint. */
export function ZoomViewer({ src, hiResSrc, alt, onClose }: ZoomViewerProps) {
  const { t } = useTranslation();
  const stageRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const { state, zoomBy, pan, reset, handlers } = useZoomGestures(stageRef, imageRef);
  const [hiResLoaded, setHiResLoaded] = useState(false);

  // Fetch the large file only now that the viewer is open, then swap it in.
  useEffect(() => {
    const image = new Image();
    image.onload = () => {
      setHiResLoaded(true);
    };
    image.src = hiResSrc;
    return () => {
      image.onload = null;
    };
  }, [hiResSrc]);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const actions: Partial<Record<string, () => void>> = {
      // Handled here too (not only by the native `cancel`) so Esc always closes the viewer.
      Escape: onClose,
      '+': () => {
        zoomBy(ZOOM_STEP);
      },
      '=': () => {
        zoomBy(ZOOM_STEP);
      },
      '-': () => {
        zoomBy(1 / ZOOM_STEP);
      },
      '0': reset,
      ArrowLeft: () => {
        pan(KEY_PAN, 0);
      },
      ArrowRight: () => {
        pan(-KEY_PAN, 0);
      },
      ArrowUp: () => {
        pan(0, KEY_PAN);
      },
      ArrowDown: () => {
        pan(0, -KEY_PAN);
      },
    };
    const action = actions[event.key];
    if (!action) return;
    event.preventDefault();
    action();
  }

  const percent = Math.round(state.scale * 100);

  return (
    // Keyboard shortcuts work anywhere inside the dialog, so the wrapper listens for them.
    <div className={styles.viewer} onKeyDown={handleKeyDown}>
      <div className={styles.toolbar}>
        <button
          type="button"
          className={styles.tool}
          aria-label={t('imageZoom.zoomOut')}
          disabled={state.scale <= MIN_SCALE}
          onClick={() => {
            zoomBy(1 / ZOOM_STEP);
          }}
        >
          −
        </button>
        <output className={styles.level} aria-live="polite">
          {t('imageZoom.level', { percent })}
        </output>
        <button
          type="button"
          className={styles.tool}
          aria-label={t('imageZoom.zoomIn')}
          disabled={state.scale >= MAX_SCALE}
          onClick={() => {
            zoomBy(ZOOM_STEP);
          }}
        >
          +
        </button>
        <button
          type="button"
          className={styles.tool}
          disabled={state.scale === MIN_SCALE}
          onClick={reset}
        >
          {t('imageZoom.reset')}
        </button>
        <button
          type="button"
          className={[styles.tool, styles.close].join(' ')}
          aria-label={t('imageZoom.close')}
          onClick={onClose}
          data-autofocus
        >
          ✕
        </button>
      </div>
      <div
        ref={stageRef}
        className={styles.stage}
        data-zoomed={state.scale > 1}
        data-testid="zoom-stage"
        {...handlers}
      >
        <img
          ref={imageRef}
          className={styles.image}
          src={hiResLoaded ? hiResSrc : src}
          alt={alt}
          draggable={false}
          style={{
            transform: `translate(${String(state.x)}px, ${String(state.y)}px) scale(${String(state.scale)})`,
          }}
        />
      </div>
      <p className={styles.hint}>{t('imageZoom.hint')}</p>
    </div>
  );
}
