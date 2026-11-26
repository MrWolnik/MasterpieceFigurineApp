import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ChevronDownIcon } from './ChevronDownIcon';
import { LineIcon } from './LineIcon';
import { RotateIcon } from './RotateIcon';
import { ZoomIcon } from './ZoomIcon';

describe('LineIcon', () => {
  it('renders a decorative, sized svg with its glyph and data attributes', () => {
    const { container } = render(
      <LineIcon size={18} strokeWidth={2} data-kind="x">
        <circle r="1" />
      </LineIcon>,
    );
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('width', '18');
    expect(svg).toHaveAttribute('stroke-width', '2');
    expect(svg).toHaveAttribute('data-kind', 'x');
    expect(svg?.querySelector('circle')).not.toBeNull();
  });

  it.each([
    ['RotateIcon', RotateIcon],
    ['ZoomIcon', ZoomIcon],
    ['ChevronDownIcon', ChevronDownIcon],
  ])('%s renders a hidden icon', (_name, Icon) => {
    const { container } = render(<Icon />);
    expect(container.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
  });
});
