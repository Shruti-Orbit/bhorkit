"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronRight, Gift, Heart, UserRound, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { navigation } from "@/src/data/navigation";
import { useShop } from "@/src/context/ShopContext";

const SUPPORT_PHONE = "9296914463";

type MobileMenuProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname();
  const { currentUser, isLoggedIn, openAuthModal } = useShop();
  // Which collapsible section is expanded.
  //
  // The default comes from the route, so opening the drawer inside a section
  // shows that section's items straight away. A tap overrides it, and the
  // override is stored with the route it was made on so it lapses as soon as
  // the route changes — the same derivation the desktop menu uses, which keeps
  // this correct on first paint with no effect syncing state to the pathname.
  const currentSection =
    navigation.find((item) => item.children && pathname.startsWith(item.href))?.href ?? null;
  const [override, setOverride] = useState<{ href: string | null; path: string } | null>(null);
  const openSection = override && override.path === pathname ? override.href : currentSection;

  function toggleSection(href: string) {
    setOverride({ href: openSection === href ? null : href, path: pathname });
  }

  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.button
            type="button"
            aria-label="Close menu overlay"
            className="absolute inset-0 bg-bhor-text/35"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.aside
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            className="relative flex h-full w-[min(86vw,360px)] flex-col bg-bhor-surface shadow-bhor-soft"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex h-20 items-center justify-between border-b border-bhor-border px-5">
              <Link href="/" onClick={onClose} className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bhor-primary">
                <Image
                  src="/images/logo/bhor-kit-logo.png"
                  alt="BHORKIT — Begin Your Day Divine"
                  width={1536}
                  height={1024}
                  className="h-auto max-h-[68px] w-[132px] object-contain"
                />
              </Link>
              <button
                type="button"
                aria-label="Close menu"
                onClick={onClose}
                className="flex h-11 w-11 items-center justify-center text-bhor-text transition-colors hover:text-bhor-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            <div className="mx-5 mt-5 rounded-bhor-md bg-bhor-primary-soft px-4 py-3">
              <p className="flex items-center gap-2 text-bhor-small font-bhor-semibold text-bhor-primary">
                <Gift className="h-4 w-4" aria-hidden />
                Free Delivery above ₹999
              </p>
              <p className="mt-1 text-bhor-caption leading-bhor-body text-bhor-text-muted">
                Premium puja essentials, packed with devotion.
              </p>
            </div>

            <nav aria-label="Mobile navigation" className="mt-4 flex flex-col px-3">
              {navigation.map((item) => {
                const isActive =
                  item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

                if (item.children) {
                  const expanded = openSection === item.href;
                  return (
                    <div key={item.href} className="border-b border-bhor-border/70">
                      <button
                        type="button"
                        aria-expanded={expanded}
                        aria-controls={`mobile-section-${item.href.replace(/\W/g, "")}`}
                        onClick={() => toggleSection(item.href)}
                        className={`flex min-h-12 w-full items-center justify-between px-2 text-left text-bhor-body-mobile font-bhor-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-bhor-primary ${
                          isActive ? "text-bhor-primary" : "text-bhor-text hover:text-bhor-primary"
                        }`}
                      >
                        {item.label}
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${
                            expanded ? "rotate-180 text-bhor-primary" : "text-bhor-text-muted"
                          }`}
                          aria-hidden
                        />
                      </button>

                      {expanded ? (
                        <ul id={`mobile-section-${item.href.replace(/\W/g, "")}`} className="pb-2">
                          {item.children.map((child) => {
                            const childActive = pathname === child.href;
                            return (
                              <li key={child.href}>
                                <Link
                                  href={child.href}
                                  aria-current={childActive ? "page" : undefined}
                                  onClick={onClose}
                                  className={`flex min-h-11 items-center justify-between rounded-bhor-sm pl-5 pr-2 text-bhor-small font-bhor-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-bhor-primary ${
                                    childActive
                                      ? "bg-bhor-primary-soft text-bhor-primary"
                                      : "text-bhor-text-muted hover:text-bhor-primary"
                                  }`}
                                >
                                  {child.label}
                                  <ChevronRight className="h-4 w-4 text-bhor-text-muted" aria-hidden />
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      ) : null}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    onClick={onClose}
                    className={`flex min-h-12 items-center justify-between border-b border-bhor-border/70 px-2 text-bhor-body-mobile font-bhor-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-bhor-primary ${
                      isActive ? "text-bhor-primary" : "text-bhor-text hover:text-bhor-primary"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {item.label}
                      {item.badge ? (
                        <span className="rounded-bhor-sm bg-bhor-primary px-1.5 py-0.5 text-bhor-badge font-bhor-bold leading-none text-white">
                          {item.badge}
                        </span>
                      ) : null}
                    </span>
                    <ChevronRight className="h-4 w-4 text-bhor-text-muted" aria-hidden />
                  </Link>
                );
              })}
            </nav>

            <div className="mt-5 px-3">
              <Link
                href="/account/saved-items"
                onClick={onClose}
                className="flex min-h-12 items-center justify-between border-b border-bhor-border/70 px-2 text-bhor-body-mobile font-bhor-medium text-bhor-text hover:text-bhor-primary"
              >
                <span className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-bhor-gold" aria-hidden />
                  Wishlist
                </span>
                <ChevronRight className="h-4 w-4 text-bhor-text-muted" aria-hidden />
              </Link>
              {isLoggedIn ? (
                <Link
                  href="/account"
                  onClick={onClose}
                  className="flex min-h-12 w-full items-center justify-between border-b border-bhor-border/70 px-2 text-left text-bhor-body-mobile font-bhor-medium text-bhor-text hover:text-bhor-primary"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <UserRound className="h-4 w-4 shrink-0 text-bhor-gold" aria-hidden />
                    <span className="min-w-0">
                      Account
                      {/* Which account is signed in — the drawer otherwise
                          gives no sign of it. Truncated because an address can
                          be longer than the drawer is wide. */}
                      {currentUser?.email ? (
                        <span className="block truncate text-bhor-caption font-bhor-medium leading-bhor-body text-bhor-text-muted">
                          {currentUser.email}
                        </span>
                      ) : null}
                    </span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-bhor-text-muted" aria-hidden />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    openAuthModal();
                  }}
                  className="flex min-h-12 w-full items-center justify-between border-b border-bhor-border/70 px-2 text-left text-bhor-body-mobile font-bhor-medium text-bhor-text hover:text-bhor-primary"
                >
                  <span className="flex items-center gap-2">
                    <UserRound className="h-4 w-4 text-bhor-gold" aria-hidden />
                    Account
                  </span>
                  <ChevronRight className="h-4 w-4 text-bhor-text-muted" aria-hidden />
                </button>
              )}
            </div>

            <div className="mt-auto border-t border-bhor-border bg-bhor-cream px-5 py-5">
              <a
                href={`tel:${SUPPORT_PHONE}`}
                onClick={onClose}
                className="inline-flex min-h-11 w-full items-center justify-center bg-bhor-primary px-4 text-bhor-button-mobile font-bhor-semibold text-white transition-colors hover:bg-bhor-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary"
              >
                {SUPPORT_PHONE}
              </a>
            </div>
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
