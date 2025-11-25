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
      locales: ['de', 'el', 'en', 'es', 'fr', 'hi', 'it', 'ja', 'ko', 'pl', 'pt', 'ru', 'zh'],
      format: "json"
    }
  }
});
export default withNextIntl(nextConfig);
