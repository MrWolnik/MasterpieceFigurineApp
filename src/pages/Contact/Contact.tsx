import { useTranslation } from 'react-i18next';
import { About } from '../../components/About/About';
import { ContactDetails } from '../../components/ContactDetails/ContactDetails';
import { OrderForm } from '../../components/OrderForm/OrderForm';
import { submitOrder } from '../../lib/submitOrder';
import { useReveal } from '../../lib/useReveal';
import styles from './Contact.module.css';

/** Contact page: about Julia, contact details and the order form. */
export function Contact() {
  const { t } = useTranslation();
  const header = useReveal<HTMLDivElement>({ className: styles.header });
  const side = useReveal<HTMLDivElement>({ className: styles.side, delay: 100 });
  const form = useReveal<HTMLDivElement>({ delay: 200 });

  return (
    <div className={styles.page}>
      <div {...header}>
        <h1>{t('pages.contact.title')}</h1>
        <p className={styles.intro}>{t('pages.contact.intro')}</p>
      </div>
      <div className={styles.layout}>
        <div {...side}>
          <About />
          <ContactDetails />
        </div>
        {/* A wrapper, so the form's own markup stays untouched. */}
        <div {...form}>
          <OrderForm onSubmit={submitOrder} />
        </div>
      </div>
    </div>
  );
}
