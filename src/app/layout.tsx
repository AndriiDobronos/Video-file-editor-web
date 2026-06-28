import Link from "next/link";
import type { Metadata } from "next";
import { DM_Sans, Space_Grotesk } from "next/font/google";
import { AppNav } from "@/components/app-nav";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="uk"
      className={`${dmSans.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="sticky top-0 z-30 border-b border-panel-border bg-[rgba(244,239,228,0.88)] backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-7xl flex-col items-start gap-3 px-5 py-4 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
            <Link
              href="/"
              className="font-display text-base font-semibold leading-tight tracking-tight text-foreground sm:text-lg"
            >
              Video File Editor
            </Link>

            <AppNav />
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </body>
    </html>
  );
}
