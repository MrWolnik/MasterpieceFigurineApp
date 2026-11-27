import { useTranslation } from 'react-i18next';
import { ImageZoom } from '../../components/ImageZoom/ImageZoom';
import { Turntable } from '../../components/Turntable/Turntable';
import { useReveal } from '../../lib/useReveal';
import type { Work } from '../../lib/works';
import styles from './WorkDetails.module.css';

interface WorkMediaProps {
  work: Work;
  /** Work title in the active language, used for alt texts and labels. */
  title: string;
}

/**
 * Painting: zoomable image. Figurine: 360° turntable when it has frames, otherwise its cover as a
 * zoomable image like a painting. Extra photos of a figurine follow as a gallery.
 */
export function WorkMedia({ work, title }: WorkMediaProps) {
  const { t } = useTranslation();
  const reveal = useReveal<HTMLDivElement>({ className: styles.media });

  if (work.kind === 'painting') {
    return (
      <div {...reveal}>
        <ImageZoom src={work.image} hiResSrc={work.imageHiRes} alt={title} />
      </div>
    );
  }

  const gallery = work.images;

  return (
    <div {...reveal}>
      {work.frames ? (
        <Turntable slug={work.slug} frames={work.frames} format={work.framesFormat} title={title} />
      ) : (
        <ImageZoom src={work.cover} hiResSrc={work.cover} alt={title} />
      )}
      {gallery.length > 0 && (
        <ul className={styles.gallery} aria-label={t('pages.work.gallery')}>
          {gallery.map((src, i) => (
            <li key={src}>
              <ImageZoom
                src={src}
                hiResSrc={src}
                // Gallery thumbnails, at least 9rem wide (WorkDetails.module.css).
                sizes="(min-width: 60rem) 15vw, 33vw"
                alt={t('pages.work.photo', { title, n: i + 1 })}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
