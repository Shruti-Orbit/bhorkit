"use client";

import { Heart } from "lucide-react";
import { useShop } from "@/src/context/ShopContext";

export default function WishlistPage() {
  const { isLoggedIn, openAuthModal } = useShop();

  return (
    <main className="flex flex-1 flex-col bg-bhor-cream px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-3xl rounded-bhor-lg border border-bhor-border bg-bhor-surface p-8 text-center shadow-bhor-soft">
        <Heart className="mx-auto h-8 w-8 text-bhor-primary" aria-hidden />
        <h1 className="mt-4 font-bhor-display text-bhor-h2-mobile font-bhor-semibold text-bhor-text md:text-bhor-h2">
          Saved Items
        </h1>
        <p className="mt-3 text-bhor-small leading-bhor-body text-bhor-text-muted">
          {isLoggedIn
            ? "Wishlist products will appear here once saved items are connected."
            : "Login or create an account to view your saved devotional essentials."}
        </p>
        {!isLoggedIn ? (
          <button
            type="button"
            onClick={() => openAuthModal({ mode: "login" })}
            className="mt-6 min-h-12 rounded-bhor-sm bg-bhor-primary px-6 text-bhor-button font-bhor-bold uppercase text-white"
          >
            Login to View Wishlist
          </button>
        ) : null}
      </section>
    </main>
  );
}
