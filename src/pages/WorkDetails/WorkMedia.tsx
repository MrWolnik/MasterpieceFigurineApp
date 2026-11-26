import { useTranslation } from 'react-i18next';
import { ImageZoom } from '../../components/ImageZoom/ImageZoom';
import { Turntable } from '../../components/Turntable/Turntable';
import type { Work } from '../../lib/works';
import styles from './WorkDetails.module.css';

interface WorkMediaProps {
  work: Work;
  /** Work title in the active language, used for alt texts and labels. */
  title: string;
}

/** Painting: zoomable image. Figurine: 360° turntable when it has frames, else a photo gallery. */
export function WorkMedia({ work, title }: WorkMediaProps) {
  const { t } = useTranslation();

  if (work.kind === 'painting') {
    return (
      <div className={styles.media}>
        <ImageZoom src={work.image} hiResSrc={work.imageHiRes} alt={title} />
      </div>
    );
  }

  // With a turntable the cover is just one of its frames, so the gallery shows only the details.
  const gallery = work.frames ? work.images : [work.cover, ...work.images];

  return (
    <div className={styles.media}>
      {work.frames && (
        <Turntable slug={work.slug} frames={work.frames} format={work.framesFormat} title={title} />
      )}
      {gallery.length > 0 && (
        <ul className={styles.gallery} aria-label={t('pages.work.gallery')}>
          {gallery.map((src, i) => (
            <li key={src}>
              <ImageZoom
                src={src}
                hiResSrc={src}
                alt={t('pages.work.photo', { title, n: i + 1 })}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
