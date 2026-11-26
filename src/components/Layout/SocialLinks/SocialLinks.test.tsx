import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { SocialLink } from '../../../config/site';
import { renderWithProviders } from '../../../test/test-utils';
import { SocialLinks } from './SocialLinks';

const socials: SocialLink[] = [
  { id: 'instagram', label: 'Instagram', url: 'https://instagram.com/julia' },
  { id: 'facebook', label: 'Facebook', url: '' },
  { id: 'tiktok', label: 'TikTok', url: '   ' },
  { id: 'youtube', label: 'YouTube', url: 'https://youtube.com/@julia' },
];

const empty: SocialLink[] = socials.map((social) => ({ ...social, url: '' }));

describe('SocialLinks', () => {
  it('renders only entries with a link, opening in a new tab safely', () => {
    renderWithProviders(<SocialLinks socials={socials} />);

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(2);

    const instagram = screen.getByRole('link', {
      name: 'Instagram (otwiera się w nowej karcie)',
    });
    expect(instagram).toHaveAttribute('href', 'https://instagram.com/julia');
    expect(instagram).toHaveAttribute('target', '_blank');
    expect(instagram).toHaveAttribute('rel', 'noopener noreferrer');
    expect(
      screen.getByRole('link', { name: 'YouTube (otwiera się w nowej karcie)' }),
    ).toHaveAttribute('href', 'https://youtube.com/@julia');
    expect(screen.queryByRole('link', { name: /Facebook|TikTok/ })).not.toBeInTheDocument();
  });

  it('keeps the order of the config', () => {
    renderWithProviders(<SocialLinks socials={socials} />, { language: 'en' });

    expect(screen.getAllByRole('link').map((link) => link.getAttribute('aria-label'))).toEqual([
      'Instagram (opens in a new tab)',
      'YouTube (opens in a new tab)',
    ]);
  });

  it('renders nothing when no link is set (production)', () => {
    const { container } = renderWithProviders(<SocialLinks socials={empty} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('shows grey placeholders when no link is set and placeholders are enabled (dev)', () => {
    renderWithProviders(<SocialLinks socials={empty} showPlaceholders />);

    expect(screen.queryAllByRole('link')).toHaveLength(0);
    expect(screen.getAllByRole('img')).toHaveLength(4);
    expect(
      screen.getByRole('img', { name: 'Instagram (link jeszcze nieustawiony)' }),
    ).toBeInTheDocument();
  });

  it('shows no placeholders once any link is set', () => {
    renderWithProviders(<SocialLinks socials={socials} showPlaceholders />);

    expect(screen.queryAllByRole('img')).toHaveLength(0);
    expect(screen.getAllByRole('link')).toHaveLength(2);
  });
});
