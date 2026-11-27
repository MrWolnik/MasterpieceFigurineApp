import { useId, useRef, useState, type DragEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { ACCEPTED_TYPES, acceptFiles, type Rejection } from '../../lib/acceptFiles';
import styles from './Dropzone.module.css';
import { useObjectUrls } from './useObjectUrls';

interface DropzoneProps {
  label: string;
  hint: string;
  files: File[];
  onChange: (files: File[]) => void;
  /** Name of the hidden file input, so a static form copy can declare the field. */
  name?: string;
}

/** Drag-and-drop or pick one image (up to 5 MB), with thumbnails and removal. */
export function Dropzone({ label, hint, files, onChange, name }: DropzoneProps) {
  const { t } = useTranslation();
  const inputId = useId();
  const hintId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [rejected, setRejected] = useState<Rejection[]>([]);
  const urls = useObjectUrls(files);

  function add(incoming: FileList | null) {
    if (!incoming) return;
    const result = acceptFiles(files, Array.from(incoming));
    setRejected(result.rejected);
    if (result.files.length !== files.length) onChange(result.files);
  }

  function remove(index: number) {
    setRejected([]);
    onChange(files.filter((_, i) => i !== index));
    inputRef.current?.focus();
  }

  function onDrop(event: DragEvent) {
    event.preventDefault();
    setDragging(false);
    add(event.dataTransfer.files);
  }

  return (
    <div className={styles.dropzone}>
      <span className={styles.label} aria-hidden="true">
        {label}
      </span>
      <label
        htmlFor={inputId}
        className={[styles.area, dragging ? styles.dragging : ''].join(' ')}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(event) => {
          // Moving over the texts inside the area also fires dragleave; ignore it.
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false);
        }}
        onDrop={onDrop}
      >
        <span>{t('form.files.drop')}</span>
        <span className={styles.browse}>{t('form.files.browse')}</span>
      </label>
      <input
        ref={inputRef}
        id={inputId}
        className={styles.input}
        type="file"
        name={name}
        accept={ACCEPTED_TYPES.join(',')}
        aria-label={label} // not aria-labelledby: that crashes Firefox under axe
        aria-describedby={hintId}
        onChange={(event) => {
          add(event.target.files);
          event.target.value = ''; // picking the same file again must fire `change`
        }}
      />
      <p id={hintId} className={styles.hint}>
        {hint} {t('form.files.limits')}
      </p>

      <div role="status" className={styles.errors}>
        {rejected.map(({ name: fileName, reason }) => (
          <p key={`${fileName}-${reason}`}>
            {t(`form.files.rejected.${reason}`, { name: fileName })}
          </p>
        ))}
      </div>

      {files.length > 0 && (
        <ul className={styles.previews} aria-label={t('form.files.selected')}>
          {files.map((file, index) => (
            <li
              key={`${file.name}-${String(file.lastModified)}-${String(index)}`}
              className={styles.preview}
            >
              <img src={urls[index]} alt="" />
              <span className={styles.name}>{file.name}</span>
              <button
                type="button"
                className={styles.remove}
                aria-label={t('form.files.remove', { name: file.name })}
                onClick={() => {
                  remove(index);
                }}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
