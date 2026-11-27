import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ResponsiveImage } from '../ResponsiveImage/ResponsiveImage';
import styles from './ImageZoom.module.css';
import { ZoomViewer } from './ZoomViewer';
import { ZoomIcon } from '../icons/ZoomIcon';

export interface ImageZoomProps {
  /** Medium-size image shown on the page. */
  src: string;
  /** High-resolution image, loaded only once the viewer is opened. */
  hiResSrc: string;
  alt: string;
  /** Shown width of the preview (`sizes`), so the browser picks the right file. */
  sizes?: string;
}

/** The media column of the work page (WorkDetails.module.css: 3/5 from 60rem). */
const DEFAULT_SIZES = '(min-width: 60rem) 60vw, 100vw';

/**
 * Shows a whole, uncropped image; clicking it opens a full-screen viewer (native modal
 * `<dialog>`: focus trap, Esc and backdrop for free) with wheel, pinch, button and keyboard zoom.
 */
export function ImageZoom({ src, hiResSrc, alt, sizes = DEFAULT_SIZES }: ImageZoomProps) {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog || dialog.open) return;
    dialog.showModal();
    // React applies `autoFocus` before the dialog is shown, so focus the close button explicitly.
    dialog.querySelector<HTMLElement>('[data-autofocus]')?.focus();
  }, [open]);

  function close() {
    dialogRef.current?.close();
  }

  function handleClosed() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-label={t('imageZoom.open', { alt })}
        aria-haspopup="dialog"
        onClick={() => {
          setOpen(true);
        }}
      >
        <ResponsiveImage
          className={styles.preview}
          src={src}
          alt={alt}
          sizes={sizes}
          loading="eager"
        />
        <span className={styles.zoomBadge} aria-hidden="true">
          <ZoomIcon />
        </span>
      </button>
      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-label={t('imageZoom.dialog', { alt })}
        onClose={handleClosed}
      >
        {open && <ZoomViewer src={src} hiResSrc={hiResSrc} alt={alt} onClose={close} />}
      </dialog>
    </>
  );
}
