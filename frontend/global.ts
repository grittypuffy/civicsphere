import messages from '@/lib/i18n/data/en.json';
import { routing } from '@/lib/i18n/routing';

declare module 'next-intl' {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}
