import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import serverLogger from './src/integrations/server-logger';

export default defineConfig({
  site: 'https://slay.fyniti.co.uk',
  integrations: [sitemap(), serverLogger()],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh', 'hi', 'es', 'ar', 'fr', 'bn', 'pt', 'ru', 'ja'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
