import { useTranslation } from 'react-i18next';

// Placeholder shell. Routing, language switching and layout arrive in Z0.5–Z0.6.
function App() {
  const { t } = useTranslation();

  return (
    <main>
      <h1>{t('app.title')}</h1>
      <p>{t('app.tagline')}</p>
    </main>
  );
}

export default App;
