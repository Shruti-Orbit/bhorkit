"use client";

import { useShop } from "@/src/context/ShopContext";

export default function OrdersPage() {
  const { isLoggedIn, openAuthModal } = useShop();

  return (
    <main className="flex flex-1 flex-col bg-bhor-cream px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-3xl rounded-bhor-lg border border-bhor-border bg-bhor-surface p-8 shadow-bhor-soft">
        <p className="text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-gold">
          My Orders
        </p>
        <h1 className="mt-2 font-bhor-display text-bhor-h2-mobile font-bhor-semibold text-bhor-text md:text-bhor-h2">
          Your BHORKIT Orders
        </h1>
        <p className="mt-3 text-bhor-small text-bhor-text-muted">
          {isLoggedIn
            ? "Order history will appear here once backend order data is connected."
            : "Login to view your BHORKIT orders."}
        </p>
        {!isLoggedIn ? (
          <button
            type="button"
            onClick={() => openAuthModal({ mode: "login" })}
            className="mt-5 min-h-12 rounded-bhor-sm bg-bhor-primary px-6 text-bhor-button font-bhor-bold uppercase text-white"
          >
            Login
          </button>
        ) : null}
      </section>
    </main>
  );
}
