"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import { AccountButton } from "../header/AccountButton";
import { CartButton } from "../header/CartButton";
import { SearchBox } from "../header/SearchBox";
import { MobileMenu } from "./MobileMenu";
import { useShop } from "@/src/context/ShopContext";

export function MobileHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthReady, isLoggedIn } = useShop();

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="border-b border-bhor-border bg-bhor-surface lg:hidden">
      <div className="grid h-16 grid-cols-[44px_1fr_auto] items-center gap-1 px-4 sm:h-[72px]">
        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
          onClick={() => setIsOpen(true)}
          className="flex h-11 w-11 items-center justify-center text-bhor-text transition-colors hover:text-bhor-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary"
        >
          <Menu className="h-6 w-6" aria-hidden />
        </button>

        <Link
          href="/"
          className="mx-auto flex items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bhor-primary"
        >
          <Image
            src="/images/logo/bhor-kit-logo.png"
            alt="BHORKIT — Begin Your Day Divine"
            width={1536}
            height={1024}
            priority
            className="h-auto max-h-[58px] w-[104px] object-contain sm:w-[116px]"
          />
        </Link>

        {/* Signed out, the header carries nothing but "Login" — there is no
            point offering search or a cart to someone who has to sign in
            first, and a single control makes the next step unmissable.
            Signed in, the controls read search, cart, avatar left to right,
            so from the right edge it is avatar, cart, search.

            While the session check is still in flight neither state is known,
            so only the account slot is rendered: showing search and a cart and
            then removing them would be a visible flinch on every load. */}
        <div className="flex items-center justify-end gap-0.5">
          {isAuthReady && isLoggedIn ? (
            <>
              <SearchBox />
              <CartButton />
            </>
          ) : null}
          <AccountButton showLoginLabel />
        </div>
      </div>

      <MobileMenu isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}
