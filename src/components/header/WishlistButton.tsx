"use client";

import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useShop } from "@/src/context/ShopContext";

export function WishlistButton() {
  const { isAuthReady, isLoggedIn, openAuthModal, savedItemCount } = useShop();
  const router = useRouter();

  return (
    <button
      type="button"
      aria-label="Wishlist"
      aria-busy={!isAuthReady}
      onClick={() => {
        // Acting before the session check resolves would pop the login modal
        // in front of a user who is actually already signed in.
        if (!isAuthReady) {
          return;
        }
        if (!isLoggedIn) {
          openAuthModal();
          return;
        }
        router.push("/account/saved-items");
      }}
      className="relative flex h-11 w-11 items-center justify-center text-bhor-text transition-colors hover:text-bhor-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary"
    >
      <Heart className="h-6 w-6" aria-hidden />
      {savedItemCount > 0 ? (
        <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-bhor-primary px-1 text-bhor-badge font-bhor-bold leading-none text-white">
          {savedItemCount}
        </span>
      ) : null}
    </button>
  );
}
