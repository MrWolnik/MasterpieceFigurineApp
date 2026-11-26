import { describe, expect, it } from 'vitest';
import { acceptFiles, MAX_FILE_BYTES } from './acceptFiles';

const image = (name: string, size = 10, type = 'image/png') =>
  new File([new Uint8Array(size)], name, { type });

describe('acceptFiles', () => {
  it.each([
    ['a.jpg', 'image/jpeg'],
    ['b.png', 'image/png'],
    ['c.webp', 'image/webp'],
    ['d.gif', 'image/gif'],
  ])('accepts %s', (name, type) => {
    expect(acceptFiles([], [image(name, 1, type)]).files).toHaveLength(1);
  });

  it('rejects other types, files over 5 MB and a second file', () => {
    const result = acceptFiles(
      [image('1.png')],
      [
        image('doc.pdf', 1, 'application/pdf'),
        image('big.png', MAX_FILE_BYTES + 1),
        image('2.png'),
      ],
    );

    expect(result.files.map((file) => file.name)).toEqual(['1.png']);
    expect(result.rejected).toEqual([
      { name: 'doc.pdf', reason: 'type' },
      { name: 'big.png', reason: 'size' },
      { name: '2.png', reason: 'count' },
    ]);
  });

  it('accepts a file of exactly 5 MB', () => {
    expect(acceptFiles([], [image('max.png', MAX_FILE_BYTES)]).files).toHaveLength(1);
  });
});
