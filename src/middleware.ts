import { NextResponse, type NextRequest } from "next/server";

/**
 * Route-level gate for /admin.
 *
 * This runs on the server before Next renders anything, so an unauthorised
 * visitor receives a redirect instead of a page. No admin HTML, layout,
 * sidebar or denial screen is ever sent — which is the only way to guarantee
 * there is no flash of admin UI. A client-side guard cannot do this: by the
 * time React can check a role, the markup has already been delivered.
 *
 * It does NOT replace the backend's authorization. Every /admin API still
 * re-reads the caller's role from the database and answers 401/403 on its own.
 * This layer decides what a browser is shown; the API decides what data
 * anyone can actually have.
 */

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1").replace(/\/$/, "");
const SESSION_COOKIE = process.env.NEXT_PUBLIC_SESSION_COOKIE ?? "bhorkit_session";

function redirectHome(request: NextRequest) {
  const home = new URL("/", request.url);
  // 307 keeps the method intact and, unlike a permanent redirect, is never
  // cached — a customer who is later promoted to admin must not be bounced by
  // a stale entry in their browser's redirect cache.
  return NextResponse.redirect(home, 307);
}

export async function middleware(request: NextRequest) {
  const session = request.cookies.get(SESSION_COOKIE)?.value;

  // No session at all: redirect without touching the network. This is the
  // common case for a stray visitor or a crawler.
  if (!session) {
    return redirectHome(request);
  }

  try {
    // The role is asked of the API rather than decoded from the token here.
    // The token's own `role` claim is a snapshot taken at login and can be
    // hours or days stale; the API answers from the current database row, so a
    // demoted or disabled admin loses the panel immediately.
    const response = await fetch(`${API_BASE}/auth/me`, {
      headers: {
        cookie: `${SESSION_COOKIE}=${session}`,
        accept: "application/json",
      },
      // Must never be served from a cache: a cached "yes" would outlive the
      // permission that produced it.
      cache: "no-store",
    });

    if (!response.ok) {
      return redirectHome(request);
    }

    const payload = (await response.json()) as { data?: { role?: string } };
    if (payload.data?.role !== "admin") {
      return redirectHome(request);
    }

    return NextResponse.next();
  } catch {
    // Fail closed. If the role cannot be confirmed — API down, network error,
    // malformed response — the safe answer is to show the storefront, never
    // the panel.
    return redirectHome(request);
  }
}

export const config = {
  // Covers /admin and everything beneath it. Next's matcher is evaluated
  // before rendering, so /admin/orders/<id> typed straight into the address
  // bar is intercepted exactly like a link click.
  matcher: ["/admin", "/admin/:path*"],
};
