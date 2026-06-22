import Link from "next/link";
import type { Metadata } from "next";
import { DM_Sans, Space_Grotesk } from "next/font/google";
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
  description: "A modern workspace for uploading, trimming, normalizing, merging, and downloading video files.",
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
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-10">
            <Link href="/" className="font-display text-lg font-semibold tracking-tight text-foreground">
              Video File Editor
            </Link>

            <nav className="flex items-center gap-2">
              <Link
                href="/"
                className="rounded-full border border-panel-border bg-white/80 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-white"
              >
                Workspace
              </Link>
              <Link
                href="/docs"
                className="rounded-full border border-panel-border bg-white/80 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-white"
              >
                Docs
              </Link>
            </nav>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </body>
    </html>
  );
}
