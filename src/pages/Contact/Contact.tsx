import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';
import { About } from '../../components/About/About';
import { ContactDetails } from '../../components/ContactDetails/ContactDetails';
import { OrderForm } from '../../components/OrderForm/OrderForm';
import { PageShell } from '../../components/PageShell/PageShell';
import { submitOrder } from '../../lib/submitOrder';
import { useReveal } from '../../lib/useReveal';
import styles from './Contact.module.css';

/** Contact page: about Julia, contact details and the order form. */
export function Contact() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  // A new ?kind= or ?ref= (e.g. the header's plain "Contact" link after "I want a similar one")
  // must give a fresh, re-prefilled form; the form reads its prefill only when it mounts.
  // (Not on hydration: the prerendered form is kept and OrderForm fills the prefill in.)
  const prefillKey = `${params.get('kind') ?? ''}|${params.get('ref') ?? ''}`;
  const header = useReveal<HTMLDivElement>({ className: styles.header });
  const side = useReveal<HTMLDivElement>({ className: styles.side, delay: 100 });
  const form = useReveal<HTMLDivElement>({ delay: 200 });

  return (
    <PageShell>
      <div {...header}>
        <h1>{t('pages.contact.title')}</h1>
        <p className={styles.intro}>{t('pages.contact.intro')}</p>
      </div>
      <div className={styles.layout}>
        <div {...side}>
          <About />
          <ContactDetails />
        </div>
        {/* A wrapper, so the form's own markup stays untouched. Only the form is keyed:
            a new prefill remounts it without replaying the reveal. */}
        <div {...form}>
          <OrderForm key={prefillKey} onSubmit={submitOrder} />
        </div>
      </div>
    </PageShell>
  );
}
