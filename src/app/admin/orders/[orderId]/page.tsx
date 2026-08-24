"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Download, ExternalLink } from "lucide-react";
import {
  Card, ConfirmDialog, ErrorState, Field, LoadingState, PageHeader, StatusBadge, Toast, formatStatus, inputClass,
} from "@/src/components/admin/ui";
import {
  adminInvoiceUrl, getOrder, markRefunded, updateOrderStatus, type AdminOrderDetail,
} from "@/src/lib/api/admin.api";
import { ApiClientError } from "@/src/lib/api/client";
import type { OrderStatus } from "@/src/lib/api/order.api";
import { formatPaise } from "@/src/utils/money";
import { deliveryLabel, formatOrderDate } from "@/src/utils/order";

export default function AdminOrderDetailPage() {
  const orderId = useParams<{ orderId: string }>().orderId;
  const [detail, setDetail] = useState<AdminOrderDetail | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" }>({ message: "", tone: "success" });

  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);
  const [refundNote, setRefundNote] = useState("");

  const load = useCallback(() => {
    setState("loading");
    getOrder(orderId)
      .then((result) => {
        setDetail(result);
        setState("ready");
      })
      .catch(() => setState("error"));
  }, [orderId]);

  // Deferred a tick rather than called straight from the effect body: `load`
  // flips state to "loading" immediately, which counts as a synchronous
  // setState in an effect (react-hooks/set-state-in-effect).
  useEffect(() => {
    queueMicrotask(load);
  }, [load]);

  async function applyStatus() {
    if (!pendingStatus) return;
    setBusy(true);
    try {
      const result = await updateOrderStatus(orderId, pendingStatus, note);
      setToast({
        message: result.changed
          ? `Order moved to ${formatStatus(pendingStatus)}.${result.refundRequired ? " A refund is now due." : ""}`
          : "Order already had that status.",
        tone: "success",
      });
      setPendingStatus(null);
      setNote("");
      load();
    } catch (error) {
      // A 409 here usually means another admin moved the order first, so the
      // server's message is more useful than a generic failure.
      setToast({
        message: error instanceof ApiClientError ? error.message : "Couldn't update the order.",
        tone: "error",
      });
      if (error instanceof ApiClientError && error.status === 409) load();
      setPendingStatus(null);
    } finally {
      setBusy(false);
    }
  }

  async function applyRefund() {
    setBusy(true);
    try {
      const result = await markRefunded(orderId, refundNote);
      setToast({ message: result.changed ? "Refund marked processed." : "Refund was already processed.", tone: "success" });
      setRefundOpen(false);
      setRefundNote("");
      load();
    } catch (error) {
      setToast({ message: error instanceof ApiClientError ? error.message : "Couldn't record the refund.", tone: "error" });
    } finally {
      setBusy(false);
    }
  }

  if (state === "loading") return <LoadingState label="Loading order…" />;
  if (state === "error" || !detail) return <ErrorState message="Couldn't load this order." onRetry={load} />;

  const { order, payment, allowedTransitions } = detail;
  const refundDue = Boolean(order.refundRequiredAt) && !order.refundedAt;

  return (
    <div>
      <PageHeader
        title={`Order ${order.orderNumber}`}
        description={`Placed ${formatOrderDate(order.createdAt)} · ${order.source === "direct" ? "Buy Now" : "Cart"}`}
        action={
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/orders" className="min-h-10 rounded-bhor-sm border border-bhor-border px-4 py-2 text-bhor-button-mobile font-bhor-bold uppercase text-bhor-text">
              Back
            </Link>
            {payment.status === "paid" ? (
              <a
                href={adminInvoiceUrl(order.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-10 items-center gap-2 rounded-bhor-sm border border-bhor-primary px-4 py-2 text-bhor-button-mobile font-bhor-bold uppercase text-bhor-primary"
              >
                <Download className="h-4 w-4" aria-hidden />
                Invoice
              </a>
            ) : null}
          </div>
        }
      />

      {refundDue ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-bhor-sm border border-bhor-primary bg-bhor-primary-soft px-4 py-3">
          <p className="text-bhor-small font-bhor-semibold text-bhor-primary-dark">
            This order was cancelled after payment. A refund of {formatPaise(order.pricing.total)} is due.
          </p>
          <button
            type="button"
            onClick={() => setRefundOpen(true)}
            className="min-h-9 rounded-bhor-sm bg-bhor-primary px-4 text-bhor-caption font-bhor-bold uppercase text-white"
          >
            Mark refunded
          </button>
        </div>
      ) : null}
      {order.refundedAt ? (
        <p className="mb-4 rounded-bhor-sm border border-bhor-border bg-bhor-surface px-4 py-3 text-bhor-small text-bhor-text-muted">
          Refund marked processed on {formatOrderDate(order.refundedAt)}.
        </p>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          <Card>
            <SectionTitle>Items</SectionTitle>
            <div className="divide-y divide-bhor-border">
              {order.items.map((item) => (
                <div key={item.productId} className="flex flex-wrap justify-between gap-3 px-4 py-3 text-bhor-small">
                  <div className="min-w-0">
                    <p className="font-bhor-semibold text-bhor-text">{item.name}</p>
                    <p className="text-bhor-caption text-bhor-text-muted">
                      SKU {item.sku} · Qty {item.quantity} × {formatPaise(item.unitPrice)}
                    </p>
                  </div>
                  <p className="font-bhor-semibold text-bhor-text">{formatPaise(item.lineTotal)}</p>
                </div>
              ))}
            </div>
            <div className="space-y-1 border-t border-bhor-border px-4 py-3 text-bhor-small">
              <Row label="Subtotal" value={formatPaise(order.pricing.subtotal)} />
              <Row label="Discount" value={`-${formatPaise(order.pricing.discount)}`} />
              <Row label="Handling" value={order.pricing.handlingCharge === 0 ? "Free" : formatPaise(order.pricing.handlingCharge)} />
              <div className="flex justify-between border-t border-bhor-border pt-2 text-bhor-product font-bhor-bold text-bhor-text">
                <span>Total</span><span>{formatPaise(order.pricing.total)}</span>
              </div>
            </div>
          </Card>

          <Card>
            <SectionTitle>Status timeline</SectionTitle>
            <ol className="space-y-3 px-4 py-3">
              {order.timeline.map((entry, index) => (
                <li key={`${entry.status}-${entry.at}-${index}`} className="flex flex-wrap items-start gap-3 text-bhor-small">
                  <StatusBadge status={entry.status} />
                  <div className="min-w-0 flex-1">
                    <p className="text-bhor-text-muted">{formatOrderDate(entry.at)}</p>
                    {entry.note ? <p className="text-bhor-caption text-bhor-text-muted">{entry.note}</p> : null}
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <SectionTitle>Fulfilment</SectionTitle>
            <div className="px-4 py-3">
              <p className="text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-text-muted">Current</p>
              <div className="mt-1"><StatusBadge status={order.status} /></div>

              {allowedTransitions.length === 0 ? (
                <p className="mt-4 text-bhor-caption text-bhor-text-muted">
                  This order has reached a final state and can&apos;t be moved further.
                </p>
              ) : (
                <div className="mt-4 space-y-2">
                  <p className="text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-text-muted">
                    Move to
                  </p>
                  {/* Options come from the server's allowedTransitions — the UI
                      never offers a move the backend would reject. */}
                  {allowedTransitions.map((next) => (
                    <button
                      key={next}
                      type="button"
                      onClick={() => setPendingStatus(next)}
                      className={`min-h-10 w-full rounded-bhor-sm px-4 text-bhor-button-mobile font-bhor-bold uppercase ${
                        next === "cancelled"
                          ? "border border-bhor-error text-bhor-error"
                          : "bg-bhor-primary text-white"
                      }`}
                    >
                      {formatStatus(next)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <Card>
            <SectionTitle>Payment</SectionTitle>
            <div className="space-y-2 px-4 py-3 text-bhor-small">
              <div className="flex justify-between gap-3">
                <span className="text-bhor-text-muted">Status</span><StatusBadge status={payment.status} />
              </div>
              <Row label="Gateway" value="Razorpay" />
              <Row label="Method" value={payment.method ?? "—"} />
              <Row label="Paid" value={payment.paidAmountPaise != null ? formatPaise(payment.paidAmountPaise) : "—"} />
              <Row label="Paid at" value={payment.paidAt ? formatOrderDate(payment.paidAt) : "—"} />
              <div className="pt-1">
                <p className="text-bhor-caption text-bhor-text-muted">Razorpay order</p>
                <p className="break-all text-bhor-caption text-bhor-text">{payment.razorpayOrderId}</p>
              </div>
              {payment.razorpayPaymentId ? (
                <div>
                  <p className="text-bhor-caption text-bhor-text-muted">Payment id</p>
                  <p className="break-all text-bhor-caption text-bhor-text">{payment.razorpayPaymentId}</p>
                </div>
              ) : null}
              {payment.failureReason ? (
                <p className="rounded-bhor-sm bg-bhor-peach px-3 py-2 text-bhor-caption text-bhor-error">
                  {payment.failureReason}
                </p>
              ) : null}
              {payment.attempts.length > 0 ? (
                <div className="border-t border-bhor-border pt-2">
                  <p className="text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-text-muted">
                    Attempts
                  </p>
                  <ul className="mt-1 space-y-1">
                    {payment.attempts.map((attempt, index) => (
                      <li key={index} className="text-bhor-caption text-bhor-text-muted">
                        {formatOrderDate(attempt.at)} · {attempt.status} · {attempt.description}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <p className="border-t border-bhor-border pt-2 text-bhor-caption text-bhor-text-muted">
                Payment records are read-only. They&apos;re written only by Razorpay&apos;s verified callback and webhook.
              </p>
            </div>
          </Card>

          <Card>
            <SectionTitle>Customer &amp; delivery</SectionTitle>
            <div className="space-y-2 px-4 py-3 text-bhor-small">
              <p className="font-bhor-semibold text-bhor-text">{order.address.fullName}</p>
              <p className="text-bhor-text-muted">
                {order.address.house}, {order.address.area}
                {order.address.landmark ? `, ${order.address.landmark}` : ""}
                <br />
                {order.address.city}, {order.address.state} - {order.address.pincode}
                <br />
                {order.address.mobile}
              </p>
              <p className="border-t border-bhor-border pt-2 text-bhor-text-muted">{deliveryLabel(order)}</p>
              <Link
                href={`/admin/users?search=${encodeURIComponent(order.address.mobile)}`}
                className="inline-flex items-center gap-1 text-bhor-caption font-bhor-bold uppercase text-bhor-primary"
              >
                Find customer <ExternalLink className="h-3 w-3" aria-hidden />
              </Link>
            </div>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={pendingStatus !== null}
        title={`Move to ${pendingStatus ? formatStatus(pendingStatus) : ""}?`}
        message={
          pendingStatus === "cancelled" && payment.status === "paid"
            ? "This order has been paid. Cancelling records a refund obligation — the payment record itself is not changed."
            : "The customer will see this change in their order tracking."
        }
        confirmLabel={pendingStatus === "cancelled" ? "Cancel order" : "Update status"}
        destructive={pendingStatus === "cancelled"}
        busy={busy}
        onConfirm={applyStatus}
        onCancel={() => setPendingStatus(null)}
      >
        <Field label="Note (optional)">
          <input value={note} onChange={(event) => setNote(event.target.value)} className={inputClass} placeholder="Visible in the order timeline" />
        </Field>
      </ConfirmDialog>

      <ConfirmDialog
        open={refundOpen}
        title="Mark refund processed?"
        message="Record that this refund has been issued in Razorpay. This is a bookkeeping note — it does not move money."
        confirmLabel="Mark refunded"
        busy={busy}
        onConfirm={applyRefund}
        onCancel={() => setRefundOpen(false)}
      >
        <Field label="Reference (optional)">
          <input value={refundNote} onChange={(event) => setRefundNote(event.target.value)} className={inputClass} placeholder="Razorpay refund id" />
        </Field>
      </ConfirmDialog>

      <Toast message={toast.message} tone={toast.tone} onDone={() => setToast({ message: "", tone: "success" })} />
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="border-b border-bhor-border px-4 py-3 text-bhor-small font-bhor-bold text-bhor-text">{children}</h2>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-bhor-text-muted">{label}</span>
      <span className="text-right text-bhor-text">{value}</span>
    </div>
  );
}
