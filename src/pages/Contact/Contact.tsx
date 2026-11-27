import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';
import { About } from '../../components/About/About';
import { ContactDetails } from '../../components/ContactDetails/ContactDetails';
import { OrderForm } from '../../components/OrderForm/OrderForm';
import { submitOrder } from '../../lib/submitOrder';
import styles from './Contact.module.css';

/** Contact page: about Julia, contact details and the order form. */
export function Contact() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  // A new ?kind= or ?ref= (e.g. the header's plain "Contact" link after "I want a similar one")
  // must give a fresh, re-prefilled form; the form reads its prefill only when it mounts.
  const prefillKey = `${params.get('kind') ?? ''}|${params.get('ref') ?? ''}`;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>{t('pages.contact.title')}</h1>
        <p className={styles.intro}>{t('pages.contact.intro')}</p>
      </div>
      <div className={styles.layout}>
        <div className={styles.side}>
          <About />
          <ContactDetails />
        </div>
        <OrderForm key={prefillKey} onSubmit={submitOrder} />
      </div>
    </div>
  );
}
