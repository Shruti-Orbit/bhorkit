"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { LayoutDashboard, Package, ShoppingBag, Tags, Users, Loader2, ShieldAlert } from "lucide-react";
import { getCurrentUser } from "@/src/lib/api/auth.api";
import { ApiClientError } from "@/src/lib/api/client";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/users", label: "Users", icon: Users },
];

type Gate = "checking" | "allowed" | "denied" | "unavailable";

/**
 * Frontend guard for the /admin section.
 *
 * This is a convenience layer, not the security boundary. It exists so an
 * unauthorised visitor sees a clear message instead of a flash of empty tables
 * and a wall of failed requests. The actual protection is server-side: every
 * /admin API re-reads the caller's role from the database, so removing this
 * component, editing it in devtools or navigating straight to a URL still
 * yields nothing but 401s and 403s.
 *
 * The role comes from /auth/me — the server's answer about the current
 * session — never from anything held in the browser.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const [gate, setGate] = useState<Gate>("checking");
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let active = true;
    getCurrentUser()
      .then((user) => {
        if (!active) return;
        setGate(user.role === "admin" ? "allowed" : "denied");
      })
      .catch((error: unknown) => {
        if (!active) return;
        // Only a definitive "not you" answer is a denial. A network failure,
        // a 429 or a 500 means we don't know — telling someone they lack
        // permission in that case is simply wrong, and sends them chasing an
        // access problem that doesn't exist.
        const definitive =
          error instanceof ApiClientError && (error.status === 401 || error.status === 403 || error.status === 404);
        setGate(definitive ? "denied" : "unavailable");
      });
    return () => {
      active = false;
    };
  }, []);

  if (gate === "checking") {
    return (
      <main className="flex min-h-[60vh] flex-1 items-center justify-center bg-bhor-cream">
        <p className="flex items-center gap-2 text-bhor-small text-bhor-text-muted">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Checking access…
        </p>
      </main>
    );
  }

  if (gate === "unavailable") {
    return (
      <main className="flex min-h-[60vh] flex-1 items-center justify-center bg-bhor-cream px-4">
        <div className="w-full max-w-md rounded-bhor-lg border border-bhor-border bg-bhor-surface p-8 text-center">
          <ShieldAlert className="mx-auto h-10 w-10 text-bhor-text-muted" aria-hidden />
          <h1 className="mt-4 font-bhor-display text-bhor-h3-mobile font-bhor-semibold text-bhor-text">
            Couldn&apos;t verify your access
          </h1>
          <p className="mt-2 text-bhor-small leading-bhor-body text-bhor-text-muted">
            The server didn&apos;t respond. This isn&apos;t a permissions problem — check your connection and try again.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-bhor-sm bg-bhor-primary px-5 text-bhor-button font-bhor-bold uppercase text-white"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  if (gate === "denied") {
    return (
      <main className="flex min-h-[60vh] flex-1 items-center justify-center bg-bhor-cream px-4">
        <div className="w-full max-w-md rounded-bhor-lg border border-bhor-border bg-bhor-surface p-8 text-center">
          <ShieldAlert className="mx-auto h-10 w-10 text-bhor-primary" aria-hidden />
          <h1 className="mt-4 font-bhor-display text-bhor-h3-mobile font-bhor-semibold text-bhor-text">
            Admin access required
          </h1>
          <p className="mt-2 text-bhor-small leading-bhor-body text-bhor-text-muted">
            You need an administrator account to view this page. If you think this is a mistake, sign in
            with your admin account.
          </p>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-bhor-sm bg-bhor-primary px-5 text-bhor-button font-bhor-bold uppercase text-white"
          >
            Back to Store
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col bg-bhor-cream">
      <div className="mx-auto flex w-full max-w-[1512px] flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:px-8">
        <nav className="lg:w-56 lg:shrink-0">
          <p className="px-3 pb-2 text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-text-muted">
            Admin
          </p>
          <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
            {NAV.map((item) => {
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <li key={item.href} className="shrink-0">
                  <Link
                    href={item.href}
                    className={`flex items-center gap-2 rounded-bhor-sm px-3 py-2 text-bhor-small font-bhor-semibold transition-colors ${
                      active
                        ? "bg-bhor-primary-soft text-bhor-primary"
                        : "text-bhor-text-muted hover:bg-bhor-surface hover:text-bhor-text"
                    }`}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="min-w-0 flex-1 pb-10">{children}</div>
      </div>
    </main>
  );
}
