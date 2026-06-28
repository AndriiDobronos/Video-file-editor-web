import type { Metadata } from "next";
import { cookies } from "next/headers";
import { DM_Sans, Space_Grotesk } from "next/font/google";
import { AppHeader } from "@/components/app-header";
import { LanguageProvider } from "@/i18n/language-provider";
import { DEFAULT_LOCALE, isLocale, LANGUAGE_COOKIE_NAME } from "@/i18n/translations";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Video File Editor",
  description:
    "A multi-page workspace for uploading files, choosing one editing function at a time, and exporting finished results.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const storedLocale = cookieStore.get(LANGUAGE_COOKIE_NAME)?.value;
  const initialLocale = isLocale(storedLocale) ? storedLocale : DEFAULT_LOCALE;

  return (
    <html
      lang={initialLocale}
      className={`${dmSans.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LanguageProvider initialLocale={initialLocale}>
          <AppHeader />
          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        </LanguageProvider>
      </body>
    </html>
  );
}
