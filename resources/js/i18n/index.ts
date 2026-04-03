import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import fr from './locales/fr.json';
import ar from './locales/ar.json';

const resources = {
  en: { translation: en },
  fr: { translation: fr },
  ar: { translation: ar },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr', // Default layout is French initially
    supportedLngs: ['en', 'fr', 'ar'],
    interpolation: {
      escapeValue: false, // React protects against XSS
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'], // Persist language choice
    }
  });

// Apply direction immediately on every language change AND on initial load
const applyDir = (lng: string) => {
  document.documentElement.dir  = lng.startsWith('ar') ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
};
i18n.on('languageChanged', applyDir);
// Fire once right now so a stored 'ar' preference takes effect without a change event
applyDir(i18n.language);

export default i18n;
