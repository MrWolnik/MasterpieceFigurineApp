import { describe, expect, it } from 'vitest';
import { acceptFiles, MAX_FILE_BYTES } from './acceptFiles';

const image = (name: string, size = 10, type = 'image/png') =>
  new File([new Uint8Array(size)], name, { type });

describe('acceptFiles', () => {
  it('accepts jpg, png, webp and gif', () => {
    const incoming = [
      image('a.jpg', 1, 'image/jpeg'),
      image('b.png'),
      image('c.gif', 1, 'image/gif'),
    ];
    expect(acceptFiles([], incoming).files).toHaveLength(3);
    expect(acceptFiles([], [image('d.webp', 1, 'image/webp')]).rejected).toEqual([]);
  });

  it('rejects other types, files over 5 MB and a 4th file', () => {
    const current = [image('1.png'), image('2.png')];
    const result = acceptFiles(current, [
      image('doc.pdf', 1, 'application/pdf'),
      image('big.png', MAX_FILE_BYTES + 1),
      image('3.png'),
      image('4.png'),
    ]);

    expect(result.files.map((file) => file.name)).toEqual(['1.png', '2.png', '3.png']);
    expect(result.rejected).toEqual([
      { name: 'doc.pdf', reason: 'type' },
      { name: 'big.png', reason: 'size' },
      { name: '4.png', reason: 'count' },
    ]);
  });

  it('accepts a file of exactly 5 MB', () => {
    expect(acceptFiles([], [image('max.png', MAX_FILE_BYTES)]).files).toHaveLength(1);
  });
});
