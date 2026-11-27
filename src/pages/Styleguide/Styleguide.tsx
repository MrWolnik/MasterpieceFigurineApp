import { I18nextProvider } from 'react-i18next';
import { ImageZoom } from '../../components/ImageZoom/ImageZoom';
import { PageShell } from '../../components/PageShell/PageShell';
import { Turntable } from '../../components/Turntable/Turntable';
import { createI18n } from '../../lib/i18n';
import styles from './Styleguide.module.css';
import { colorTokens } from './styleguideTokens';

/*
 * Dev-only reference page for design tokens (served at /styleguide in `npm run dev` only).
 * It is a developer tool, not user-facing content, so its labels are intentionally not
 * translated and do not live in pl.json / en.json.
 */

const headingLevels = [
  { Tag: 'h1', token: '--text-4xl' },
  { Tag: 'h2', token: '--text-3xl' },
  { Tag: 'h3', token: '--text-2xl' },
  { Tag: 'h4', token: '--text-xl' },
] as const;

const spacingTokens = ['1', '2', '3', '4', '6', '8', '12', '16', '24'] as const;

// The styleguide lives outside the language routes, so components get their own i18n instance.
const demoI18n = createI18n('pl');

const POLISH_SAMPLE = 'Zażółć gęślą jaźń — ĄĆĘŁŃÓŚŹŻ ąćęłńóśźż';

export function Styleguide() {
  return (
    <PageShell as="main" className={styles.page}>
      <header className={styles.header}>
        <h1>Styleguide</h1>
        <p className={styles.muted}>Design tokens from src/styles/tokens.css. Dev only.</p>
      </header>

      <section aria-labelledby="sg-colors" className={styles.section}>
        <h2 id="sg-colors">Colours</h2>
        <ul className={styles.swatches}>
          {colorTokens.map(({ name, usage }) => (
            <li key={name} className={styles.swatch}>
              <span
                className={styles.swatchColor}
                style={{ backgroundColor: `var(--color-${name})` }}
                aria-hidden="true"
              />
              <code>--color-{name}</code>
              <span className={styles.muted}>{usage}</span>
            </li>
          ))}
        </ul>
        <div className={styles.row}>
          <p className={styles.onError}>Text on error background</p>
          <p className={styles.errorText}>Error message text</p>
        </div>
      </section>

      <section aria-labelledby="sg-type" className={styles.section}>
        <h2 id="sg-type">Typography</h2>
        {headingLevels.map(({ Tag, token }) => (
          <div key={Tag} className={styles.typeRow}>
            <code className={styles.muted}>
              {Tag} · {token}
            </code>
            <Tag>{POLISH_SAMPLE}</Tag>
          </div>
        ))}
        <div className={styles.typeRow}>
          <code className={styles.muted}>body · Inter</code>
          <p>{POLISH_SAMPLE}</p>
          <p className={styles.muted}>
            Secondary text. Julia paints miniatures and canvases; every commission is quoted
            individually.
          </p>
          <p>
            <a href="#sg-type">Accent link</a>
          </p>
        </div>
      </section>

      <section aria-labelledby="sg-spacing" className={styles.section}>
        <h2 id="sg-spacing">Spacing</h2>
        <ul className={styles.spacing}>
          {spacingTokens.map((step) => (
            <li key={step} className={styles.spacingRow}>
              <code>--space-{step}</code>
              <span className={styles.spacingBar} style={{ width: `var(--space-${step})` }} />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="sg-shape" className={styles.section}>
        <h2 id="sg-shape">Shape, elevation and focus</h2>
        <div className={styles.row}>
          <div className={styles.card}>--radius-md · --shadow-md</div>
          <div className={`${styles.card ?? ''} ${styles.cardAccent ?? ''}`}>--shadow-accent</div>
          <button type="button" className={styles.focusDemo}>
            Tab to see focus ring
          </button>
        </div>
      </section>
      <section aria-labelledby="sg-turntable" className={styles.section}>
        <h2 id="sg-turntable">Turntable</h2>
        <div className={styles.demo}>
          <I18nextProvider i18n={demoI18n}>
            <Turntable slug="nocny-wartownik" frames={36} format="svg" title="Nocny wartownik" />
          </I18nextProvider>
        </div>
      </section>
      <section aria-labelledby="sg-image-zoom" className={styles.section}>
        <h2 id="sg-image-zoom">Image zoom</h2>
        <div className={styles.demo}>
          <I18nextProvider i18n={demoI18n}>
            <ImageZoom
              src="/works/mgla-nad-bagnem/full.svg"
              hiResSrc="/works/mgla-nad-bagnem/full@2x.svg"
              alt="Mgła nad bagnem"
            />
          </I18nextProvider>
        </div>
      </section>
    </PageShell>
  );
}
