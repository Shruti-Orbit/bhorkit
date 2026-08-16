"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LogOut, UserRound } from "lucide-react";
import { useShop } from "@/src/context/ShopContext";

export function AccountButton() {
  const { currentUser, isLoggedIn, logout, openAuthModal } = useShop();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const displayIdentifier = currentUser?.email || currentUser?.id;
  const initial = displayIdentifier?.charAt(0).toUpperCase();

  useEffect(() => {
    if (!isDropdownOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
      }
    }

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDropdownOpen]);

  if (isLoggedIn && currentUser) {
    return (
      <div ref={dropdownRef} className="relative">
        <button
          type="button"
          aria-label="Account menu"
          aria-expanded={isDropdownOpen}
          onClick={() => setIsDropdownOpen((open) => !open)}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-bhor-primary-soft text-bhor-primary transition-colors hover:bg-bhor-primary hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary"
        >
          <span className="text-bhor-small font-bhor-bold">{initial}</span>
        </button>

        {isDropdownOpen ? (
          <div className="absolute right-0 top-12 z-50 w-56 rounded-bhor-md border border-bhor-border bg-bhor-surface p-2 shadow-bhor-soft">
            <p className="border-b border-bhor-border px-3 py-2 text-bhor-caption font-bhor-semibold text-bhor-text-muted">
              {displayIdentifier}
            </p>
            {[
              { label: "My Account", href: "/account" },
              { label: "My Orders", href: "/account/orders" },
              { label: "Saved Items", href: "/account/saved-items" },
              { label: "Track Order", href: "/track-order" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsDropdownOpen(false)}
                className="block rounded-bhor-sm px-3 py-2 text-bhor-small font-bhor-semibold text-bhor-text hover:bg-bhor-cream hover:text-bhor-primary"
              >
                {item.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => {
                logout();
                setIsDropdownOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-bhor-sm px-3 py-2 text-left text-bhor-small font-bhor-semibold text-bhor-primary hover:bg-bhor-primary-soft"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              Logout
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <button
      type="button"
      aria-label="Account login"
      onClick={() => openAuthModal()}
      className="flex h-11 w-11 items-center justify-center text-bhor-text transition-colors hover:text-bhor-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary"
    >
      <UserRound className="h-6 w-6" aria-hidden />
    </button>
  );
}
