"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { functionRouteOptions, type FunctionView } from "@/lib/function-routes";
import { getLocaleToggleLabel, useLanguage } from "@/i18n/language-provider";

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href;
}

export function AppNav() {
  const pathname = usePathname();
  const { locale, setLocale, t, tf } = useLanguage();
  const activeFunction =
    functionRouteOptions.find((item) => pathname === item.href) ?? null;
  const [isFunctionMenuOpen, setIsFunctionMenuOpen] = useState(false);
  const [expandedFunctionView, setExpandedFunctionView] = useState<FunctionView | null>(null);
  const functionMenuRef = useRef<HTMLDivElement | null>(null);
  const activeButtonClasses =
    "border-[#2f2f2f] bg-[#2f2f2f] text-[#f8f5ef] shadow-[0_12px_30px_rgba(17,17,17,0.14)]";
  const idleButtonClasses =
    "border-panel-border bg-white/80 text-foreground hover:bg-white";
  const activeTextStyle = { color: "#f8f5ef" } as const;
  const idleTextStyle = { color: "#111111" } as const;
  const isWorkspaceActive = isActivePath(pathname, "/");
  const isJobsActive = isActivePath(pathname, "/jobs");
  const isDocsActive = isActivePath(pathname, "/docs");

  useEffect(() => {
    setIsFunctionMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isFunctionMenuOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!functionMenuRef.current?.contains(event.target as Node)) {
        setIsFunctionMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isFunctionMenuOpen]);

  return (
    <nav className="grid w-full grid-cols-2 gap-2 md:flex md:w-auto md:flex-wrap md:justify-end">
      <Link
        href="/"
        className={`relative inline-flex items-center justify-center whitespace-nowrap rounded-full border px-3.5 py-2 text-[13px] font-semibold transition sm:px-4 sm:text-sm ${
          isWorkspaceActive ? activeButtonClasses : idleButtonClasses
        }`}
        style={isWorkspaceActive ? activeTextStyle : idleTextStyle}
      >
        <span
          className={`relative z-10 ${
            isWorkspaceActive ? "!text-[#f8f5ef]" : "text-foreground"
          }`}
          style={isWorkspaceActive ? activeTextStyle : idleTextStyle}
        >
          {t("Workspace")}
        </span>
      </Link>

      <div className="relative col-span-2 md:col-auto" ref={functionMenuRef}>
        <button
          type="button"
          onClick={() => {
            setIsFunctionMenuOpen((current) => !current);
          }}
          className={`flex w-full list-none items-center justify-center gap-2 rounded-full border px-3.5 py-2 text-[13px] font-semibold transition sm:px-4 sm:text-sm ${
            activeFunction ? activeButtonClasses : idleButtonClasses
          }`}
          style={activeFunction ? activeTextStyle : idleTextStyle}
          aria-expanded={isFunctionMenuOpen}
          aria-haspopup="menu"
        >
          <span
            className={`relative z-10 max-w-[11rem] truncate ${
              activeFunction ? "!text-[#f8f5ef]" : "text-foreground"
            }`}
            style={activeFunction ? activeTextStyle : idleTextStyle}
          >
            {activeFunction ? t(activeFunction.shortLabel) : t("Function")}
          </span>
          <span
            aria-hidden="true"
            className={`text-xs transition ${isFunctionMenuOpen ? "rotate-180" : ""}`}
          >
            ▾
          </span>
        </button>

        {isFunctionMenuOpen ? (
          <div className="absolute left-0 right-0 top-[calc(100%+0.55rem)] z-40 rounded-[1.25rem] border border-panel-border bg-[rgba(255,255,255,0.96)] p-3 shadow-[0_24px_70px_rgba(17,17,17,0.12)] backdrop-blur-xl md:left-auto md:right-0 md:w-[min(92vw,42rem)]">
            <div className="px-1 pb-3 sm:px-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                {t("Functions")}
              </p>
              <p className="mt-1 text-xs leading-5 text-muted">
                {t(
                  "Choose a page directly. Use the info button to open a short description without stretching the whole menu.",
                )}
              </p>
            </div>

            <div className="grid max-h-[70vh] gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
              {functionRouteOptions.map((item) => {
                const isActive = pathname === item.href;
                const isExpanded = expandedFunctionView === item.view;

                return (
                  <div
                    key={item.view}
                    className={`rounded-[1rem] border transition ${
                      isActive
                        ? "border-[#2f2f2f] bg-[#2f2f2f]"
                        : "border-panel-border bg-white/80"
                    }`}
                  >
                    <div className="flex items-center gap-2 px-3 py-3">
                      <Link
                        href={item.href}
                        onClick={() => {
                          setIsFunctionMenuOpen(false);
                        }}
                        className="min-w-0 flex-1 rounded-[0.85rem] focus:outline-none"
                      >
                        <p
                          className={`break-words text-sm font-semibold leading-5 ${
                            isActive ? "!text-[#f8f5ef]" : "text-foreground"
                          }`}
                          style={isActive ? activeTextStyle : idleTextStyle}
                        >
                          {t(item.label)}
                        </p>
                        <p
                          className={`mt-1 text-[11px] uppercase tracking-[0.14em] ${
                            isActive ? "!text-white/65" : "text-muted"
                          }`}
                        >
                          {t(item.shortLabel)}
                        </p>
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setExpandedFunctionView((current) =>
                            current === item.view ? null : item.view,
                          );
                        }}
                        className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition ${
                          isActive
                            ? "border-white/15 bg-white/10 text-[#f8f5ef] hover:bg-white/14"
                            : "border-panel-border bg-[#f7f2e8] text-foreground hover:bg-[#efe7d8]"
                        }`}
                        aria-expanded={isExpanded}
                        aria-label={tf("Toggle description for {label}", { label: t(item.label) })}
                      >
                        i
                      </button>
                    </div>

                    {isExpanded ? (
                      <p
                        className={`px-3 pb-3 text-xs leading-5 ${
                          isActive ? "text-white/70" : "text-muted"
                        }`}
                      >
                        {t(item.description)}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      <div className="col-span-2 inline-flex items-center rounded-full border border-panel-border bg-white/80 p-1 md:col-auto">
        {(["en", "uk"] as const).map((nextLocale) => {
          const isActive = locale === nextLocale;

          return (
            <button
              key={nextLocale}
              type="button"
              onClick={() => {
                setLocale(nextLocale);
              }}
              className={`rounded-full px-3 py-2 text-[13px] font-semibold transition sm:px-4 sm:text-sm ${
                isActive ? "bg-[#2f2f2f] text-[#f8f5ef]" : "text-foreground hover:bg-white"
              }`}
              aria-label={`${t("Switch language")}: ${getLocaleToggleLabel(nextLocale)}`}
            >
              {nextLocale === "en" ? "EN" : "UA"}
            </button>
          );
        })}
      </div>

      <Link
        href="/jobs"
        className={`relative inline-flex items-center justify-center whitespace-nowrap rounded-full border px-3.5 py-2 text-[13px] font-semibold transition sm:px-4 sm:text-sm ${
          isJobsActive ? activeButtonClasses : idleButtonClasses
        }`}
        style={isJobsActive ? activeTextStyle : idleTextStyle}
      >
        <span
          className={`relative z-10 ${
            isJobsActive ? "!text-[#f8f5ef]" : "text-foreground"
          }`}
          style={isJobsActive ? activeTextStyle : idleTextStyle}
        >
          {t("Jobs")}
        </span>
      </Link>

      <Link
        href="/docs"
        className={`relative inline-flex items-center justify-center whitespace-nowrap rounded-full border px-3.5 py-2 text-[13px] font-semibold transition sm:px-4 sm:text-sm ${
          isDocsActive ? activeButtonClasses : idleButtonClasses
        }`}
        style={isDocsActive ? activeTextStyle : idleTextStyle}
      >
        <span
          className={`relative z-10 ${
            isDocsActive ? "!text-[#f8f5ef]" : "text-foreground"
          }`}
          style={isDocsActive ? activeTextStyle : idleTextStyle}
        >
          {t("Docs")}
        </span>
      </Link>
    </nav>
  );
}
