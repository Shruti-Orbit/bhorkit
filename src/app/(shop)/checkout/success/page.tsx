"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Clock, Download, Loader2, XCircle } from "lucide-react";
import { getInvoiceUrl, getOrder, reconcileOrder, type BackendOrder } from "@/src/lib/api/order.api";
import { formatPaise } from "@/src/utils/money";
import { deliveryLabel, formatOrderStatus, paymentMethodLabel } from "@/src/utils/order";

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<CenteredCard><LoadingState /></CenteredCard>}>
      <SuccessContent />
    </Suspense>
  );
}

function SuccessContent() {
  const orderId = useSearchParams().get("orderId") ?? "";
  const [order, setOrder] = useState<BackendOrder | null>(null);
  // A missing id is knowable at first render, so it's the initial state rather
  // than something an effect has to correct after a wasted render pass.
  const [state, setState] = useState<"loading" | "ready" | "error">(orderId ? "loading" : "error");

  // A customer can land here from a redirect, a bookmark or a browser refresh,
  // so the page reads the order from the server rather than trusting anything
  // carried in the URL beyond the id. If the order is still unpaid — the
  // webhook hasn't landed yet for a delayed UPI payment — one reconcile pass
  // asks Razorpay directly instead of showing a misleading failure.
  useEffect(() => {
    if (!orderId) return;

    let active = true;

    getOrder(orderId)
      .then(async (fetched) => {
        if (fetched.payment.status === "paid") return fetched;
        const reconciled = await reconcileOrder(orderId, "status").catch(() => null);
        return reconciled?.order ?? fetched;
      })
      .then((resolved) => {
        if (!active) return;
        setOrder(resolved);
        setState("ready");
      })
      .catch(() => {
        if (!active) return;
        setState("error");
      });

    return () => {
      active = false;
    };
  }, [orderId]);

  if (state === "loading") {
    return <CenteredCard><LoadingState /></CenteredCard>;
  }

  if (state === "error" || !order) {
    return (
      <CenteredCard>
        <XCircle className="mx-auto h-12 w-12 text-bhor-error" aria-hidden />
        <h1 className="mt-4 font-bhor-display text-bhor-h3-mobile font-bhor-semibold text-bhor-text">
          We couldn&apos;t find that order
        </h1>
        <p className="mt-2 text-bhor-small text-bhor-text-muted">
          If your payment went through, the order will appear in your account shortly.
        </p>
        <Link href="/account/orders" className={primaryButton}>
          Go to My Orders
        </Link>
      </CenteredCard>
    );
  }

  const paid = order.payment.status === "paid";

  return (
    <main className="flex flex-1 flex-col bg-bhor-cream px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-2xl space-y-5">
        <section className="rounded-bhor-lg border border-bhor-border bg-bhor-surface p-8 text-center shadow-bhor-soft">
          {paid ? (
            <CheckCircle2 className="mx-auto h-14 w-14 text-bhor-success" aria-hidden />
          ) : (
            <Clock className="mx-auto h-14 w-14 text-bhor-gold" aria-hidden />
          )}
          <h1 className="mt-4 font-bhor-display text-bhor-h3-mobile font-bhor-semibold text-bhor-text md:text-bhor-h3">
            {paid ? "Your order is confirmed 🪔" : "We're confirming your payment"}
          </h1>
          <p className="mt-2 text-bhor-small leading-bhor-body text-bhor-text-muted">
            {paid
              ? "Thank you for choosing BHORKIT. A confirmation email with your invoice is on its way."
              : "Your payment is still being processed. This page updates once it's confirmed — you can safely close it, we'll email you either way."}
          </p>

          <dl className="mt-6 grid gap-3 rounded-bhor-md bg-bhor-primary-soft p-4 text-left sm:grid-cols-2">
            <Field label="Order ID" value={order.orderNumber} />
            <Field label="Total" value={formatPaise(order.pricing.total)} />
            <Field label="Delivery" value={deliveryLabel(order)} />
            <Field
              label="Payment"
              value={paid ? paymentMethodLabel(order.payment.method) : formatOrderStatus(order.status)}
            />
          </dl>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href={`/account/orders/${order.id}`} className={primaryButton}>
              View Order
            </Link>
            {paid ? (
              <a
                href={getInvoiceUrl(order.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-bhor-sm border border-bhor-primary px-5 text-bhor-button font-bhor-bold uppercase text-bhor-primary"
              >
                <Download className="h-4 w-4" aria-hidden />
                Invoice
              </a>
            ) : null}
          </div>
        </section>

        <section className="rounded-bhor-lg border border-bhor-border bg-bhor-surface p-5 shadow-bhor-soft">
          <h2 className="text-bhor-product font-bhor-bold text-bhor-text">Delivering To</h2>
          <p className="mt-2 text-bhor-small leading-bhor-body text-bhor-text-muted">
            {order.address.fullName}
            <br />
            {order.address.house}, {order.address.area}
            {order.address.landmark ? `, ${order.address.landmark}` : ""}
            <br />
            {order.address.city}, {order.address.state} - {order.address.pincode}
            <br />
            Mobile: {order.address.mobile}
          </p>
        </section>
      </div>
    </main>
  );
}

const primaryButton =
  "inline-flex min-h-11 items-center justify-center rounded-bhor-sm bg-bhor-primary px-5 text-bhor-button font-bhor-bold uppercase text-white";

function CenteredCard({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-1 flex-col bg-bhor-cream px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-2xl rounded-bhor-lg border border-bhor-border bg-bhor-surface p-8 text-center shadow-bhor-soft">
        {children}
      </div>
    </main>
  );
}

function LoadingState() {
  return (
    <>
      <Loader2 className="mx-auto h-10 w-10 animate-spin text-bhor-primary" aria-hidden />
      <p className="mt-4 text-bhor-small text-bhor-text-muted">Confirming your order…</p>
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-primary-dark">
        {label}
      </dt>
      <dd className="mt-1 text-bhor-small font-bhor-semibold text-bhor-text">{value}</dd>
    </div>
  );
}
