import { useHydrated } from '../../lib/useHydrated';

interface ProtectedEmailProps {
  address: string;
  /** Accessible name of the link once it is built, e.g. "Send an e-mail: …". */
  label: string;
  className?: string;
}

/**
 * An e-mail link that bots reading static HTML cannot harvest: in static HTML it renders only
 * "user [at] domain" as plain text; the real `mailto:` link is assembled in the browser.
 */
export function ProtectedEmail({ address, label, className }: ProtectedEmailProps) {
  // `false` while rendering static HTML (prerender/SSR), `true` in the browser.
  const ready = useHydrated();
  const [user = '', domain = ''] = address.split('@');

  if (!ready) {
    return (
      <span className={className}>
        {user} [at] {domain}
      </span>
    );
  }

  return (
    <a className={className} href={['mailto:', user, '@', domain].join('')} aria-label={label}>
      {user}
      {'@'}
      {domain}
    </a>
  );
}
