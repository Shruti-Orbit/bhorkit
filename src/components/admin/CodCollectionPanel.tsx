"use client";

import { useEffect, useState } from "react";
import { Banknote, CheckCircle2, Loader2, QrCode, X } from "lucide-react";
import { ConfirmDialog, Field, inputClass } from "@/src/components/admin/ui";
import {
  getCodCollection,
  recordCodCash,
  startCodQr,
  type CodCollectionView,
} from "@/src/lib/api/admin.api";
import { ApiClientError } from "@/src/lib/api/client";
import { formatPaise } from "@/src/utils/money";

type CodCollectionPanelProps = {
  orderId: string;
  amountPaise: number;
  /**
   * Whether the payment is still to collect. The buttons show only while it is;
   * the QR dialog stays mounted afterwards so its "Paid" confirmation remains on
   * screen when the order reloads.
   */
  due: boolean;
  /** Called once the payment is recorded, so the page can reload the order. */
  onPaid: () => void;
  onNotify: (message: string, tone: "success" | "error") => void;
};

const POLL_MS = 4000;

/**
 * Collecting a pay-on-delivery order at the door.
 *
 * "Show UPI QR" opens a QR for exactly this order's amount, sized to be scanned
 * off a phone screen. The panel watches for the payment and turns green only
 * when the server has it — from Razorpay's webhook, or from asking Razorpay
 * directly — so what the customer shows on their own phone is never the
 * evidence. "Cash received" records a cash payment instead.
 *
 * Either way the order is marked paid on the server and the customer's invoice
 * is emailed automatically.
 */
export function CodCollectionPanel({ orderId, amountPaise, due, onPaid, onNotify }: CodCollectionPanelProps) {
  const [view, setView] = useState<CodCollectionView | null>(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [cashOpen, setCashOpen] = useState(false);
  const [cashNote, setCashNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const paid = view?.paymentStatus === "paid";

  // Watches for the payment while the QR is on screen. Each tick asks the
  // server, which also checks with Razorpay in case the webhook is slow.
  useEffect(() => {
    if (!qrOpen || paid) return;
    let active = true;
    const timer = window.setInterval(() => {
      getCodCollection(orderId)
        .then((next) => {
          if (!active) return;
          setView(next);
          if (next.paymentStatus === "paid") {
            onNotify("Payment received — the invoice is on its way to the customer.", "success");
            onPaid();
          }
        })
        .catch(() => {
          // A missed tick is not worth an error; the next one tries again.
        });
    }, POLL_MS);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [qrOpen, paid, orderId, onPaid, onNotify]);

  async function showQr() {
    setCreating(true);
    setError("");
    try {
      const next = await startCodQr(orderId);
      setView(next);
      setQrOpen(true);
      if (next.paymentStatus === "paid") onPaid();
    } catch (caught) {
      setError(caught instanceof ApiClientError ? caught.message : "Couldn't create the payment QR.");
    } finally {
      setCreating(false);
    }
  }

  async function confirmCash() {
    setBusy(true);
    setError("");
    try {
      const result = await recordCodCash(orderId, cashNote);
      setView(result);
      setCashOpen(false);
      setCashNote("");
      onNotify(
        result.changed
          ? "Cash payment recorded — the invoice is on its way to the customer."
          : "This order was already paid.",
        "success",
      );
      onPaid();
    } catch (caught) {
      setCashOpen(false);
      onNotify(caught instanceof ApiClientError ? caught.message : "Couldn't record the cash payment.", "error");
    } finally {
      setBusy(false);
    }
  }

  const qr = view?.qr ?? null;

  return (
    <div className={due ? "space-y-3 border-t border-bhor-border pt-3" : ""}>
      {due ? (
        <>
          <p className="text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-text-muted">
            Collect {formatPaise(amountPaise)} on delivery
          </p>

          <button
            type="button"
            onClick={() => void showQr()}
            disabled={creating || busy}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-bhor-sm bg-bhor-primary px-4 text-bhor-button-mobile font-bhor-bold uppercase text-white disabled:opacity-60"
          >
            {creating ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <QrCode className="h-4 w-4" aria-hidden />}
            Show UPI QR
          </button>

          <button
            type="button"
            onClick={() => setCashOpen(true)}
            disabled={creating || busy}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-bhor-sm border border-bhor-primary px-4 text-bhor-button-mobile font-bhor-bold uppercase text-bhor-primary disabled:opacity-60"
          >
            <Banknote className="h-4 w-4" aria-hidden />
            Cash received
          </button>

          {error ? (
            <p role="alert" className="rounded-bhor-sm bg-bhor-peach px-3 py-2 text-bhor-caption text-bhor-error">
              {error}
            </p>
          ) : null}
        </>
      ) : null}

      {qrOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bhor-text/60 p-4" role="dialog" aria-modal="true" aria-label="Collect payment">
          <div className="relative w-full max-w-sm rounded-bhor-lg bg-bhor-surface p-6 text-center shadow-bhor-soft">
            <button
              type="button"
              onClick={() => setQrOpen(false)}
              aria-label="Close"
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-bhor-text-muted hover:bg-bhor-cream"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>

            {paid ? (
              <>
                <CheckCircle2 className="mx-auto h-20 w-20 text-bhor-success" aria-hidden />
                <p className="mt-4 text-bhor-h3-mobile font-bhor-bold text-bhor-success">Paid</p>
                <p className="mt-1 text-bhor-small text-bhor-text-muted">
                  {formatPaise(amountPaise)} received. You can hand over the order.
                </p>
              </>
            ) : qr ? (
              <>
                <p className="text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-text-muted">
                  Scan to pay
                </p>
                <p className="mt-1 text-bhor-h3-mobile font-bhor-bold text-bhor-text">{formatPaise(qr.amountPaise)}</p>
                {/* A plain <img>: Razorpay's URL is short-lived and must be shown
                    exactly as Razorpay serves it, not through Next's image optimiser. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qr.imageUrl}
                  alt={`UPI QR code for ${formatPaise(qr.amountPaise)}`}
                  className="mx-auto mt-4 aspect-square w-full max-w-[280px] rounded-bhor-md border border-bhor-border bg-white object-contain p-2"
                />
                <p className="mt-4 flex items-center justify-center gap-2 text-bhor-small font-bhor-semibold text-bhor-text-muted">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Waiting for payment…
                </p>
                <p className="mt-2 text-bhor-caption text-bhor-text-muted">
                  Hand over the order only when this turns green. Don&apos;t rely on a payment screenshot.
                </p>
                <p className="mt-1 text-bhor-caption text-bhor-text-muted">
                  QR valid until{" "}
                  {new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit" }).format(new Date(qr.expiresAt))}
                </p>
              </>
            ) : (
              <p className="text-bhor-small text-bhor-text-muted">This QR has expired. Close and show a new one.</p>
            )}
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={cashOpen}
        title={`Record ${formatPaise(amountPaise)} received in cash?`}
        message="The order is marked paid and the customer's invoice is emailed straight away. Only confirm once you have the cash in hand."
        confirmLabel="Cash received"
        busy={busy}
        onConfirm={() => void confirmCash()}
        onCancel={() => setCashOpen(false)}
      >
        <Field label="Note (optional)">
          <input
            value={cashNote}
            onChange={(event) => setCashNote(event.target.value)}
            maxLength={300}
            className={inputClass}
            placeholder="e.g. collected by Ravi"
          />
        </Field>
      </ConfirmDialog>
    </div>
  );
}
