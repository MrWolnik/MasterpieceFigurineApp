export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;
export const MAX_FILE_BYTES = 5 * 1024 * 1024;
export const MAX_FILE_COUNT = 3;

export type RejectReason = 'type' | 'size' | 'count';

export interface Rejection {
  name: string;
  reason: RejectReason;
}

export interface AcceptResult {
  files: File[];
  rejected: Rejection[];
}

/** Adds `incoming` to `current`, keeping only allowed images up to 5 MB and 3 files in total. */
export function acceptFiles(current: readonly File[], incoming: readonly File[]): AcceptResult {
  const files = [...current];
  const rejected: Rejection[] = [];

  for (const file of incoming) {
    if (!(ACCEPTED_TYPES as readonly string[]).includes(file.type)) {
      rejected.push({ name: file.name, reason: 'type' });
    } else if (file.size > MAX_FILE_BYTES) {
      rejected.push({ name: file.name, reason: 'size' });
    } else if (files.length >= MAX_FILE_COUNT) {
      rejected.push({ name: file.name, reason: 'count' });
    } else {
      files.push(file);
    }
  }

  return { files, rejected };
}
