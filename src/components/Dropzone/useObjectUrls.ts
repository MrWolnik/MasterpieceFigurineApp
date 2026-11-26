import { useEffect, useMemo } from 'react';

/** Preview URLs for files (GIFs keep animating in an `<img>`); revoked when files change. */
export function useObjectUrls(files: readonly File[]): string[] {
  const urls = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);

  useEffect(
    () => () => {
      urls.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    },
    [urls],
  );

  return urls;
}
