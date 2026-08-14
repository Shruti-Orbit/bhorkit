"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Gift, Heart, UserRound, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { navigation } from "@/src/data/navigation";
import { useShop } from "@/src/context/ShopContext";

type MobileMenuProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname();
  const { openAuthModal } = useShop();

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
                  className="h-auto w-[122px]"
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
                href="/wishlist"
                onClick={onClose}
                className="flex min-h-12 items-center justify-between border-b border-bhor-border/70 px-2 text-bhor-body-mobile font-bhor-medium text-bhor-text hover:text-bhor-primary"
              >
                <span className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-bhor-gold" aria-hidden />
                  Wishlist
                </span>
                <ChevronRight className="h-4 w-4 text-bhor-text-muted" aria-hidden />
              </Link>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  openAuthModal({ mode: "login" });
                }}
                className="flex min-h-12 w-full items-center justify-between border-b border-bhor-border/70 px-2 text-left text-bhor-body-mobile font-bhor-medium text-bhor-text hover:text-bhor-primary"
              >
                <span className="flex items-center gap-2">
                  <UserRound className="h-4 w-4 text-bhor-gold" aria-hidden />
                  Account
                </span>
                <ChevronRight className="h-4 w-4 text-bhor-text-muted" aria-hidden />
              </button>
            </div>

            <div className="mt-auto border-t border-bhor-border bg-bhor-cream px-5 py-5">
              <Link
                href="/support"
                onClick={onClose}
                className="inline-flex min-h-11 w-full items-center justify-center bg-bhor-primary px-4 text-bhor-button-mobile font-bhor-semibold text-white transition-colors hover:bg-bhor-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary"
              >
                Help & Support
              </Link>
            </div>
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
