"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  Card, EmptyState, ErrorState, Field, LoadingState, PageHeader, Pagination, inputClass,
} from "@/src/components/admin/ui";
import { listUsers, type AdminPageMeta, type AdminUser } from "@/src/lib/api/admin.api";
import { formatOrderDate } from "@/src/utils/order";

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<LoadingState label="Loading customers…" />}>
      <UsersContent />
    </Suspense>
  );
}

function UsersContent() {
  const initialSearch = useSearchParams().get("search") ?? "";
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [meta, setMeta] = useState<AdminPageMeta>({ total: 0, page: 1, limit: 20 });
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [search, setSearch] = useState(initialSearch);
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const load = useCallback(() => {
    setState("loading");
    listUsers({ search, role, status, page, limit: 20 })
      .then((result) => {
        setUsers(result.users);
        if (result.meta) setMeta(result.meta);
        setState("ready");
      })
      .catch(() => setState("error"));
  }, [search, role, status, page]);

  useEffect(() => {
    const timer = window.setTimeout(load, 250);
    return () => window.clearTimeout(timer);
  }, [load]);

  return (
    <div>
      <PageHeader title="Customers" description="Search accounts and review their order history." />

      <Card className="mb-4 p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Search">
            <input
              value={search}
              onChange={(event) => { setSearch(event.target.value); setPage(1); }}
              placeholder="Name or email"
              className={inputClass}
            />
          </Field>
          <Field label="Role">
            <select value={role} onChange={(event) => { setRole(event.target.value); setPage(1); }} className={inputClass}>
              <option value="">All roles</option>
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
            </select>
          </Field>
          <Field label="Status">
            <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className={inputClass}>
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
            </select>
          </Field>
        </div>
      </Card>

      <Card>
        {state === "loading" ? (
          <LoadingState label="Loading customers…" />
        ) : state === "error" ? (
          <ErrorState message="Couldn't load customers." onRetry={load} />
        ) : users.length === 0 ? (
          <EmptyState title="No customers match these filters" hint="Try a different search term." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-bhor-small">
                <thead>
                  <tr className="border-b border-bhor-border text-left">
                    <Th>Name</Th><Th>Email</Th><Th>Role</Th><Th>Joined</Th><Th>Status</Th><Th />
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-bhor-border last:border-0">
                      <td className="px-4 py-3 font-bhor-semibold text-bhor-text">{user.name}</td>
                      <td className="max-w-[240px] truncate px-4 py-3 text-bhor-text-muted">{user.email}</td>
                      <td className="px-4 py-3 text-bhor-text-muted">{user.role}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-bhor-text-muted">{formatOrderDate(user.createdAt)}</td>
                      <td className="px-4 py-3">
                        {user.disabledAt ? (
                          <span className="rounded-bhor-sm bg-bhor-peach px-2 py-1 text-bhor-badge font-bhor-bold uppercase text-bhor-error">
                            Disabled
                          </span>
                        ) : (
                          <span className="text-bhor-caption text-bhor-success">Active</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="whitespace-nowrap rounded-bhor-sm border border-bhor-primary px-3 py-1.5 text-bhor-caption font-bhor-bold uppercase text-bhor-primary"
                        >
                          View
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

function Th({ children }: { children?: React.ReactNode }) {
  return (
    <th className="px-4 py-2 text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-text-muted">{children}</th>
  );
}
