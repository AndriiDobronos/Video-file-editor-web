"use client";

import Link from "next/link";
import { AppNav } from "@/components/app-nav";
import { useLanguage } from "@/i18n/language-provider";

export function AppHeader() {
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-30 border-b border-panel-border bg-[rgba(244,239,228,0.88)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-start gap-3 px-5 py-4 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
        <Link
          href="/"
          className="font-display text-base font-semibold leading-tight tracking-tight text-foreground sm:text-lg"
        >
          {t("Video File Editor")}
        </Link>

        <AppNav />
      </div>
    </header>
  );
}
