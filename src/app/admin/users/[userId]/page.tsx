"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Card, ConfirmDialog, EmptyState, ErrorState, Field, LoadingState, PageHeader, StatusBadge, Toast, inputClass,
} from "@/src/components/admin/ui";
import { getUser, setUserDisabled, updateUser, type AdminUserDetail } from "@/src/lib/api/admin.api";
import { ApiClientError } from "@/src/lib/api/client";
import { formatPaise } from "@/src/utils/money";
import { formatOrderDate } from "@/src/utils/order";

export default function AdminUserDetailPage() {
  const userId = useParams<{ userId: string }>().userId;
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" }>({ message: "", tone: "success" });

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmDisable, setConfirmDisable] = useState(false);
  const [reason, setReason] = useState("");

  const load = useCallback(() => {
    setState("loading");
    getUser(userId)
      .then((result) => {
        setDetail(result);
        setName(result.user.name);
        setState("ready");
      })
      .catch(() => setState("error"));
  }, [userId]);

  // Deferred a tick rather than called straight from the effect body: `load`
  // flips state to "loading" immediately, which counts as a synchronous
  // setState in an effect (react-hooks/set-state-in-effect).
  useEffect(() => {
    queueMicrotask(load);
  }, [load]);

  async function saveName() {
    setBusy(true);
    try {
      await updateUser(userId, name.trim());
      setToast({ message: "Customer updated.", tone: "success" });
      setEditing(false);
      load();
    } catch (error) {
      setToast({ message: error instanceof ApiClientError ? error.message : "Couldn't save.", tone: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function toggleDisabled() {
    if (!detail) return;
    const disable = !detail.user.disabledAt;
    setBusy(true);
    try {
      await setUserDisabled(userId, disable, reason);
      setToast({ message: disable ? "Account disabled." : "Account enabled.", tone: "success" });
      setConfirmDisable(false);
      setReason("");
      load();
    } catch (error) {
      setToast({ message: error instanceof ApiClientError ? error.message : "Couldn't update the account.", tone: "error" });
      setConfirmDisable(false);
    } finally {
      setBusy(false);
    }
  }

  if (state === "loading") return <LoadingState label="Loading customer…" />;
  if (state === "error" || !detail) return <ErrorState message="Couldn't load this customer." onRetry={load} />;

  const { user, addresses, orders, stats } = detail;
  const disabled = Boolean(user.disabledAt);

  return (
    <div>
      <PageHeader
        title={user.name}
        description={user.email}
        action={
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/users" className="min-h-10 rounded-bhor-sm border border-bhor-border px-4 py-2 text-bhor-button-mobile font-bhor-bold uppercase text-bhor-text">
              Back
            </Link>
            <button
              type="button"
              onClick={() => setConfirmDisable(true)}
              className={`min-h-10 rounded-bhor-sm px-4 py-2 text-bhor-button-mobile font-bhor-bold uppercase ${
                disabled ? "bg-bhor-primary text-white" : "border border-bhor-error text-bhor-error"
              }`}
            >
              {disabled ? "Enable account" : "Disable account"}
            </button>
          </div>
        }
      />

      {disabled ? (
        <p className="mb-4 rounded-bhor-sm border border-bhor-error bg-bhor-peach px-4 py-3 text-bhor-small font-bhor-semibold text-bhor-error">
          This account is disabled{user.disabledReason ? ` — ${user.disabledReason}` : ""}. They can&apos;t sign in.
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="Orders" value={String(stats.orderCount)} />
        <Metric label="Paid orders" value={String(stats.paidOrderCount)} />
        <Metric label="Lifetime value" value={formatPaise(stats.lifetimeValuePaise)} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card>
          <h2 className="border-b border-bhor-border px-4 py-3 text-bhor-small font-bhor-bold text-bhor-text">
            Order history
          </h2>
          {orders.length === 0 ? (
            <EmptyState title="No orders yet" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-bhor-small">
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-bhor-border last:border-0">
                      <td className="px-4 py-3">
                        <Link href={`/admin/orders/${order.id}`} className="font-bhor-semibold text-bhor-text hover:text-bhor-primary">
                          {order.orderNumber}
                        </Link>
                        <p className="text-bhor-caption text-bhor-text-muted">{formatOrderDate(order.createdAt)}</p>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                      <td className="px-4 py-3"><StatusBadge status={order.payment.status} /></td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-bhor-semibold text-bhor-text">
                        {formatPaise(order.pricing.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <div className="space-y-5">
          <Card>
            <h2 className="border-b border-bhor-border px-4 py-3 text-bhor-small font-bhor-bold text-bhor-text">Profile</h2>
            <div className="space-y-3 px-4 py-3 text-bhor-small">
              {editing ? (
                <>
                  <Field label="Name">
                    <input value={name} onChange={(event) => setName(event.target.value)} className={inputClass} />
                  </Field>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={saveName}
                      disabled={busy || name.trim().length < 2}
                      className="min-h-9 rounded-bhor-sm bg-bhor-primary px-4 text-bhor-caption font-bhor-bold uppercase text-white disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => { setEditing(false); setName(user.name); }}
                      className="min-h-9 rounded-bhor-sm border border-bhor-border px-4 text-bhor-caption font-bhor-bold uppercase text-bhor-text"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Row label="Name" value={user.name} />
                  <Row label="Email" value={user.email} />
                  <Row label="Role" value={user.role} />
                  <Row label="Joined" value={formatOrderDate(user.createdAt)} />
                  <Row label="Last login" value={formatOrderDate(user.lastLoginAt)} />
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="min-h-9 rounded-bhor-sm border border-bhor-primary px-4 text-bhor-caption font-bhor-bold uppercase text-bhor-primary"
                  >
                    Edit name
                  </button>
                  <p className="text-bhor-caption text-bhor-text-muted">
                    Email and role are managed outside the panel.
                  </p>
                </>
              )}
            </div>
          </Card>

          <Card>
            <h2 className="border-b border-bhor-border px-4 py-3 text-bhor-small font-bhor-bold text-bhor-text">
              Saved addresses
            </h2>
            {addresses.length === 0 ? (
              <EmptyState title="No saved addresses" />
            ) : (
              <ul className="divide-y divide-bhor-border">
                {addresses.map((address) => (
                  <li key={address.id} className="px-4 py-3 text-bhor-small">
                    <p className="font-bhor-semibold text-bhor-text">
                      {address.fullName}
                      {address.isDefault ? (
                        <span className="ml-2 rounded-bhor-sm bg-bhor-gold-light px-2 py-0.5 text-bhor-badge font-bhor-bold uppercase text-bhor-primary-dark">
                          Default
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-1 text-bhor-caption leading-bhor-body text-bhor-text-muted">
                      {address.house}, {address.area}
                      {address.landmark ? `, ${address.landmark}` : ""}
                      <br />
                      {address.city}, {address.state} - {address.pincode}
                      <br />
                      {address.mobile}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDisable}
        title={disabled ? "Enable this account?" : "Disable this account?"}
        message={
          disabled
            ? "The customer will be able to sign in again."
            : "The customer will be signed out and blocked from signing in. Their orders and history are kept."
        }
        confirmLabel={disabled ? "Enable" : "Disable"}
        destructive={!disabled}
        busy={busy}
        onConfirm={toggleDisabled}
        onCancel={() => setConfirmDisable(false)}
      >
        {!disabled ? (
          <Field label="Reason (optional)">
            <input value={reason} onChange={(event) => setReason(event.target.value)} className={inputClass} />
          </Field>
        ) : null}
      </ConfirmDialog>

      <Toast message={toast.message} tone={toast.tone} onDone={() => setToast({ message: "", tone: "success" })} />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-bhor-md border border-bhor-border bg-bhor-surface px-4 py-3">
      <p className="text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-text-muted">{label}</p>
      <p className="mt-1 text-bhor-h4 font-bhor-bold text-bhor-text">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-bhor-text-muted">{label}</span>
      <span className="break-all text-right text-bhor-text">{value}</span>
    </div>
  );
}
