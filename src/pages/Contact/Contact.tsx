import { useTranslation } from 'react-i18next';
import { About } from '../../components/About/About';
import { ContactDetails } from '../../components/ContactDetails/ContactDetails';
import { OrderForm } from '../../components/OrderForm/OrderForm';
import styles from './Contact.module.css';

// Replaced by the Netlify Forms submission in Z3.5.
const submitOrder = () => Promise.resolve();

/** Contact page: about Julia, contact details and the order form. */
export function Contact() {
  const { t } = useTranslation();

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
        <OrderForm onSubmit={submitOrder} />
      </div>
    </div>
  );
}
