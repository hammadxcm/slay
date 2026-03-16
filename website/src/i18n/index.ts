import en from './translations/en';
import zh from './translations/zh';
import hi from './translations/hi';
import es from './translations/es';
import ar from './translations/ar';
import fr from './translations/fr';
import bn from './translations/bn';
import pt from './translations/pt';
import ru from './translations/ru';
import ja from './translations/ja';

const translations: Record<string, Record<string, string>> = {
  en, zh, hi, es, ar, fr, bn, pt, ru, ja,
};

export function getTranslation(locale: string = 'en') {
  const dict = translations[locale] || translations.en;
  return function t(key: string): string {
    return dict[key] || translations.en[key] || key;
  };
}

export const locales = ['en', 'zh', 'hi', 'es', 'ar', 'fr', 'bn', 'pt', 'ru', 'ja'] as const;
export type Locale = typeof locales[number];
