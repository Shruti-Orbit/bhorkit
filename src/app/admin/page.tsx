"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Card, EmptyState, ErrorState, LoadingState, PageHeader, StatusBadge } from "@/src/components/admin/ui";
import { getDashboard, type AdminDashboard } from "@/src/lib/api/admin.api";
import { formatPaise } from "@/src/utils/money";
import { formatOrderDate } from "@/src/utils/order";

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  const load = useCallback(() => {
    setState("loading");
    getDashboard()
      .then((result) => {
        setData(result);
        setState("ready");
      })
      .catch(() => setState("error"));
  }, []);

  // Deferred a tick rather than called straight from the effect body: `load`
  // flips state to "loading" immediately, which counts as a synchronous
  // setState in an effect (react-hooks/set-state-in-effect).
  useEffect(() => {
    queueMicrotask(load);
  }, [load]);

  if (state === "loading") return <LoadingState label="Loading dashboard…" />;
  if (state === "error" || !data) {
    return <ErrorState message="Couldn't load the dashboard." onRetry={load} />;
  }

  return (
    <div>
      <PageHeader title="Dashboard" description="Business at a glance." />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Revenue (all time)" value={formatPaise(data.revenue.totalPaise)} hint={`${data.revenue.paidOrders} paid orders`} emphasise />
        <Metric label="Revenue (30 days)" value={formatPaise(data.revenue.last30DaysPaise)} />
        <Metric label="Orders" value={String(data.orders.total)} hint={`${data.orders.delivered} delivered`} />
        <Metric label="Customers" value={String(data.users.total)} hint={`${data.users.newLast30Days} new in 30 days`} />
      </div>

      <h2 className="mt-7 mb-3 text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-text-muted">
        Order pipeline
      </h2>
      <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-5">
        <Metric label="Pending payment" value={String(data.orders.pending)} />
        <Metric label="Confirmed" value={String(data.orders.confirmed)} />
        <Metric label="Processing" value={String(data.orders.processing)} />
        <Metric label="Out for delivery" value={String(data.orders.outForDelivery)} />
        <Metric label="Cancelled / failed" value={String(data.orders.cancelled + data.orders.paymentFailed)} />
      </div>

      {data.refundsPending > 0 ? (
        <div className="mt-4 rounded-bhor-sm border border-bhor-primary bg-bhor-primary-soft px-4 py-3">
          <p className="text-bhor-small font-bhor-semibold text-bhor-primary-dark">
            {data.refundsPending} cancelled {data.refundsPending === 1 ? "order needs" : "orders need"} a refund.{" "}
            <Link href="/admin/orders?status=cancelled" className="underline">Review them</Link>
          </p>
        </div>
      ) : null}

      <h2 className="mt-7 mb-3 text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-text-muted">
        Catalogue
      </h2>
      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="Products" value={String(data.products.total)} />
        <Metric label="Available" value={String(data.products.byAvailability.available ?? 0)} />
        <Metric label="Unavailable" value={String(data.products.byAvailability.unavailable ?? 0)} />
      </div>

      <div className="mt-7 grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card>
          <div className="flex items-center justify-between border-b border-bhor-border px-4 py-3">
            <h2 className="text-bhor-small font-bhor-bold text-bhor-text">Recent orders</h2>
            <Link href="/admin/orders" className="text-bhor-caption font-bhor-bold uppercase text-bhor-primary">
              View all
            </Link>
          </div>
          {data.recentOrders.length === 0 ? (
            <EmptyState title="No orders yet" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-bhor-small">
                <tbody>
                  {data.recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-bhor-border last:border-0">
                      <td className="px-4 py-3">
                        <Link href={`/admin/orders/${order.id}`} className="font-bhor-semibold text-bhor-text hover:text-bhor-primary">
                          {order.orderNumber}
                        </Link>
                        <p className="text-bhor-caption text-bhor-text-muted">{formatOrderDate(order.createdAt)}</p>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                      <td className="px-4 py-3 text-right font-bhor-semibold text-bhor-text whitespace-nowrap">
                        {formatPaise(order.pricing.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between border-b border-bhor-border px-4 py-3">
            <h2 className="text-bhor-small font-bhor-bold text-bhor-text">Recent customers</h2>
            <Link href="/admin/users" className="text-bhor-caption font-bhor-bold uppercase text-bhor-primary">
              View all
            </Link>
          </div>
          {data.recentUsers.length === 0 ? (
            <EmptyState title="No customers yet" />
          ) : (
            <ul>
              {data.recentUsers.map((user) => (
                <li key={user.id} className="border-b border-bhor-border px-4 py-3 last:border-0">
                  <Link href={`/admin/users/${user.id}`} className="text-bhor-small font-bhor-semibold text-bhor-text hover:text-bhor-primary">
                    {user.name}
                  </Link>
                  <p className="truncate text-bhor-caption text-bhor-text-muted">{user.email}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function Metric({ label, value, hint, emphasise }: { label: string; value: string; hint?: string; emphasise?: boolean }) {
  return (
    <div className="rounded-bhor-md border border-bhor-border bg-bhor-surface px-4 py-3">
      <p className="text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-text-muted">{label}</p>
      <p className={`mt-1 text-bhor-h4 font-bhor-bold ${emphasise ? "text-bhor-primary" : "text-bhor-text"}`}>{value}</p>
      {hint ? <p className="mt-0.5 text-bhor-caption text-bhor-text-muted">{hint}</p> : null}
    </div>
  );
}
