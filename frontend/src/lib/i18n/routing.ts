import { LOCALES } from '@/lib/consts';
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: 'en'
});
