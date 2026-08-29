import { NextResponse, type NextRequest } from "next/server";

/**
 * Route-level gate for /admin, and for the terms-acceptance requirement.
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

/**
 * Routes that require a signed-in account that has accepted the terms.
 *
 * /policies is deliberately absent: someone has to be able to read what they
 * are agreeing to before agreeing to it.
 */
const CONSENT_GATED = ["/admin", "/account", "/checkout", "/orders", "/wishlist"];

/**
 * Sends an unaccepted visitor back to the storefront, where the login modal
 * reopens itself with the acceptance checkbox.
 *
 * Not a dedicated page — consent is part of the login modal and lives nowhere
 * else. Landing them on the page they asked for instead would render a screen
 * whose every request the API refuses, which is a worse way to say the same
 * thing.
 */
function redirectToConsent(request: NextRequest) {
  const consent = new URL("/", request.url);
  consent.searchParams.set("consent", "required");
  consent.searchParams.set("returnTo", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(consent, 307);
}

function redirectHome(request: NextRequest) {
  const home = new URL("/", request.url);
  // 307 keeps the method intact and, unlike a permanent redirect, is never
  // cached — a customer who is later promoted to admin must not be bounced by
  // a stale entry in their browser's redirect cache.
  return NextResponse.redirect(home, 307);
}

export async function middleware(request: NextRequest) {
  const session = request.cookies.get(SESSION_COOKIE)?.value;

  // No session at all. /admin is fully private so a stray visitor or crawler
  // goes home without touching the network. The storefront routes stay
  // reachable for guests — the cart and checkout already handle a signed-out
  // shopper, and the API refuses anything that genuinely needs an account.
  if (!session) {
    return request.nextUrl.pathname.startsWith("/admin")
      ? redirectHome(request)
      : NextResponse.next();
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

    const payload = (await response.json()) as {
      data?: { role?: string; policiesAccepted?: boolean };
    };
    const account = payload.data;

    // Acceptance is checked before the role, so an admin who has not yet
    // agreed is asked to accept rather than being bounced home as if they had
    // lost their permissions.
    if (account?.policiesAccepted !== true && isConsentGated(request.nextUrl.pathname)) {
      return redirectToConsent(request);
    }

    if (request.nextUrl.pathname.startsWith("/admin") && account?.role !== "admin") {
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

function isConsentGated(pathname: string) {
  return CONSENT_GATED.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export const config = {
  // Covers /admin and everything beneath it. Next's matcher is evaluated
  // before rendering, so /admin/orders/<id> typed straight into the address
  // bar is intercepted exactly like a link click.
  matcher: [
    "/admin",
    "/admin/:path*",
    "/account",
    "/account/:path*",
    "/checkout",
    "/checkout/:path*",
    "/orders",
    "/orders/:path*",
    "/wishlist",
  ],
};
