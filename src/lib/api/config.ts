/**
 * Where the API lives, resolved once for the whole frontend.
 *
 * It used to be decided in two places that disagreed: the API client hardcoded
 * the production host, while the /admin middleware read NEXT_PUBLIC_API_URL and
 * fell back to localhost. In production that meant the route guard was calling a
 * machine that wasn't there while the app itself called the real API — so the
 * gate could only ever fail, and it failed invisibly. One constant, imported by
 * both, is what makes that divergence impossible rather than merely unlikely.
 *
 * NEXT_PUBLIC_ is required for the value to exist in the browser, and it means
 * the value is INLINED AT BUILD TIME, not read when the server starts. Changing
 * it needs a rebuild, not a restart, and it must be set before `next build` runs
 * — setting it only in the runtime environment has no effect.
 *
 * Because it is public, never put a secret here: anything NEXT_PUBLIC_ is
 * readable in the shipped bundle. A base URL is fine — the browser has to know
 * it to make a request at all.
 */

const configured = process.env.NEXT_PUBLIC_API_URL?.trim();

/**
 * Fails the build rather than shipping a site pointed at a developer's laptop.
 *
 * A localhost fallback in production is the worst outcome available: every
 * request fails, and nothing anywhere says why. A build that stops with this
 * message is fixed by adding one line to the environment. Development keeps its
 * zero-config default, so nothing changes locally.
 */
if (!configured && process.env.NODE_ENV === "production") {
  throw new Error(
    "NEXT_PUBLIC_API_URL is not set. Set it to the API's public base URL " +
      "(e.g. https://api.bhorkit.com/api/v1) before running `next build` — it is " +
      "baked into the bundle at build time, so setting it only at runtime will not work.",
  );
}

/**
 * The API base, without a trailing slash.
 *
 * Every caller appends a path beginning with "/", so a configured value ending
 * in "/" would produce "//products" — which some proxies and CDNs treat as a
 * different route, and others reject outright.
 */
export const apiBaseUrl = (configured || "http://localhost:5000/api/v1").replace(/\/+$/, "");
