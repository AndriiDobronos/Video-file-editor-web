"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { functionRouteOptions } from "@/lib/function-routes";

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href;
}

export function AppNav() {
  const pathname = usePathname();
  const activeFunction =
    functionRouteOptions.find((item) => pathname === item.href) ?? null;
  const activeButtonClasses =
    "border-[#2f2f2f] bg-[#2f2f2f] text-[#f8f5ef] shadow-[0_12px_30px_rgba(17,17,17,0.14)]";
  const idleButtonClasses =
    "border-panel-border bg-white/80 text-foreground hover:bg-white";
  const activeTextStyle = { color: "#f8f5ef" } as const;
  const idleTextStyle = { color: "#111111" } as const;
  const isWorkspaceActive = isActivePath(pathname, "/");
  const isJobsActive = isActivePath(pathname, "/jobs");
  const isDocsActive = isActivePath(pathname, "/docs");

  return (
    <nav className="flex flex-wrap items-center gap-2">
      <Link
        href="/"
        className={`relative rounded-full border px-4 py-2 text-sm font-semibold transition ${
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
          Workspace
        </span>
      </Link>

      <details className="relative">
        <summary
          className={`list-none rounded-full border px-4 py-2 text-sm font-semibold transition ${
            activeFunction ? activeButtonClasses : idleButtonClasses
          } cursor-pointer`}
          style={activeFunction ? activeTextStyle : idleTextStyle}
        >
          <span
            className={`relative z-10 ${
              activeFunction ? "!text-[#f8f5ef]" : "text-foreground"
            }`}
            style={activeFunction ? activeTextStyle : idleTextStyle}
          >
            {activeFunction ? `Function: ${activeFunction.shortLabel}` : "Function"}
          </span>
        </summary>

        <div className="absolute right-0 top-[calc(100%+0.55rem)] z-40 min-w-64 rounded-[1.25rem] border border-panel-border bg-[rgba(255,255,255,0.96)] p-2 shadow-[0_24px_70px_rgba(17,17,17,0.12)] backdrop-blur-xl">
          {functionRouteOptions.map((item) => (
            <Link
              key={item.view}
              href={item.href}
              style={pathname === item.href ? activeTextStyle : idleTextStyle}
              className={`block rounded-[1rem] px-4 py-3 transition ${
                pathname === item.href
                  ? "bg-[#2f2f2f] text-[#f8f5ef]"
                  : "hover:bg-[#f7f2e8]"
              }`}
            >
              <p
                className={`text-sm font-semibold ${
                  pathname === item.href ? "!text-[#f8f5ef]" : "text-foreground"
                }`}
                style={pathname === item.href ? activeTextStyle : idleTextStyle}
              >
                {item.label}
              </p>
              <p
                className={`mt-1 text-xs leading-5 ${
                  pathname === item.href ? "!text-white/70" : "text-muted"
                }`}
              >
                {item.description}
              </p>
            </Link>
          ))}
        </div>
      </details>

      <Link
        href="/jobs"
        className={`relative rounded-full border px-4 py-2 text-sm font-semibold transition ${
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
          Jobs
        </span>
      </Link>

      <Link
        href="/docs"
        className={`relative rounded-full border px-4 py-2 text-sm font-semibold transition ${
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
          Docs
        </span>
      </Link>
    </nav>
  );
}
