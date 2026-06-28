"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_LOCALE,
  intlLocales,
  isLocale,
  LANGUAGE_COOKIE_NAME,
  localeLabels,
  localeNames,
  type Locale,
  ukMessages,
} from "@/i18n/translations";

type TemplateParams = Record<string, number | string>;
export type TranslateFn = (source: string) => string;
export type TemplateFn = (source: string, params: TemplateParams) => string;

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  localeLabel: string;
  t: TranslateFn;
  tf: TemplateFn;
  formatDateTime: (value: Date | number | string) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function resolveTemplate(template: string, params: TemplateParams) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(params[key] ?? ""));
}

function resolveMessage(locale: Locale, source: string) {
  if (locale === "uk") {
    return ukMessages[source] ?? source;
  }

  return source;
}

export function LanguageProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.cookie = `${LANGUAGE_COOKIE_NAME}=${locale}; path=/; max-age=31536000; samesite=lax`;
  }, [locale]);

  const value = useMemo<LanguageContextValue>(() => {
    const intlLocale = intlLocales[locale];

    return {
      locale,
      setLocale: (nextLocale) => {
        setLocaleState(nextLocale);
      },
      localeLabel: localeLabels[locale],
      t: (source) => resolveMessage(locale, source),
      tf: (source, params) => resolveTemplate(resolveMessage(locale, source), params),
      formatDateTime: (value) =>
        new Intl.DateTimeFormat(intlLocale, {
          dateStyle: "short",
          timeStyle: "short",
        }).format(new Date(value)),
    };
  }, [locale]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider.");
  }

  return context;
}

export function getLocaleToggleLabel(locale: Locale) {
  return localeNames[locale];
}
