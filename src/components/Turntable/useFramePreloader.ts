import { useEffect, useState } from 'react';

/**
 * Loads `urls` in the background, in order (the first frame is requested first), and returns
 * how many have finished. Failed frames count as finished so the progress never gets stuck.
 */
export function useFramePreloader(urls: readonly string[]): number {
  const key = urls.join('|');
  // Progress is stored with the frame set it belongs to, so a new set starts again from 0
  // without resetting state inside the effect.
  const [progress, setProgress] = useState({ key, loaded: 0 });

  useEffect(() => {
    let cancelled = false;
    const images = urls.map((url) => {
      const image = new Image();
      const done = () => {
        if (!cancelled) {
          setProgress((current) =>
            current.key === key ? { key, loaded: current.loaded + 1 } : { key, loaded: 1 },
          );
        }
      };
      image.onload = done;
      image.onerror = done;
      image.src = url;
      return image;
    });
    return () => {
      cancelled = true;
      for (const image of images) {
        image.onload = null;
        image.onerror = null;
      }
    };
    // `key` stands in for `urls`, so a new array with the same frames does not reload them.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return progress.key === key ? progress.loaded : 0;
}
