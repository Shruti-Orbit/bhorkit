"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Banknote } from "lucide-react";
import { Card, ErrorState, Field, LoadingState, PageHeader, Toast, inputClass } from "@/src/components/admin/ui";
import { getCodSettings, saveCodSettings, type AdminCodSettings } from "@/src/lib/api/admin.api";
import { ApiClientError } from "@/src/lib/api/client";
import { formatPaise } from "@/src/utils/money";

/** Rupees typed into the form, as whole paise for the API. */
function toPaise(value: string) {
  const rupees = Number(value);
  return Number.isFinite(rupees) ? Math.round(rupees * 100) : NaN;
}

/**
 * Pay-on-delivery settings: whether it is offered, the fee, and the largest
 * order it may cover.
 *
 * Which products allow it is set per product on the Products screen; this page
 * holds the rules that apply to every pay-on-delivery order. The server checks
 * both at checkout and again when the order is placed.
 */
export default function AdminCodSettingsPage() {
  const [settings, setSettings] = useState<AdminCodSettings | null>(null);
  const [loadError, setLoadError] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [fee, setFee] = useState("");
  const [maxOrder, setMaxOrder] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" }>({ message: "", tone: "success" });

  const load = useCallback(async () => {
    try {
      const loaded = await getCodSettings();
      setLoadError("");
      setSettings(loaded);
      setEnabled(loaded.enabled);
      setFee(String(loaded.feePaise / 100));
      setMaxOrder(String(loaded.maxOrderPaise / 100));
    } catch (caught) {
      setLoadError(caught instanceof ApiClientError ? caught.message : "Couldn't load pay-on-delivery settings.");
    }
  }, []);

  useEffect(() => { queueMicrotask(load); }, [load]);

  if (!settings) {
    return loadError ? <ErrorState message={loadError} onRetry={() => void load()} /> : <LoadingState label="Loading settings…" />;
  }

  const feePaise = toPaise(fee);
  const maxOrderPaise = toPaise(maxOrder);
  const feeInvalid = !Number.isInteger(feePaise) || feePaise < 0 || feePaise > 50_000;
  const maxInvalid = !Number.isInteger(maxOrderPaise) || maxOrderPaise < 100 || maxOrderPaise > 10_000_000;
  const changed =
    enabled !== settings.enabled || feePaise !== settings.feePaise || maxOrderPaise !== settings.maxOrderPaise;

  async function save() {
    setSaving(true);
    try {
      const saved = await saveCodSettings({ enabled, feePaise, maxOrderPaise });
      setSettings(saved);
      setToast({ message: "Pay-on-delivery settings saved", tone: "success" });
    } catch (caught) {
      setToast({ message: caught instanceof ApiClientError ? caught.message : "Couldn't save the settings.", tone: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Cash on Delivery"
        description="Let customers pay when their order arrives — by UPI QR or in cash."
      />

      <Card className="max-w-2xl p-4">
        <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
          <Banknote className="h-5 w-5 text-rose-700" aria-hidden />
          Pay on delivery
        </h2>

        <label className="mt-4 flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(event) => setEnabled(event.target.checked)}
            className="h-4 w-4 accent-rose-700"
          />
          Offer pay on delivery at checkout
        </label>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Pay-on-delivery fee (₹)">
            <input
              type="number"
              min={0}
              max={500}
              step={1}
              value={fee}
              onChange={(event) => setFee(event.target.value)}
              className={`${inputClass} ${feeInvalid ? "border-rose-500" : ""}`}
            />
            <p className="mt-1 text-xs text-slate-500">Set it to 0 for free pay on delivery during a promotion.</p>
          </Field>

          <Field label="Maximum order value (₹)">
            <input
              type="number"
              min={1}
              step={1}
              value={maxOrder}
              onChange={(event) => setMaxOrder(event.target.value)}
              className={`${inputClass} ${maxInvalid ? "border-rose-500" : ""}`}
            />
            <p className="mt-1 text-xs text-slate-500">The most that can be collected at the door, fee included.</p>
          </Field>
        </div>

        {!feeInvalid && !maxInvalid ? (
          <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
            {enabled
              ? `Customers pay ${feePaise === 0 ? "no extra charge" : `${formatPaise(feePaise)} extra`}, on orders up to ${formatPaise(maxOrderPaise)}. Pay-on-delivery orders do not get the 10% online discount.`
              : "Pay on delivery is switched off. Customers can only pay online."}
          </p>
        ) : (
          <p className="mt-4 text-xs font-medium text-rose-700">
            Enter a fee between ₹0 and ₹500, and a maximum order of at least ₹1.
          </p>
        )}

        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            {settings.updatedAt ? `Last updated ${new Date(settings.updatedAt).toLocaleString()}` : "Using default settings"}
          </p>
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving || feeInvalid || maxInvalid || !changed}
            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-rose-700 px-5 text-sm font-semibold text-white hover:bg-rose-800 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save settings"}
          </button>
        </div>
      </Card>

      <Card className="max-w-2xl p-4 text-sm text-slate-600">
        <h2 className="text-base font-semibold text-slate-900">How it works</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            Choose which products allow pay on delivery on the{" "}
            <Link href="/admin/products" className="font-semibold text-rose-700 underline">Products</Link> page.
            An order can use it only when every item allows it.
          </li>
          <li>At the door, open the order and tap <strong>Show UPI QR</strong>. It turns green once the payment reaches your Razorpay account.</li>
          <li>For cash, tap <strong>Cash received</strong>.</li>
          <li>
            The customer is emailed a confirmation with the invoice (marked payment due) as soon as the order is
            placed, and the paid invoice once you collect the payment.
          </li>
          <li>An order can be marked Delivered only after its payment is collected.</li>
          <li>UPI QR needs QR Codes enabled on your Razorpay account and the <code>qr_code.credited</code> webhook event.</li>
        </ul>
      </Card>

      <Toast message={toast.message} tone={toast.tone} onDone={() => setToast({ message: "", tone: "success" })} />
    </div>
  );
}
