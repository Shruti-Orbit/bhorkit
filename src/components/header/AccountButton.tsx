"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LogOut, UserRound } from "lucide-react";
import { useShop } from "@/src/context/ShopContext";

type AccountButtonProps = {
  /**
   * Render the signed-out state as a labelled "Login" button rather than a
   * bare avatar icon.
   *
   * Used by the mobile/tablet header, where the icon alone was not telling
   * anyone they needed an account — there is no nav bar beside it to give it
   * context, and the only other way in was buried in the hamburger drawer.
   * Desktop keeps the icon: it sits in a row of icons where its meaning is
   * clear, and a text button there would unbalance the row.
   */
  showLoginLabel?: boolean;
};

export function AccountButton({ showLoginLabel = false }: AccountButtonProps = {}) {
  const { currentUser, isAuthReady, isLoggedIn, logout, openAuthModal } = useShop();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
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

  // Until the session check resolves we genuinely don't know whether this is
  // a signed-in user or a guest. Rendering the "log in" icon here would state
  // something we haven't confirmed — and right after the Google redirect it
  // showed a just-logged-in user as logged out until they refreshed. A
  // neutral placeholder of identical size keeps the header stable (no layout
  // shift) and never asserts the wrong state.
  if (!isAuthReady) {
    return (
      <div
        role="status"
        aria-label="Loading account"
        className={
          showLoginLabel
            ? "h-9 w-[86px] shrink-0 animate-pulse rounded-bhor-sm bg-bhor-cream"
            : "h-11 w-11 shrink-0 animate-pulse rounded-full bg-bhor-cream"
        }
      />
    );
  }

  if (isLoggedIn && currentUser) {
    return (
      <div ref={dropdownRef} className="relative">
        <button
          type="button"
          aria-label="Account menu"
          aria-expanded={isDropdownOpen}
          onClick={() => setIsDropdownOpen((open) => !open)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-bhor-primary-soft text-bhor-primary transition-colors hover:bg-bhor-primary hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary"
        >
          {currentUser.image && !imageFailed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={currentUser.image}
              alt={currentUser.name}
              onError={() => setImageFailed(true)}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <span className="text-bhor-small font-bhor-bold">{initial}</span>
          )}
        </button>

        {isDropdownOpen ? (
          <div className="absolute right-0 top-12 z-50 w-56 rounded-bhor-md border border-bhor-border bg-bhor-surface p-2 shadow-bhor-soft">
            <div className="border-b border-bhor-border px-3 py-2">
              <p className="truncate text-bhor-small font-bhor-bold text-bhor-text">{currentUser.name}</p>
              <p className="truncate text-bhor-caption font-bhor-semibold text-bhor-text-muted">
                {displayIdentifier}
              </p>
            </div>
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

  if (showLoginLabel) {
    return (
      <button
        type="button"
        onClick={() => openAuthModal()}
        className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-bhor-sm border border-bhor-primary px-3 text-bhor-caption font-bhor-bold uppercase text-bhor-primary transition-colors hover:bg-bhor-primary hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary"
      >
        <UserRound className="h-4 w-4" aria-hidden />
        Login
      </button>
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
