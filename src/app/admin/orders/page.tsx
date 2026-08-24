"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  Card, EmptyState, ErrorState, Field, LoadingState, PageHeader, Pagination, StatusBadge, inputClass,
} from "@/src/components/admin/ui";
import { listOrders, type AdminPageMeta } from "@/src/lib/api/admin.api";
import type { BackendOrder } from "@/src/lib/api/order.api";
import { formatPaise } from "@/src/utils/money";
import { formatOrderDate } from "@/src/utils/order";

const STATUSES = [
  "awaiting_payment", "confirmed", "processing", "packed",
  "shipped", "out_for_delivery", "delivered", "cancelled", "payment_failed",
];
const PAYMENT_STATUSES = ["created", "attempted", "paid", "failed", "cancelled", "refunded"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [meta, setMeta] = useState<AdminPageMeta>({ total: 0, page: 1, limit: 20 });
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);

  const load = useCallback(() => {
    setState("loading");
    listOrders({ search, status, paymentStatus, from, to, page, limit: 20 })
      .then((result) => {
        setOrders(result.orders);
        if (result.meta) setMeta(result.meta);
        setState("ready");
      })
      .catch(() => setState("error"));
  }, [search, status, paymentStatus, from, to, page]);

  // Debounced so typing in the search box doesn't fire a request per keystroke.
  useEffect(() => {
    const timer = window.setTimeout(load, 250);
    return () => window.clearTimeout(timer);
  }, [load]);

  // Any filter change returns to page 1 — otherwise a narrowed result set can
  // leave you stranded on a page that no longer exists.
  function updateFilter(setter: (value: string) => void) {
    return (value: string) => {
      setter(value);
      setPage(1);
    };
  }

  return (
    <div>
      <PageHeader title="Orders" description="Search, filter and fulfil customer orders." />

      <Card className="mb-4 p-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <Field label="Search">
            <input
              value={search}
              onChange={(event) => updateFilter(setSearch)(event.target.value)}
              placeholder="Order no., email, name, payment id"
              className={inputClass}
            />
          </Field>
          <Field label="Status">
            <select value={status} onChange={(event) => updateFilter(setStatus)(event.target.value)} className={inputClass}>
              <option value="">All statuses</option>
              {STATUSES.map((value) => (
                <option key={value} value={value}>{value.split("_").join(" ")}</option>
              ))}
            </select>
          </Field>
          <Field label="Payment">
            <select value={paymentStatus} onChange={(event) => updateFilter(setPaymentStatus)(event.target.value)} className={inputClass}>
              <option value="">All payments</option>
              {PAYMENT_STATUSES.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </Field>
          <Field label="From">
            <input type="date" value={from} onChange={(event) => updateFilter(setFrom)(event.target.value)} className={inputClass} />
          </Field>
          <Field label="To">
            <input type="date" value={to} onChange={(event) => updateFilter(setTo)(event.target.value)} className={inputClass} />
          </Field>
        </div>
      </Card>

      <Card>
        {state === "loading" ? (
          <LoadingState label="Loading orders…" />
        ) : state === "error" ? (
          <ErrorState message="Couldn't load orders." onRetry={load} />
        ) : orders.length === 0 ? (
          <EmptyState title="No orders match these filters" hint="Try clearing the search or date range." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-bhor-small">
                <thead>
                  <tr className="border-b border-bhor-border text-left">
                    <Th>Order</Th><Th>Customer</Th><Th>Placed</Th><Th>Status</Th><Th>Payment</Th>
                    <Th className="text-right">Total</Th><Th />
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-bhor-border last:border-0">
                      <td className="px-4 py-3">
                        <p className="font-bhor-semibold text-bhor-text">{order.orderNumber}</p>
                        <p className="text-bhor-caption text-bhor-text-muted">
                          {order.items.length} item{order.items.length === 1 ? "" : "s"}
                        </p>
                      </td>
                      <td className="max-w-[200px] px-4 py-3">
                        <p className="truncate text-bhor-text">{order.address.fullName}</p>
                        <p className="truncate text-bhor-caption text-bhor-text-muted">{order.address.mobile}</p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-bhor-text-muted">{formatOrderDate(order.createdAt)}</td>
                      <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                      <td className="px-4 py-3"><StatusBadge status={order.payment.status} /></td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-bhor-semibold text-bhor-text">
                        {formatPaise(order.pricing.total)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="whitespace-nowrap rounded-bhor-sm border border-bhor-primary px-3 py-1.5 text-bhor-caption font-bhor-bold uppercase text-bhor-primary"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={meta.page} limit={meta.limit} total={meta.total} onPage={setPage} />
          </>
        )}
      </Card>
    </div>
  );
}

function Th({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return (
    <th className={`px-4 py-2 text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-text-muted ${className}`}>
      {children}
    </th>
  );
}
