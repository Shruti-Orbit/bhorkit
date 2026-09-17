"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AlertTriangle, PackageOpen, RefreshCw, Search, ShoppingBag, Sparkles, X } from "lucide-react";
import { useShop } from "@/src/context/ShopContext";
import { ApiClientError } from "@/src/lib/api/client";
import {
  getCustomizationCatalog,
  quoteCustomBox,
  type CustomBoxQuote,
  type CustomizationCatalog,
} from "@/src/lib/api/customization.api";
import {
  customBoxActions,
  customBoxSignature,
  startCustomCheckout,
  useCustomBox,
} from "@/src/lib/customization/customBoxStore";
import { formatPaise } from "@/src/utils/money";
import { CustomBoxPanel, type BoxPanelLine } from "./CustomBoxPanel";
import { CustomizeItemTile } from "./CustomizeItemTile";

type CatalogState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; catalog: CustomizationCatalog };

type QuoteState = { key: string; quote: CustomBoxQuote | null; error: string };

/** Waits for a burst of taps to settle before asking for a new total. */
const QUOTE_DELAY_MS = 250;

function removedNotice(names: string[]) {
  if (names.length === 0) return "Some items are no longer available and were removed from your box.";
  const list = names.length === 1 ? names[0] : `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
  return `${list} ${names.length === 1 ? "is" : "are"} no longer available and ${names.length === 1 ? "was" : "were"} removed from your box.`;
}

/**
 * Customize Order: one builder for any puja.
 *
 * The customer taps items into an empty box and sets how many of each. Items
 * never show a price; the box total is asked of the server as the box changes.
 * Checkout opens once the box holds the minimum number of different items,
 * and then runs through the normal checkout page.
 */
export function CustomizeOrder() {
  const router = useRouter();
  const { clearDirectCheckout, setCheckoutMode } = useShop();
  const box = useCustomBox();

  const [catalogState, setCatalogState] = useState<CatalogState>({ status: "loading" });
  const [reloadKey, setReloadKey] = useState(0);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "selected">("all");
  const [quoteState, setQuoteState] = useState<QuoteState | null>(null);
  const [notice, setNotice] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    let live = true;
    getCustomizationCatalog()
      .then((catalog) => {
        if (live) setCatalogState({ status: "ready", catalog });
      })
      .catch((error: unknown) => {
        if (!live) return;
        setCatalogState({
          status: "error",
          message: error instanceof ApiClientError ? error.message : "Couldn't load the items. Please try again.",
        });
      });
    return () => {
      live = false;
    };
  }, [reloadKey]);

  const catalog = catalogState.status === "ready" ? catalogState.catalog : null;
  const itemsById = useMemo(() => new Map((catalog?.items ?? []).map((item) => [item.id, item])), [catalog]);

  // The running total. Anything the server says can no longer be picked is
  // taken out of the box, and the customer is told what went.
  const signature = customBoxSignature(box);
  const hasLines = box.lines.length > 0;
  useEffect(() => {
    if (!hasLines) return;
    let live = true;
    const lines = box.lines;
    const timer = window.setTimeout(() => {
      quoteCustomBox(lines)
        .then((quote) => {
          if (!live) return;
          setQuoteState({ key: signature, quote, error: "" });
          if (quote.unavailableIds.length > 0) {
            const names = quote.unavailableIds
              .map((id) => itemsById.get(id)?.name)
              .filter((name): name is string => Boolean(name));
            customBoxActions.removeMany(quote.unavailableIds);
            setNotice(removedNotice(names));
          }
        })
        .catch((error: unknown) => {
          if (!live) return;
          setQuoteState({
            key: signature,
            quote: null,
            error: error instanceof ApiClientError ? error.message : "Couldn't update the box total. Please try again.",
          });
        });
    }, QUOTE_DELAY_MS);
    return () => {
      live = false;
      window.clearTimeout(timer);
    };
    // box.lines is captured through `signature`, which changes whenever it does.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasLines, signature, itemsById]);

  // The mobile sheet: Escape closes it, and the page behind does not scroll.
  useEffect(() => {
    if (!sheetOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSheetOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [sheetOpen]);

  const currentQuote = hasLines && quoteState?.key === signature ? quoteState.quote : null;
  const quoteError = hasLines && quoteState?.key === signature ? quoteState.error : "";
  const quoting = hasLines && quoteState?.key !== signature;
  // While a new total is on its way, the last one stays on screen (dimmed).
  const totalPaise = hasLines ? (currentQuote ?? quoteState?.quote)?.totalPaise ?? null : 0;

  const minItems = catalog?.minItems ?? 0;
  const maxQuantity = catalog?.maxQuantityPerItem ?? 1;
  const maxItems = catalog?.maxItems ?? 0;
  const itemCount = box.lines.length;
  const remaining = Math.max(0, minItems - itemCount);
  const boxFull = maxItems > 0 && itemCount >= maxItems;
  const quantities = new Map(box.lines.map((line) => [line.ingredientId, line.quantity]));

  const canCheckout =
    Boolean(catalog?.enabled) &&
    itemCount > 0 &&
    remaining === 0 &&
    !quoting &&
    Boolean(currentQuote?.meetsMinimum) &&
    currentQuote?.unavailableIds.length === 0;

  function proceed() {
    if (!canCheckout) return;
    // The cart and any Buy Now stay exactly as they are; this tab's checkout is
    // simply pointed at the box.
    clearDirectCheckout();
    setCheckoutMode("buy-now");
    startCustomCheckout();
    setSheetOpen(false);
    router.push("/checkout");
  }

  const panelLines: BoxPanelLine[] = box.lines.map((line) => {
    const item = itemsById.get(line.ingredientId);
    return {
      id: line.ingredientId,
      name: item?.name ?? (catalog ? "Unavailable item" : null),
      pack: item?.pack ?? "",
      quantity: line.quantity,
    };
  });

  const normalizedQuery = query.trim().toLowerCase();
  const allItems = catalog?.items ?? [];
  const visibleItems = allItems.filter(
    (item) =>
      (filter === "all" || quantities.has(item.id)) &&
      (!normalizedQuery || item.name.toLowerCase().includes(normalizedQuery)),
  );
  const pickableCount = allItems.filter((item) => item.inStock).length;
  const showBuilder = Boolean(catalog?.enabled) && allItems.length > 0;

  const panelProps = {
    lines: panelLines,
    occasion: box.occasion,
    minItems,
    maxQuantity,
    totalPaise,
    quoting,
    quoteError,
    notice,
    onDismissNotice: () => setNotice(""),
    canCheckout,
    onProceed: proceed,
    onQuantity: (id: string, quantity: number) => customBoxActions.setQuantity(id, quantity, maxQuantity),
    onOccasion: customBoxActions.setOccasion,
    onClear: customBoxActions.clear,
  };

  return (
    <main className={`flex flex-1 flex-col bg-bhor-cream ${showBuilder ? "pb-28 lg:pb-0" : ""}`}>
      <Hero minItems={catalog?.enabled ? minItems : 0} />

      <section className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-[1512px]">
          {catalogState.status === "loading" ? (
            <LoadingGrid />
          ) : catalogState.status === "error" ? (
            <StatusCard
              icon={<AlertTriangle className="h-7 w-7 text-bhor-error" aria-hidden />}
              title="We couldn't load the items"
              message={catalogState.message}
              action={
                <button
                  type="button"
                  onClick={() => {
                    setCatalogState({ status: "loading" });
                    setReloadKey((key) => key + 1);
                  }}
                  className="inline-flex min-h-11 items-center gap-2 rounded-bhor-sm bg-bhor-primary px-5 text-bhor-button font-bhor-bold uppercase text-white"
                >
                  <RefreshCw className="h-4 w-4" aria-hidden />
                  Try again
                </button>
              }
            />
          ) : !catalog?.enabled ? (
            <StatusCard
              icon={<PackageOpen className="h-7 w-7 text-bhor-gold" aria-hidden />}
              title="Custom orders are paused"
              message="We're not taking customized puja boxes right now. Our ready-made kits are available as usual."
              action={<ShopLink />}
            />
          ) : allItems.length === 0 ? (
            <StatusCard
              icon={<Sparkles className="h-7 w-7 text-bhor-gold" aria-hidden />}
              title="Coming soon"
              message="We're putting together the items you can choose from. Please check back shortly."
              action={<ShopLink />}
            />
          ) : (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
              <div className="rounded-bhor-lg border border-bhor-border bg-bhor-surface p-4 shadow-bhor-soft sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-bhor-product font-bhor-bold text-bhor-text">Choose your items</h2>
                    <p className="mt-0.5 text-bhor-caption text-bhor-text-muted">
                      {allItems.length} items · tap to add, then set how many
                    </p>
                  </div>
                  <label className="relative block sm:w-72">
                    <span className="sr-only">Search items</span>
                    <Search
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bhor-text-muted"
                      aria-hidden
                    />
                    <input
                      type="search"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search items"
                      className="min-h-11 w-full rounded-bhor-sm border border-bhor-border bg-bhor-cream pl-9 pr-9 text-bhor-small text-bhor-text outline-none transition-colors placeholder:text-bhor-text-muted/70 focus:border-bhor-primary"
                    />
                    {query ? (
                      <button
                        type="button"
                        onClick={() => setQuery("")}
                        aria-label="Clear search"
                        className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-bhor-text-muted hover:bg-bhor-border/50"
                      >
                        <X className="h-4 w-4" aria-hidden />
                      </button>
                    ) : null}
                  </label>
                </div>

                <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Show">
                  {([
                    ["all", `All items (${allItems.length})`],
                    ["selected", `In your box (${itemCount})`],
                  ] as const).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={filter === value}
                      onClick={() => setFilter(value)}
                      className={`min-h-9 rounded-full px-4 text-bhor-caption font-bhor-bold transition-colors ${
                        filter === value
                          ? "bg-bhor-primary text-white"
                          : "border border-bhor-border bg-bhor-cream text-bhor-text-muted hover:border-bhor-primary/50 hover:text-bhor-primary"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {pickableCount < minItems ? (
                  <p className="mt-4 flex items-start gap-2 rounded-bhor-sm border border-bhor-border bg-bhor-peach px-3 py-2 text-bhor-caption font-bhor-semibold text-bhor-primary-dark">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                    Only {pickableCount} items are in stock right now, and a box needs at least {minItems}. Please check
                    back soon.
                  </p>
                ) : null}

                {boxFull ? (
                  <p className="mt-4 rounded-bhor-sm bg-bhor-cream px-3 py-2 text-bhor-caption font-bhor-semibold text-bhor-text-muted">
                    Your box holds the most items it can ({maxItems}). Remove one to add another.
                  </p>
                ) : null}

                {visibleItems.length === 0 ? (
                  <div className="mt-6 flex flex-col items-center rounded-bhor-md border border-dashed border-bhor-border bg-bhor-cream px-4 py-12 text-center">
                    <Search className="h-6 w-6 text-bhor-text-muted" aria-hidden />
                    <p className="mt-3 text-bhor-small font-bhor-semibold text-bhor-text">
                      {filter === "selected" && itemCount === 0 ? "Nothing in your box yet" : "No items match"}
                    </p>
                    <p className="mt-1 text-bhor-caption text-bhor-text-muted">
                      {filter === "selected" && itemCount === 0
                        ? "Switch to All items and tap what you need."
                        : "Try a different word, or clear the search."}
                    </p>
                  </div>
                ) : (
                  <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                    {visibleItems.map((item) => (
                      <li key={item.id} className="min-w-0">
                        <CustomizeItemTile
                          item={item}
                          quantity={quantities.get(item.id) ?? 0}
                          maxQuantity={maxQuantity}
                          boxFull={boxFull}
                          onAdd={() => customBoxActions.add(item.id)}
                          onQuantity={(quantity) => customBoxActions.setQuantity(item.id, quantity, maxQuantity)}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <aside className="hidden lg:sticky lg:top-6 lg:block">
                <CustomBoxPanel headingId="custom-box-heading" {...panelProps} />
              </aside>
            </div>
          )}
        </div>
      </section>

      {showBuilder ? (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-bhor-border bg-bhor-surface/95 px-4 py-3 shadow-bhor-soft backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-text-muted">
                {itemCount} of {minItems} items
              </p>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-bhor-cream ring-1 ring-inset ring-bhor-border">
                <div
                  className={`h-full rounded-full transition-[width] duration-300 ${remaining === 0 && itemCount > 0 ? "bg-bhor-success" : "bg-bhor-primary"}`}
                  style={{ width: `${minItems > 0 ? Math.min(100, Math.round((itemCount / minItems) * 100)) : 0}%` }}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-bhor-sm bg-bhor-primary px-4 text-bhor-button-mobile font-bhor-bold uppercase text-white"
            >
              <ShoppingBag className="h-4 w-4" aria-hidden />
              View box
              {itemCount > 0 && totalPaise !== null ? <span className="font-bhor-semibold normal-case">· {formatPaise(totalPaise)}</span> : null}
            </button>
          </div>
        </div>
      ) : null}

      {sheetOpen && showBuilder ? (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-labelledby="custom-box-sheet-heading">
          <button
            type="button"
            aria-label="Close your box"
            onClick={() => setSheetOpen(false)}
            className="absolute inset-0 h-full w-full cursor-default bg-bhor-text/50"
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[90vh] overflow-y-auto rounded-t-bhor-lg bg-bhor-surface pb-[env(safe-area-inset-bottom)] shadow-bhor-soft">
            <div className="flex justify-center pt-2" aria-hidden>
              <span className="h-1.5 w-12 rounded-full bg-bhor-border" />
            </div>
            <CustomBoxPanel headingId="custom-box-sheet-heading" onClose={() => setSheetOpen(false)} {...panelProps} />
          </div>
        </div>
      ) : null}
    </main>
  );
}

function Hero({ minItems }: { minItems: number }) {
  const steps = [
    minItems > 0 ? `Pick ${minItems}+ items` : "Pick your items",
    "Choose quantities",
    "Checkout & relax",
  ];

  return (
    <section className="px-4 pt-6 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-[1512px] overflow-hidden rounded-bhor-lg bg-bhor-primary px-5 py-8 shadow-bhor-soft sm:px-10 sm:py-10">
        <div aria-hidden className="absolute inset-0 bg-bhor-primary-dark opacity-20" />
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border border-white/10" />
        <div aria-hidden className="pointer-events-none absolute -right-2 -top-10 h-44 w-44 rounded-full border border-bhor-gold-light/30" />
        <div aria-hidden className="pointer-events-none absolute -bottom-28 right-28 hidden h-60 w-60 rounded-full bg-bhor-gold-light/10 sm:block" />

        <div className="relative z-10 max-w-2xl">
          <p className="inline-flex items-center gap-2 text-bhor-small font-bhor-bold uppercase tracking-wide text-bhor-gold-light">
            <Sparkles className="h-4 w-4" aria-hidden />
            Customize Order
          </p>
          <h1 className="mt-2 font-bhor-display text-bhor-h2-mobile font-bhor-semibold leading-bhor-heading text-white md:text-bhor-h2">
            Build your own puja box
          </h1>
          <p className="mt-3 text-bhor-body-mobile leading-bhor-body text-white/85 md:text-bhor-body">
            Pick exactly the samagri your puja needs — for any puja, any occasion. We pack it fresh and deliver it to
            your door.
          </p>
          <ol className="mt-5 flex flex-wrap gap-2">
            {steps.map((step, index) => (
              <li
                key={step}
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-bhor-caption font-bhor-semibold text-white ring-1 ring-white/15"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-bhor-gold-light text-bhor-badge font-bhor-bold text-bhor-primary-dark">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function LoadingGrid() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]" aria-busy="true" aria-label="Loading items">
      <div className="rounded-bhor-lg border border-bhor-border bg-bhor-surface p-5">
        <div className="h-5 w-48 animate-pulse rounded bg-bhor-cream" />
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="h-44 animate-pulse rounded-bhor-md bg-bhor-cream" />
          ))}
        </div>
      </div>
      <div className="hidden h-96 animate-pulse rounded-bhor-lg border border-bhor-border bg-bhor-surface lg:block" />
    </div>
  );
}

function StatusCard({
  icon,
  title,
  message,
  action,
}: {
  icon: ReactNode;
  title: string;
  message: string;
  action: ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center rounded-bhor-lg border border-bhor-border bg-bhor-surface px-6 py-12 text-center shadow-bhor-soft">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-bhor-cream">{icon}</span>
      <h2 className="mt-4 font-bhor-display text-bhor-h3-mobile font-bhor-semibold text-bhor-text">{title}</h2>
      <p className="mt-2 text-bhor-small leading-bhor-body text-bhor-text-muted">{message}</p>
      <div className="mt-6">{action}</div>
    </div>
  );
}

function ShopLink() {
  return (
    <Link
      href="/puja-kits"
      className="inline-flex min-h-11 items-center justify-center rounded-bhor-sm bg-bhor-primary px-5 text-bhor-button font-bhor-bold uppercase text-white"
    >
      Browse puja kits
    </Link>
  );
}
