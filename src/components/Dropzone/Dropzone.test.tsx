import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../../test/test-utils';
import { Dropzone } from './Dropzone';

const image = (name: string, size = 10, type = 'image/png') =>
  new File([new Uint8Array(size)], name, { type });

function Harness({ initial = [] }: { initial?: File[] }) {
  const [files, setFiles] = useState(initial);
  return <Dropzone label="Zdjęcia" hint="Podpowiedź." files={files} onChange={setFiles} />;
}

function setup(initial: File[] = []) {
  renderWithProviders(<Harness initial={initial} />);
  // Without applyAccept the test can hand the input a PDF, like a drag and drop could.
  return { user: userEvent.setup({ applyAccept: false }), input: screen.getByLabelText('Zdjęcia') };
}

const previews = () => screen.queryAllByRole('listitem');

describe('Dropzone', () => {
  it('adds a picked image with a thumbnail, also an animated GIF', async () => {
    const { user, input } = setup();

    await user.upload(input, image('b.gif', 10, 'image/gif'));

    expect(previews()).toHaveLength(1);
    expect(screen.getByText('b.gif')).toBeInTheDocument();
    expect(screen.getAllByRole('presentation')[0]).toHaveAttribute(
      'src',
      expect.stringMatching(/^blob:/),
    );
  });

  it('rejects a PDF', async () => {
    const { user, input } = setup();

    await user.upload(input, image('cv.pdf', 10, 'application/pdf'));

    expect(previews()).toHaveLength(0);
    expect(screen.getByRole('status')).toHaveTextContent(
      'cv.pdf: dozwolone są tylko pliki JPG, PNG, WEBP i GIF.',
    );
  });

  it('rejects a 6 MB file', async () => {
    const { user, input } = setup();

    await user.upload(input, image('big.jpg', 6 * 1024 * 1024, 'image/jpeg'));

    expect(previews()).toHaveLength(0);
    expect(screen.getByRole('status')).toHaveTextContent('big.jpg: plik jest większy niż 5 MB.');
  });

  it('rejects a second file', async () => {
    const { user, input } = setup([image('1.png')]);

    await user.upload(input, image('2.png'));

    expect(previews()).toHaveLength(1);
    expect(screen.getByRole('status')).toHaveTextContent(
      '2.png: możesz dodać tylko 1 plik – najpierw usuń obecny.',
    );
  });

  it('removes a file', async () => {
    const { user } = setup([image('1.png')]);

    await user.click(screen.getByRole('button', { name: 'Usuń plik 1.png' }));

    expect(previews()).toHaveLength(0);
    expect(screen.queryByText('1.png')).not.toBeInTheDocument();
  });

  it('accepts a file dropped onto the area', () => {
    setup();

    fireEvent.drop(screen.getByText('Przeciągnij i upuść zdjęcie tutaj'), {
      dataTransfer: { files: [image('dropped.webp', 10, 'image/webp')] },
    });

    expect(screen.getByText('dropped.webp')).toBeInTheDocument();
  });
});
