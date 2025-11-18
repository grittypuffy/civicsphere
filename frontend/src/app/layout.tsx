import AppContainer from "@/lib/components/AppContainer";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppContainer>{children}</AppContainer>
      </body>
    </html>
  );
}
