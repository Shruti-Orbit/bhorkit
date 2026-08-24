"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { LayoutDashboard, Package, ShoppingBag, Tags, Users } from "lucide-react";
import { getCurrentUser } from "@/src/lib/api/auth.api";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/users", label: "Users", icon: Users },
];

type Gate = "checking" | "allowed";

/**
 * Second line of defence for the /admin section.
 *
 * src/middleware.ts is the real gate: it redirects non-admins before any of
 * this is rendered or even sent. This component exists for the case that
 * middleware cannot cover — a session cookie scoped to a different host than
 * the frontend, where the middleware sees no cookie at all — and for a role
 * that changes while the panel is already open.
 *
 * It deliberately renders NOTHING until the server confirms an admin: no
 * layout, no sidebar, no "access denied" screen. Anyone who should not be here
 * is sent to the storefront, and sees only a blank frame on the way. Showing a
 * denial page would tell an unauthorised visitor the panel exists and leave
 * them looking at part of it.
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
        if (user.role === "admin") {
          setGate("allowed");
          return;
        }
        // Not an admin. Replace rather than push, so the back button can't
        // return them to a URL that only bounces again.
        router.replace("/");
      })
      .catch(() => {
        // Unauthenticated, expired, disabled, or the API is unreachable — all
        // of them mean "do not show the panel".
        if (active) router.replace("/");
      });

    return () => {
      active = false;
    };
  }, [router]);

  // Nothing is rendered until an admin is confirmed. This is what removes the
  // flash: there is no admin markup on screen at any point for a non-admin.
  if (gate !== "allowed") {
    return null;
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
