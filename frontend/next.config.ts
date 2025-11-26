import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import withPWA from "@ducanh2912/next-pwa";

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

const withPWAConfig = withPWA({
  dest: "public",
  register: true,
});


export default withNextIntl(withPWAConfig(nextConfig));