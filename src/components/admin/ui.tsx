"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { AlertTriangle, Inbox, Loader2 } from "lucide-react";
import type { OrderStatus } from "@/src/lib/api/order.api";

// Shared admin primitives. Deliberately plain: the brand colour is reserved
// for primary actions and states that need attention, so scanning a table is
// about reading data rather than decoding a palette.

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-bhor-display text-bhor-h3-mobile font-bhor-semibold text-bhor-text md:text-bhor-h3">
          {title}
        </h1>
        {description ? <p className="mt-1 text-bhor-small text-bhor-text-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-bhor-md border border-bhor-border bg-bhor-surface ${className}`}>{children}</div>
  );
}

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 p-10 text-bhor-small text-bhor-text-muted">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      {label}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 p-10 text-center">
      <AlertTriangle className="h-7 w-7 text-bhor-error" aria-hidden />
      <p className="text-bhor-small font-bhor-semibold text-bhor-text">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="min-h-10 rounded-bhor-sm border border-bhor-primary px-4 text-bhor-button-mobile font-bhor-bold uppercase text-bhor-primary"
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 p-10 text-center">
      <Inbox className="h-7 w-7 text-bhor-text-muted" aria-hidden />
      <p className="text-bhor-small font-bhor-semibold text-bhor-text">{title}</p>
      {hint ? <p className="text-bhor-caption text-bhor-text-muted">{hint}</p> : null}
    </div>
  );
}

const STATUS_TONES: Record<string, string> = {
  // Attention states carry the brand colour; settled ones stay quiet.
  awaiting_payment: "bg-bhor-peach text-bhor-primary-dark",
  confirmed: "bg-bhor-primary-soft text-bhor-primary",
  processing: "bg-bhor-primary-soft text-bhor-primary",
  packed: "bg-bhor-primary-soft text-bhor-primary",
  shipped: "bg-bhor-primary-soft text-bhor-primary",
  out_for_delivery: "bg-bhor-primary-soft text-bhor-primary",
  delivered: "bg-bhor-cream text-bhor-success",
  cancelled: "bg-bhor-cream text-bhor-text-muted",
  payment_failed: "bg-bhor-peach text-bhor-error",
  paid: "bg-bhor-cream text-bhor-success",
  failed: "bg-bhor-peach text-bhor-error",
  created: "bg-bhor-cream text-bhor-text-muted",
  attempted: "bg-bhor-peach text-bhor-primary-dark",
  refunded: "bg-bhor-cream text-bhor-text-muted",
};

export function formatStatus(status: string) {
  return status.split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

export function StatusBadge({ status }: { status: OrderStatus | string }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-bhor-sm px-2 py-1 text-bhor-badge font-bhor-bold uppercase tracking-wide ${
        STATUS_TONES[status] ?? "bg-bhor-cream text-bhor-text-muted"
      }`}
    >
      {formatStatus(status)}
    </span>
  );
}

export function Pagination({
  page, limit, total, onPage,
}: { page: number; limit: number; total: number; onPage: (page: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / limit));
  if (total === 0) return null;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-bhor-border px-4 py-3">
      <p className="text-bhor-caption text-bhor-text-muted">
        Showing {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          className="min-h-9 rounded-bhor-sm border border-bhor-border px-3 text-bhor-caption font-bhor-bold uppercase text-bhor-text disabled:opacity-40"
        >
          Previous
        </button>
        <span className="text-bhor-caption text-bhor-text-muted">
          Page {page} of {pages}
        </span>
        <button
          type="button"
          disabled={page >= pages}
          onClick={() => onPage(page + 1)}
          className="min-h-9 rounded-bhor-sm border border-bhor-border px-3 text-bhor-caption font-bhor-bold uppercase text-bhor-text disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}

/** Blocking confirmation for anything destructive or hard to undo. */
export function ConfirmDialog({
  open, title, message, confirmLabel = "Confirm", destructive = false, busy = false, onConfirm, onCancel, children,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  destructive?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Escape closes, and focus lands on Cancel rather than the destructive
  // action so a stray Enter can't confirm a deletion.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    cancelRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bhor-text/40 px-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-bhor-md border border-bhor-border bg-bhor-surface p-5 shadow-bhor-soft">
        <h2 className="text-bhor-product font-bhor-bold text-bhor-text">{title}</h2>
        <p className="mt-2 text-bhor-small leading-bhor-body text-bhor-text-muted">{message}</p>
        {children ? <div className="mt-4">{children}</div> : null}
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="min-h-10 rounded-bhor-sm border border-bhor-border px-4 text-bhor-button-mobile font-bhor-bold uppercase text-bhor-text disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`inline-flex min-h-10 items-center gap-2 rounded-bhor-sm px-4 text-bhor-button-mobile font-bhor-bold uppercase text-white disabled:opacity-50 ${
              destructive ? "bg-bhor-error" : "bg-bhor-primary"
            }`}
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : null}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function Toast({ message, tone = "success", onDone }: { message: string; tone?: "success" | "error"; onDone: () => void }) {
  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(onDone, 4000);
    return () => window.clearTimeout(timer);
  }, [message, onDone]);

  if (!message) return null;
  return (
    <div
      role="status"
      className={`fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-bhor-sm px-4 py-3 text-bhor-small font-bhor-semibold shadow-bhor-soft ${
        tone === "error" ? "bg-bhor-error text-white" : "bg-bhor-text text-white"
      }`}
    >
      {message}
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-text-muted">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "mt-1 min-h-10 w-full rounded-bhor-sm border border-bhor-border bg-bhor-cream px-3 text-bhor-small text-bhor-text outline-none focus:border-bhor-primary";
