"use client";

import { useCallback, useEffect, useState } from "react";
import { BadgePercent } from "lucide-react";
import {
  Card, ErrorState, Field, LoadingState, PageHeader, Toast, inputClass,
} from "@/src/components/admin/ui";
import { getCouponForAdmin, saveCoupon, type AdminCoupon } from "@/src/lib/api/coupon.api";
import { ApiClientError } from "@/src/lib/api/client";

/**
 * Coupon management.
 *
 * There is one coupon, and this screen configures it. Saving replaces the
 * current configuration rather than adding to a list, which is what "only the
 * configured active coupon is usable" means in practice — there is no second
 * coupon that could also work.
 *
 * Switching it off keeps the code and the percentage, so a promotion can be
 * paused and resumed without anyone having to remember what it was.
 */
export default function AdminCouponPage() {
  const [existing, setExisting] = useState<AdminCoupon | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [code, setCode] = useState("");
  const [percent, setPercent] = useState("10");
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState("");

  const load = useCallback(async () => {
    try {
      const coupon = await getCouponForAdmin();
      setError("");
      setExisting(coupon);
      if (coupon) {
        setCode(coupon.code);
        setPercent(String(coupon.discountPercent));
        setIsActive(coupon.isActive);
      }
      setLoaded(true);
    } catch (caught) {
      setError(caught instanceof ApiClientError ? caught.message : "Couldn't load the coupon.");
      setLoaded(true);
    }
  }, []);

  useEffect(() => { queueMicrotask(load); }, [load]);

  async function submit() {
    const discountPercent = Number(percent);
    setIsSaving(true);
    setError("");
    try {
      const saved = await saveCoupon({ code: code.trim(), discountPercent, isActive });
      setExisting(saved);
      setCode(saved.code);
      setPercent(String(saved.discountPercent));
      setIsActive(saved.isActive);
      setToast(`${saved.code} saved`);
    } catch (caught) {
      setError(caught instanceof ApiClientError ? caught.message : "Couldn't save the coupon.");
    } finally {
      setIsSaving(false);
    }
  }

  if (!loaded) return <LoadingState label="Loading coupon…" />;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Coupon Management"
        description="One coupon runs at a time. Only the code configured here works at checkout."
      />

      {error ? <ErrorState message={error} /> : null}

      <Card className="max-w-2xl p-4">
        <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
          <BadgePercent className="h-5 w-5 text-rose-700" aria-hidden />
          {existing ? "Active coupon" : "Create the coupon"}
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Coupon code">
            <input
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase())}
              maxLength={24}
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              placeholder="BHOR10"
              className={`${inputClass} uppercase tracking-wide`}
            />
            <p className="mt-1 text-xs text-slate-500">Letters and numbers only. Case does not matter to customers.</p>
          </Field>

          <Field label="Discount percentage">
            <input
              type="number"
              value={percent}
              onChange={(event) => setPercent(event.target.value)}
              min={1}
              max={90}
              step={1}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-slate-500">A whole number between 1 and 90, taken off the subtotal.</p>
          </Field>
        </div>

        <label className="mt-4 flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
            className="h-4 w-4 accent-rose-700"
          />
          Active — customers can use this code at checkout
        </label>

        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            {existing?.updatedAt
              ? `Last updated ${new Date(existing.updatedAt).toLocaleString()}`
              : "No coupon configured yet"}
          </p>
          <button
            type="button"
            onClick={() => void submit()}
            disabled={isSaving}
            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-rose-700 px-5 text-sm font-semibold text-white hover:bg-rose-800 disabled:opacity-60"
          >
            {isSaving ? "Saving…" : existing ? "Update coupon" : "Create coupon"}
          </button>
        </div>
      </Card>

      {toast ? <Toast message={toast} onDone={() => setToast("")} /> : null}
    </div>
  );
}
