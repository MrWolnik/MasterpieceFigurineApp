import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './ImageZoom.module.css';
import { ZoomViewer } from './ZoomViewer';

export interface ImageZoomProps {
  /** Medium-size image shown on the page. */
  src: string;
  /** High-resolution image, loaded only once the viewer is opened. */
  hiResSrc: string;
  alt: string;
}

/**
 * Shows a whole, uncropped image; clicking it opens a full-screen viewer (native modal
 * `<dialog>`: focus trap, Esc and backdrop for free) with wheel, pinch, button and keyboard zoom.
 */
export function ImageZoom({ src, hiResSrc, alt }: ImageZoomProps) {
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
        <img className={styles.preview} src={src} alt={alt} />
        <span className={styles.zoomBadge} aria-hidden="true">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden="true"
            focusable="false"
          >
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="M15.5 15.5L21 21M10.5 7.5v6M7.5 10.5h6" />
          </svg>
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
