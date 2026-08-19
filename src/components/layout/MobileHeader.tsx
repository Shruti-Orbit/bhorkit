"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import { CartButton } from "../header/CartButton";
import { SearchBox } from "../header/SearchBox";
import { MobileMenu } from "./MobileMenu";

export function MobileHeader() {
  const [isOpen, setIsOpen] = useState(false);

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
      <div className="grid h-16 grid-cols-[44px_1fr_92px] items-center px-4 sm:h-[72px]">
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
            className="h-auto w-[96px] sm:w-[106px]"
          />
        </Link>

        <div className="flex items-center justify-end">
          <SearchBox />
          <CartButton />
        </div>
      </div>

      <MobileMenu isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}
