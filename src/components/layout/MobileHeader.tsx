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

        {/* Signed in, the controls read search, cart, avatar left to right.
            Signed out, cart stays beside the login button using the same
            CartButton component as the desktop header. */}
        <div className="flex items-center justify-end gap-0.5">
          {isAuthReady && isLoggedIn ? (
            <SearchBox />
          ) : null}
          <CartButton />
          <AccountButton showLoginLabel />
        </div>
      </div>

      <MobileMenu isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}
