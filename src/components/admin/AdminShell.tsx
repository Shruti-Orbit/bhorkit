"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { LayoutDashboard, LogOut, Menu, Package, ShoppingBag, Store, Tags, Users, X } from "lucide-react";
import { getCurrentUser, logout as logoutRequest } from "@/src/lib/api/auth.api";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/users", label: "Users", icon: Users },
];

type Admin = { name: string; email: string; image?: string | null };

/**
 * The admin application shell — sidebar, top bar and content region.
 *
 * It renders NOTHING until the server confirms an admin: no sidebar, no
 * branding, no denial screen. src/middleware.ts already redirects non-admins
 * before this is ever sent, so this is the second line of defence, for the
 * case middleware cannot cover (a session cookie scoped to a different host)
 * and for a role that changes while the panel is open.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [navOpen, setNavOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let active = true;
    getCurrentUser()
      .then((user) => {
        if (!active) return;
        if (user.role !== "admin") {
          router.replace("/");
          return;
        }
        setAdmin({ name: user.name, email: user.email, image: user.image });
      })
      .catch(() => {
        if (active) router.replace("/");
      });
    return () => {
      active = false;
    };
  }, [router]);

  async function signOut() {
    setSigningOut(true);
    // Clears the session server-side — the cookie is httpOnly, so the browser
    // cannot drop it on its own.
    await logoutRequest().catch(() => undefined);
    router.replace("/");
    // Discards the cached RSC payload as well, so nothing rendered while the
    // admin was signed in survives the sign-out.
    router.refresh();
  }

  if (!admin) return null;

  return (
    <div className="flex min-h-screen bg-bhor-cream">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-bhor-border bg-bhor-surface transition-transform lg:static lg:translate-x-0 ${
          navOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-2 border-b border-bhor-border px-4">
          <Link href="/admin" className="flex items-center gap-2">
            <Image
              src="/images/logo/bhor-kit-logo.png"
              alt="BHORKIT"
              width={108}
              height={72}
              priority
              className="h-9 w-auto object-contain"
            />
            <span className="text-bhor-caption font-bhor-bold uppercase tracking-widest text-bhor-text-muted">
              Admin
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setNavOpen(false)}
            aria-label="Close menu"
            className="ml-auto rounded-bhor-sm p-1 text-bhor-text-muted lg:hidden"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-1">
            {NAV.map((item) => {
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    // Closed here rather than in an effect watching the route:
                    // the click is the event that should dismiss the drawer.
                    onClick={() => setNavOpen(false)}
                    className={`flex items-center gap-3 rounded-bhor-sm px-3 py-2 text-bhor-small font-bhor-semibold transition-colors ${
                      active
                        ? "bg-bhor-primary text-white"
                        : "text-bhor-text-muted hover:bg-bhor-cream hover:text-bhor-text"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-bhor-border p-3">
          <Link
            href="/"
            className="mb-1 flex items-center gap-3 rounded-bhor-sm px-3 py-2 text-bhor-small font-bhor-semibold text-bhor-text-muted hover:bg-bhor-cream hover:text-bhor-text"
          >
            <Store className="h-4 w-4 shrink-0" aria-hidden />
            View store
          </Link>
          <button
            type="button"
            onClick={signOut}
            disabled={signingOut}
            className="flex w-full items-center gap-3 rounded-bhor-sm px-3 py-2 text-bhor-small font-bhor-semibold text-bhor-primary hover:bg-bhor-primary-soft disabled:opacity-50"
          >
            <LogOut className="h-4 w-4 shrink-0" aria-hidden />
            {signingOut ? "Signing out…" : "Log out"}
          </button>
        </div>
      </aside>

      {navOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setNavOpen(false)}
          className="fixed inset-0 z-30 bg-bhor-text/40 lg:hidden"
        />
      ) : null}

      {/* Content column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-bhor-border bg-bhor-surface px-4 sm:px-6">
          <button
            type="button"
            onClick={() => setNavOpen(true)}
            aria-label="Open menu"
            className="rounded-bhor-sm p-2 text-bhor-text lg:hidden"
          >
            <Menu className="h-5 w-5" aria-hidden />
          </button>

          <div className="ml-auto flex items-center gap-3">
            <div className="text-right">
              <p className="text-bhor-small font-bhor-semibold leading-tight text-bhor-text">{admin.name}</p>
              <p className="text-bhor-caption leading-tight text-bhor-text-muted">{admin.email}</p>
            </div>
            {admin.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={admin.image}
                alt=""
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <span
                aria-hidden
                className="flex h-9 w-9 items-center justify-center rounded-full bg-bhor-primary-soft text-bhor-small font-bhor-bold text-bhor-primary"
              >
                {admin.name.trim().charAt(0).toUpperCase() || "A"}
              </span>
            )}
          </div>
        </header>

        <main className="min-w-0 flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
