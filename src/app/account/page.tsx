"use client";

import { useShop } from "@/src/context/ShopContext";

export default function AccountPage() {
  const { currentUser, isLoggedIn, openAuthModal } = useShop();

  return (
    <main className="flex flex-1 flex-col bg-bhor-cream px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-3xl rounded-bhor-lg border border-bhor-border bg-bhor-surface p-8 shadow-bhor-soft">
        <p className="text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-gold">
          My Account
        </p>
        <h1 className="mt-2 font-bhor-display text-bhor-h2-mobile font-bhor-semibold text-bhor-text md:text-bhor-h2">
          BHORKIT Account
        </h1>
        {isLoggedIn && currentUser ? (
          <p className="mt-3 text-bhor-small text-bhor-text-muted">
            Logged in as {currentUser.email}. Full account details will be connected later.
          </p>
        ) : (
          <>
            <p className="mt-3 text-bhor-small text-bhor-text-muted">
              Login or create an account to manage your orders and saved items.
            </p>
            <button
              type="button"
              onClick={() => openAuthModal({ mode: "login" })}
              className="mt-5 min-h-12 rounded-bhor-sm bg-bhor-primary px-6 text-bhor-button font-bhor-bold uppercase text-white"
            >
              Login
            </button>
          </>
        )}
      </section>
    </main>
  );
}
