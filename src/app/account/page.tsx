"use client";

import Link from "next/link";
import { Heart, MapPin, Package, Search } from "lucide-react";
import { AccountSectionCard, AccountShell } from "@/src/components/account/AccountShell";
import { useShop } from "@/src/context/ShopContext";

const quickLinks = [
  { label: "My Orders", text: "View and track your orders", href: "/account/orders", icon: Package },
  { label: "Saved Items", text: "Products you've saved", href: "/account/saved-items", icon: Heart },
  { label: "Track Order", text: "Check your delivery status", href: "/track-order", icon: Search },
  { label: "Addresses", text: "Manage your delivery addresses", href: "/account/addresses", icon: MapPin },
];

export default function AccountPage() {
  const { currentUser } = useShop();

  return (
    <AccountShell>
      <div className="space-y-5">
        <div>
          <h1 className="font-bhor-display text-bhor-h2-mobile font-bhor-semibold text-bhor-text md:text-bhor-h2">
            My Account
          </h1>
          <p className="mt-2 text-bhor-small text-bhor-text-muted">
            Manage your BHORKIT account, orders and saved items.
          </p>
        </div>

        <AccountSectionCard>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              {currentUser?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentUser.image}
                  alt={currentUser.name}
                  className="h-16 w-16 rounded-full object-cover shadow-bhor-soft"
                />
              ) : null}
              <div>
              <p className="text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-gold">
                Profile
              </p>
              <h2 className="mt-2 text-bhor-product font-bhor-bold text-bhor-text">
                {currentUser?.name ?? "BHORKIT Devotee"}
              </h2>
              <p className="mt-1 text-bhor-small text-bhor-text-muted">
                {currentUser?.email || "Email not added"}
              </p>
              </div>
            </div>
            <button
              type="button"
              className="min-h-11 rounded-bhor-sm border border-bhor-primary px-5 text-bhor-button font-bhor-bold uppercase text-bhor-primary"
            >
              Edit Profile
            </button>
          </div>
        </AccountSectionCard>

        <div className="grid gap-4 sm:grid-cols-2">
          {quickLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-bhor-lg border border-bhor-border bg-bhor-surface p-5 shadow-bhor-soft transition hover:-translate-y-0.5"
              >
                <Icon className="h-5 w-5 text-bhor-gold" aria-hidden />
                <h2 className="mt-3 text-bhor-product font-bhor-bold text-bhor-text">{item.label}</h2>
                <p className="mt-1 text-bhor-small text-bhor-text-muted">{item.text}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </AccountShell>
  );
}
