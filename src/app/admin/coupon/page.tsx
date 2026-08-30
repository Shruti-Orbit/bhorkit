"use client";

import { useCallback, useEffect, useState } from "react";
import { BadgePercent, Megaphone } from "lucide-react";
import {
  Card, ErrorState, Field, LoadingState, PageHeader, Toast, inputClass,
} from "@/src/components/admin/ui";
import {
  getCouponForAdmin, saveCoupon,
  type AdminCoupon, type AnnouncementSettings,
} from "@/src/lib/api/coupon.api";
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
/** The colours the bar paints, and what each one is for. */
const COLOUR_FIELDS: { key: keyof AnnouncementSettings; label: string }[] = [
  { key: "background", label: "Bar background" },
  { key: "textColor", label: "Text" },
  { key: "accentColor", label: "Code & countdown" },
  { key: "buttonBackground", label: "Button background" },
  { key: "buttonTextColor", label: "Button text" },
];

const BLANK_ANNOUNCEMENT: AnnouncementSettings = {
  enabled: false,
  message: "",
  buttonLabel: "GRAB NOW",
  startsAt: "",
  endsAt: "",
  background: "#FDF3E7",
  textColor: "#7A1533",
  accentColor: "#A31545",
  buttonBackground: "#A31545",
  buttonTextColor: "#FFFFFF",
};

/**
 * A datetime-local input works in the browser's own timezone, while the API
 * speaks in instants. These two convert between them, so an admin in Patna
 * picks 9pm and the promotion ends at 9pm in Patna — whatever timezone the
 * server happens to run in.
 */
function toLocalInput(iso: string) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function fromLocalInput(local: string) {
  if (!local) return "";
  const date = new Date(local);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

export default function AdminCouponPage() {
  const [existing, setExisting] = useState<AdminCoupon | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [code, setCode] = useState("");
  const [percent, setPercent] = useState("10");
  const [isActive, setIsActive] = useState(true);
  const [bar, setBar] = useState<AnnouncementSettings>(BLANK_ANNOUNCEMENT);
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
        setBar({ ...BLANK_ANNOUNCEMENT, ...coupon.announcement });
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
      const saved = await saveCoupon({
        code: code.trim(),
        discountPercent,
        isActive,
        announcement: bar,
      });
      setExisting(saved);
      setCode(saved.code);
      setPercent(String(saved.discountPercent));
      setIsActive(saved.isActive);
      setBar({ ...BLANK_ANNOUNCEMENT, ...saved.announcement });
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

      <Card className="max-w-2xl p-4">
        <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
          <Megaphone className="h-5 w-5 text-rose-700" aria-hidden />
          Announcement bar
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          The strip at the very top of the storefront. It advertises the coupon above, so the code
          and discount shown are always the ones that work at checkout.
        </p>

        <label className="mt-4 flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={bar.enabled}
            onChange={(event) => setBar((b) => ({ ...b, enabled: event.target.checked }))}
            className="h-4 w-4 accent-rose-700"
          />
          Show the bar on the storefront
        </label>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Message">
              <input
                value={bar.message}
                onChange={(event) => setBar((b) => ({ ...b, message: event.target.value }))}
                maxLength={120}
                placeholder="Monsoon Sale Alert — on all puja kits"
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Button label">
            <input
              value={bar.buttonLabel}
              onChange={(event) => setBar((b) => ({ ...b, buttonLabel: event.target.value }))}
              maxLength={24}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-slate-500">Shown as a static badge — it is not a link.</p>
          </Field>

          <Field label="Starts (optional)">
            <input
              type="datetime-local"
              value={toLocalInput(bar.startsAt)}
              onChange={(event) => setBar((b) => ({ ...b, startsAt: fromLocalInput(event.target.value) }))}
              className={inputClass}
            />
          </Field>

          <Field label="Ends">
            <input
              type="datetime-local"
              value={toLocalInput(bar.endsAt)}
              onChange={(event) => setBar((b) => ({ ...b, endsAt: fromLocalInput(event.target.value) }))}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-slate-500">
              The countdown runs to this moment, in your own timezone. The bar hides itself when it
              passes.
            </p>
          </Field>
        </div>

        <div className="mt-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Colours</p>
          <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {COLOUR_FIELDS.map(({ key, label }) => (
              <Field key={key} label={label}>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={String(bar[key])}
                    onChange={(event) => setBar((b) => ({ ...b, [key]: event.target.value.toUpperCase() }))}
                    aria-label={label}
                    className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
                  />
                  <input
                    value={String(bar[key])}
                    onChange={(event) => setBar((b) => ({ ...b, [key]: event.target.value.toUpperCase() }))}
                    maxLength={7}
                    className={`${inputClass} font-mono uppercase`}
                  />
                </div>
              </Field>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Preview</p>
          <div
            style={{ backgroundColor: bar.background, color: bar.textColor }}
            className="mt-2 flex flex-col items-center gap-2 rounded-lg px-4 py-3 text-center sm:flex-row sm:justify-center sm:gap-5"
          >
            <div className="min-w-0">
              <p className="text-sm font-bold">{bar.message || "Your message here"}</p>
              <p className="text-sm font-bold">
                Coupon code : <span style={{ color: bar.accentColor }}>{code || "CODE"}</span>
              </p>
            </div>
            <div className="flex gap-2">
              {["00", "11", "40", "09"].map((value, index) => (
                <span key={index} className="flex w-10 flex-col items-center">
                  <span style={{ color: bar.accentColor }} className="text-lg font-bold leading-none">{value}</span>
                  <span className="text-[10px] uppercase opacity-70">{["days", "hrs", "mins", "secs"][index]}</span>
                </span>
              ))}
            </div>
            <span
              style={{ backgroundColor: bar.buttonBackground, color: bar.buttonTextColor }}
              className="rounded px-4 py-1.5 text-xs font-bold uppercase"
            >
              {bar.buttonLabel || "GRAB NOW"}
            </span>
          </div>
        </div>
      </Card>

      {toast ? <Toast message={toast} onDone={() => setToast("")} /> : null}
    </div>
  );
}
