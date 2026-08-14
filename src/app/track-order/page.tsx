"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useShop, type CustomerOrder } from "@/src/context/ShopContext";
import { formatCurrency } from "@/src/utils/discount";

const standardSteps = ["confirmed", "processing", "packed", "out-for-delivery", "delivered"];
const preOrderSteps = ["pre-order-confirmed", "preparing", "scheduled-for-dispatch", "dispatched", "delivered"];

export default function TrackOrderPage() {
  return (
    <Suspense fallback={null}>
      <TrackOrderContent />
    </Suspense>
  );
}

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const { findOrders, isLoggedIn, openAuthModal } = useShop();
  const initialOrderId = searchParams.get("orderId") ?? "";
  const [query, setQuery] = useState(initialOrderId);
  const [searched, setSearched] = useState(Boolean(initialOrderId));
  const [results, setResults] = useState<CustomerOrder[]>(() =>
    initialOrderId ? findOrders(initialOrderId) : [],
  );

  return (
    <main className="flex flex-1 flex-col bg-bhor-cream px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto w-full max-w-4xl rounded-bhor-lg border border-bhor-border bg-bhor-surface p-6 shadow-bhor-soft">
        <p className="text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-gold">
          Track Order
        </p>
        <h1 className="mt-2 font-bhor-display text-bhor-h2-mobile font-bhor-semibold text-bhor-text md:text-bhor-h2">
          Track Your BHORKIT Order
        </h1>
        <form onSubmit={trackOrder} className="mt-6 flex flex-col gap-3 sm:flex-row">
          <label className="flex-1">
            <span className="text-bhor-small font-bhor-semibold text-bhor-text">Order ID or mobile number</span>
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Enter order ID or mobile number"
              className="mt-2 min-h-12 w-full rounded-bhor-sm border border-bhor-border bg-bhor-cream px-4 text-bhor-small text-bhor-text outline-none focus:border-bhor-primary"
            />
          </label>
          <button
            type="submit"
            className="mt-auto inline-flex min-h-12 items-center justify-center gap-2 rounded-bhor-sm bg-bhor-primary px-6 text-bhor-button font-bhor-bold uppercase text-white"
          >
            <Search className="h-4 w-4" aria-hidden />
            Track Order
          </button>
        </form>

        {!isLoggedIn ? (
          <div className="mt-5 rounded-bhor-md bg-bhor-primary-soft p-4">
            <p className="text-bhor-small font-bhor-semibold text-bhor-primary">
              Login to view your saved BHORKIT order history across sessions.
            </p>
            <button type="button" onClick={() => openAuthModal({ mode: "login" })} className="mt-3 text-bhor-small font-bhor-bold uppercase text-bhor-primary">
              Login or Create Account
            </button>
          </div>
        ) : null}

        {searched ? (
          results.length > 0 ? (
            <div className="mt-6 space-y-5">
              {results.map((order) => (
                <article key={order.id} className="rounded-bhor-md border border-bhor-border bg-bhor-cream p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-bhor-product font-bhor-bold text-bhor-text">
                        Order #{order.id}
                      </h2>
                      <p className="mt-2 text-bhor-small font-bhor-semibold text-bhor-text">
                        {order.items[0]?.product.name}
                      </p>
                      <p className="mt-1 text-bhor-small text-bhor-text-muted">
                        Expected Delivery: {order.expectedDelivery ?? order.expectedDispatch ?? "To be confirmed"}
                      </p>
                    </div>
                    <p className="text-bhor-product font-bhor-bold text-bhor-text">
                      {formatCurrency(order.total)}
                    </p>
                  </div>
                  <TrackingTimeline order={order} />
                  <Link href={`/account/orders/${order.id}`} className="mt-5 inline-flex min-h-10 items-center justify-center rounded-bhor-sm border border-bhor-primary px-4 text-bhor-button-mobile font-bhor-bold uppercase text-bhor-primary">
                    View Order
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-bhor-md border border-bhor-border bg-bhor-cream p-5 text-center">
              <h2 className="text-bhor-product font-bhor-bold text-bhor-text">No order found</h2>
              <p className="mt-2 text-bhor-small text-bhor-text-muted">
                Check your order ID or mobile number and try again.
              </p>
            </div>
          )
        ) : null}
      </section>
    </main>
  );

  function trackOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResults(findOrders(query));
    setSearched(true);
  }
}

function TrackingTimeline({ order }: { order: CustomerOrder }) {
  const steps = order.checkoutMode === "pre-order" ? preOrderSteps : standardSteps;
  const activeIndex = steps.indexOf(order.status);

  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-5">
      {steps.map((step, index) => {
        const done = index <= activeIndex;
        return (
          <div key={step} className="flex items-center gap-2 sm:flex-col sm:items-start">
            <span className={`flex h-7 w-7 items-center justify-center rounded-full text-bhor-caption font-bhor-bold ${done ? "bg-bhor-success text-white" : "bg-bhor-surface text-bhor-primary"}`}>
              {done ? "✓" : "○"}
            </span>
            <p className="text-bhor-caption font-bhor-semibold uppercase text-bhor-text">
              {step.split("-").join(" ")}
            </p>
          </div>
        );
      })}
    </div>
  );
}
