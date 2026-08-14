"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useShop } from "@/src/context/ShopContext";

type CartButtonProps = {
  count?: number;
};

export function CartButton({ count }: CartButtonProps) {
  const { cartCount } = useShop();
  const visibleCount = count ?? cartCount;

  return (
    <Link
      href="/cart"
      aria-label={`Cart${visibleCount ? `, ${visibleCount} items` : ""}`}
      className="relative flex h-11 w-11 items-center justify-center text-bhor-text transition-colors hover:text-bhor-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary"
    >
      <ShoppingCart className="h-6 w-6" aria-hidden />
      {visibleCount > 0 ? (
        <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-bhor-primary px-1 text-bhor-caption font-bhor-bold leading-none text-white">
          {visibleCount}
        </span>
      ) : null}
    </Link>
  );
}
