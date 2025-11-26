import type { Metadata } from "next";
import { routing } from "@/lib/i18n/routing";
import "./globals.css";

export const metadata: Metadata = {
  title: "CivicSphere - Civic Engagement Platform",
  description: "A platform for civic engagement and community collaboration",
  manifest: "/manifest.json",
  themeColor: "#FFFFFF",
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/icon-512x512.png"
  }
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
