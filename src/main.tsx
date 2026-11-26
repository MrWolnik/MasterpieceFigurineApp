import '@fontsource-variable/cinzel';
import '@fontsource-variable/inter';
import './styles/tokens.css';
import './styles/global.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import { RouterProvider } from 'react-router/dom';
import { createI18n } from './lib/i18n';
import { createAppRouter } from './router';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root not found');
}

const i18n = createI18n();
const router = createAppRouter(i18n);

createRoot(rootElement).render(
  <StrictMode>
    <I18nextProvider i18n={i18n}>
      <RouterProvider router={router} />
    </I18nextProvider>
  </StrictMode>,
);
