import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
};

const withNextIntl = createNextIntlPlugin({
  requestConfig: './src/lib/i18n/request.ts',
  experimental: {
    createMessagesDeclaration: './src/lib/i18n/data/en.json',
    messages: {
      path: "./src/lib/data",
      locales: ['ar', 'bn', 'de', 'el', 'en', 'es', 'fr', 'hi', 'ht', 'it', 'ja', 'ko', 'pl', 'pa', 'pt', 'ru', 'tl', 'ur', 'yi', 'zh'],
      format: "json"
    }
  }
});
export default withNextIntl(nextConfig);
