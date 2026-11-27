import type { ReactNode } from 'react';
import styles from './PageShell.module.css';

interface PageShellProps {
  /** The element to render: a work or the policy is an `article`; the styleguide has no layout. */
  as?: 'div' | 'article' | 'main';
  /** The page's own class; it may set the `--page-*` properties (see PageShell.module.css). */
  className?: string;
  children: ReactNode;
}

/** The shared outer container of every page. */
export function PageShell({ as: Element = 'div', className, children }: PageShellProps) {
  return (
    <Element className={[styles.shell, className].filter(Boolean).join(' ')}>{children}</Element>
  );
}
