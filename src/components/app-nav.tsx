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

  return (
    <nav className="flex flex-wrap items-center gap-2">
      <Link
        href="/"
        className={`relative rounded-full border px-4 py-2 text-sm font-semibold transition ${
          isActivePath(pathname, "/") ? activeButtonClasses : idleButtonClasses
        }`}
      >
        <span className="relative z-10">Workspace</span>
      </Link>

      <details className="relative">
        <summary
          className={`list-none rounded-full border px-4 py-2 text-sm font-semibold transition ${
            activeFunction ? activeButtonClasses : idleButtonClasses
          } cursor-pointer`}
        >
          <span className="relative z-10">
            {activeFunction ? `Function: ${activeFunction.shortLabel}` : "Function"}
          </span>
        </summary>

        <div className="absolute right-0 top-[calc(100%+0.55rem)] z-40 min-w-64 rounded-[1.25rem] border border-panel-border bg-[rgba(255,255,255,0.96)] p-2 shadow-[0_24px_70px_rgba(17,17,17,0.12)] backdrop-blur-xl">
          {functionRouteOptions.map((item) => (
            <Link
              key={item.view}
              href={item.href}
              className={`block rounded-[1rem] px-4 py-3 transition ${
                pathname === item.href
                  ? "bg-[#2f2f2f] text-[#f8f5ef]"
                  : "hover:bg-[#f7f2e8]"
              }`}
            >
              <p className="text-sm font-semibold">{item.label}</p>
              <p
                className={`mt-1 text-xs leading-5 ${
                  pathname === item.href ? "text-white/70" : "text-muted"
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
          isActivePath(pathname, "/jobs") ? activeButtonClasses : idleButtonClasses
        }`}
      >
        <span className="relative z-10">Jobs</span>
      </Link>

      <Link
        href="/docs"
        className={`relative rounded-full border px-4 py-2 text-sm font-semibold transition ${
          isActivePath(pathname, "/docs") ? activeButtonClasses : idleButtonClasses
        }`}
      >
        <span className="relative z-10">Docs</span>
      </Link>
    </nav>
  );
}
