import { render, screen } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ProtectedEmail } from './ProtectedEmail';

const address = 'anna@example.com';

describe('ProtectedEmail', () => {
  it('keeps the address out of the static HTML', () => {
    const html = renderToStaticMarkup(<ProtectedEmail address={address} label="Mail" />);

    expect(html).not.toContain(address);
    expect(html).not.toContain('mailto:');
    expect(html).toContain('anna [at] example.com');
  });

  it('builds the mailto link in the browser', () => {
    render(<ProtectedEmail address={address} label="Send an e-mail" />);

    const link = screen.getByRole('link', { name: 'Send an e-mail' });
    expect(link).toHaveAttribute('href', `mailto:${address}`);
    expect(link).toHaveTextContent(address);
  });
});
