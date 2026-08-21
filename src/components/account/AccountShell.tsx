"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Heart, LogOut, MapPin, Package, Search, UserRound } from "lucide-react";
import { useShop } from "@/src/context/ShopContext";

const accountLinks = [
  { label: "My Account", href: "/account", icon: UserRound },
  { label: "My Orders", href: "/account/orders", icon: Package },
  { label: "Saved Items", href: "/account/saved-items", icon: Heart },
  { label: "Track Order", href: "/track-order", icon: Search },
  { label: "Addresses", href: "/account/addresses", icon: MapPin },
];

export function AccountShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthReady, isLoggedIn, logout, openAuthModal } = useShop();

  // Until the initial session check resolves, we don't yet know whether this
  // is a logged-in user or a guest — showing the "please log in" screen
  // here would flash it in front of an already-authenticated user on every
  // page load, which is exactly the "state looks inconsistent" symptom this
  // is fixing.
  if (!isAuthReady) {
    return (
      <main className="flex flex-1 flex-col bg-bhor-cream px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto h-40 w-full max-w-xl animate-pulse rounded-bhor-lg border border-bhor-border bg-bhor-surface shadow-bhor-soft" />
      </main>
    );
  }

  if (!isLoggedIn) {
    return (
      <main className="flex flex-1 flex-col bg-bhor-cream px-4 py-10 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-xl rounded-bhor-lg border border-bhor-border bg-bhor-surface p-8 text-center shadow-bhor-soft">
          <UserRound className="mx-auto h-9 w-9 text-bhor-primary" aria-hidden />
          <h1 className="mt-4 font-bhor-display text-bhor-h2-mobile font-bhor-semibold text-bhor-text md:text-bhor-h2">
            Login to Your BHORKIT Account
          </h1>
          <p className="mt-3 text-bhor-small leading-bhor-body text-bhor-text-muted">
            Manage your orders, addresses and saved devotional essentials.
          </p>
          <button
            type="button"
            onClick={() => openAuthModal()}
            className="mt-6 min-h-12 rounded-bhor-sm bg-bhor-primary px-6 text-bhor-button font-bhor-bold uppercase text-white"
          >
            Continue with Google
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-w-0 flex-1 flex-col overflow-x-hidden bg-bhor-cream px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full min-w-0 max-w-[1512px] gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <nav className="sticky top-6 rounded-bhor-lg border border-bhor-border bg-bhor-surface p-3 shadow-bhor-soft">
            {accountLinks.map((item) => {
              const Icon = item.icon;
              const active = item.href === "/account" ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex min-h-11 items-center gap-3 rounded-bhor-sm px-3 text-bhor-small font-bhor-semibold ${
                    active ? "bg-bhor-primary-soft text-bhor-primary" : "text-bhor-text hover:bg-bhor-cream"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  {item.label}
                </Link>
              );
            })}
            <button
              type="button"
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="mt-2 flex min-h-11 w-full items-center gap-3 rounded-bhor-sm px-3 text-left text-bhor-small font-bhor-semibold text-bhor-primary hover:bg-bhor-primary-soft"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              Logout
            </button>
          </nav>
        </aside>

        <div className="min-w-0">
          <nav className="mb-5 flex max-w-full gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden">
            {accountLinks.map((item) => {
              const active = item.href === "/account" ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex min-h-10 shrink-0 items-center rounded-bhor-sm px-3 text-bhor-caption font-bhor-bold uppercase ${
                    active ? "bg-bhor-primary text-white" : "border border-bhor-border bg-bhor-surface text-bhor-text"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          {children}
        </div>
      </div>
    </main>
  );
}

export function AccountSectionCard({ children }: { children: React.ReactNode }) {
  return (
    <section className="min-w-0 overflow-hidden rounded-bhor-lg border border-bhor-border bg-bhor-surface p-4 shadow-bhor-soft md:p-6">
      {children}
    </section>
  );
}
