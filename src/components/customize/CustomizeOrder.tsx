"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  ChevronRight,
  Info,
  PackageOpen,
  RefreshCw,
  Search,
  ShoppingBag,
  Sparkles,
  X,
} from "lucide-react";
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
import { CustomizeItemTile, ItemPhoto } from "./CustomizeItemTile";

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
    <main className={`flex flex-1 flex-col bg-[#FAF6F0] ${showBuilder ? "pb-28 lg:pb-0" : ""}`}>
      <Hero minItems={catalog?.enabled ? minItems : 0} />

      <section className="px-4 pb-10 pt-5 sm:px-6 lg:px-8 lg:pb-14 lg:pt-6">
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
                  className="inline-flex h-11 items-center gap-2 rounded-lg bg-bhor-primary px-5 text-bhor-button font-bhor-bold text-white transition-colors hover:bg-bhor-primary-dark"
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
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start xl:gap-6">
              <div className="min-w-0">
                {/* Toolbar: stays in reach while scrolling a long shelf. */}
                <div className="sticky top-0 z-30 -mx-4 border-b border-[#ECE3D8] bg-[#FAF6F0]/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:mx-0 lg:rounded-xl lg:border lg:bg-white lg:px-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-bhor-product font-bhor-bold text-bhor-text">Choose your items</h2>
                      <p className="text-bhor-caption text-bhor-text-muted">
                        {allItems.length} items · tap to add, then set how many
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
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
                          placeholder="Search for haldi, diya, agarbatti…"
                          className="h-10 w-full rounded-lg border border-[#E3D9CD] bg-white pl-9 pr-9 text-bhor-small text-bhor-text outline-none transition-colors placeholder:text-bhor-text-muted/60 focus:border-bhor-primary focus:ring-2 focus:ring-bhor-primary/15 [&::-webkit-search-cancel-button]:hidden"
                        />
                        {query ? (
                          <button
                            type="button"
                            onClick={() => setQuery("")}
                            aria-label="Clear search"
                            className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-bhor-text-muted hover:bg-[#F4EDE4]"
                          >
                            <X className="h-4 w-4" aria-hidden />
                          </button>
                        ) : null}
                      </label>

                      <div className="flex gap-2" role="group" aria-label="Show">
                        {([
                          ["all", `All items (${allItems.length})`],
                          ["selected", `In your box (${itemCount})`],
                        ] as const).map(([value, label]) => (
                          <button
                            key={value}
                            type="button"
                            aria-pressed={filter === value}
                            onClick={() => setFilter(value)}
                            className={`h-10 flex-1 whitespace-nowrap rounded-lg border px-3.5 text-bhor-caption font-bhor-semibold transition-colors sm:flex-none ${
                              filter === value
                                ? "border-bhor-primary bg-bhor-primary-soft/50 text-bhor-primary"
                                : "border-[#E3D9CD] bg-white text-bhor-text hover:border-bhor-primary/50"
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {pickableCount < minItems ? (
                  <p className="mt-4 flex items-start gap-2 rounded-lg border border-[#F0DDB5] bg-[#FFF8E8] px-3 py-2.5 text-bhor-caption font-bhor-semibold text-[#7A5410]">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                    Only {pickableCount} items are in stock right now, and a box needs at least {minItems}. Please check
                    back soon.
                  </p>
                ) : null}

                {boxFull ? (
                  <p className="mt-4 flex items-start gap-2 rounded-lg border border-[#E3D9CD] bg-white px-3 py-2.5 text-bhor-caption font-bhor-semibold text-bhor-text-muted">
                    <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                    Your box holds the most items it can ({maxItems}). Remove one to add another.
                  </p>
                ) : null}

                {visibleItems.length === 0 ? (
                  <div className="mt-4 flex flex-col items-center rounded-xl border border-[#ECE3D8] bg-white px-4 py-14 text-center">
                    <Search className="h-7 w-7 text-bhor-text-muted/60" aria-hidden />
                    <p className="mt-3 text-bhor-small font-bhor-bold text-bhor-text">
                      {filter === "selected" && itemCount === 0 ? "Nothing in your box yet" : "No items match"}
                    </p>
                    <p className="mt-1 text-bhor-caption text-bhor-text-muted">
                      {filter === "selected" && itemCount === 0
                        ? "Switch to All items and tap what you need."
                        : "Try a different word, or clear the search."}
                    </p>
                  </div>
                ) : (
                  <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
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

              <aside className="hidden lg:sticky lg:top-4 lg:block">
                <CustomBoxPanel headingId="custom-box-heading" {...panelProps} />
              </aside>
            </div>
          )}
        </div>
      </section>

      {showBuilder ? (
        <div className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
          {itemCount > 0 ? (
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="mx-auto flex w-full max-w-xl items-center gap-3 rounded-xl bg-bhor-primary px-3 py-2.5 text-left text-white shadow-[0_12px_28px_-10px_rgb(127_18_56/0.7)]"
            >
              <span className="flex -space-x-3" aria-hidden>
                {panelLines.slice(0, 3).map((line) => (
                  <ItemPhoto
                    key={line.id}
                    name={line.name ?? ""}
                    sizes="36px"
                    className="h-9 w-9 rounded-lg ring-2 ring-bhor-primary"
                  />
                ))}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-bhor-small font-bhor-bold">
                  {itemCount} item{itemCount === 1 ? "" : "s"}
                  {totalPaise !== null ? <span className="tabular-nums"> · {formatPaise(totalPaise)}</span> : null}
                </span>
                <span className="block text-bhor-caption text-white/80">
                  {remaining > 0 ? `Add ${remaining} more to checkout` : "Ready for checkout"}
                </span>
              </span>
              <span className="inline-flex shrink-0 items-center gap-1 text-bhor-small font-bhor-bold">
                View box
                <ChevronRight className="h-4 w-4" aria-hidden />
              </span>
            </button>
          ) : (
            <div className="mx-auto flex max-w-xl items-center gap-3 rounded-xl border border-[#ECE3D8] bg-white px-4 py-3 shadow-[0_12px_28px_-14px_rgb(36_26_28/0.4)]">
              <ShoppingBag className="h-5 w-5 shrink-0 text-bhor-primary" aria-hidden />
              <p className="flex-1 text-bhor-caption font-bhor-semibold text-bhor-text">
                Pick at least {minItems} items to build your box
              </p>
              <button
                type="button"
                onClick={() => setSheetOpen(true)}
                className="shrink-0 text-bhor-caption font-bhor-bold text-bhor-primary"
              >
                View box
              </button>
            </div>
          )}
        </div>
      ) : null}

      {sheetOpen && showBuilder ? (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-labelledby="custom-box-sheet-heading">
          <button
            type="button"
            aria-label="Close your box"
            onClick={() => setSheetOpen(false)}
            className="absolute inset-0 h-full w-full cursor-default bg-black/50"
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[90vh] overflow-y-auto rounded-t-2xl bg-white pb-[env(safe-area-inset-bottom)]">
            <div className="flex justify-center pt-2" aria-hidden>
              <span className="h-1 w-10 rounded-full bg-[#DDD2C5]" />
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
    <section className="px-4 pt-4 sm:px-6 lg:px-8 lg:pt-6">
      <div className="relative mx-auto max-w-[1512px] overflow-hidden rounded-2xl bg-[#2A1512]">
        <Image
          src="/images/customize/hero.webp"
          alt=""
          fill
          priority
          sizes="(min-width: 1512px) 1512px, 100vw"
          className="object-cover object-[70%_40%]"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-[#1E0E0B]/95 via-[#1E0E0B]/70 to-[#1E0E0B]/10" />

        <div className="relative z-10 max-w-xl px-5 py-8 sm:px-10 sm:py-12 lg:py-14">
          <p className="text-bhor-caption font-bhor-bold uppercase tracking-[0.18em] text-bhor-gold-light">Customize Order</p>
          <h1 className="mt-2 font-bhor-display text-bhor-h2-mobile font-bhor-semibold leading-bhor-heading text-white md:text-bhor-h2">
            Build your own puja box
          </h1>
          <p className="mt-3 text-bhor-body-mobile leading-bhor-body text-white/80 md:text-bhor-body">
            Pick exactly the samagri your puja needs — for any puja, any occasion. We pack it fresh and deliver it to
            your door.
          </p>
          <ol className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-bhor-caption font-bhor-semibold text-white/90">
            {steps.map((step, index) => (
              <li key={step} className="inline-flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-bhor-gold-light/70 text-bhor-badge font-bhor-bold text-bhor-gold-light">
                  {index + 1}
                </span>
                {step}
                {index < steps.length - 1 ? <ChevronRight className="h-3.5 w-3.5 text-white/40" aria-hidden /> : null}
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
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px] xl:gap-6" aria-busy="true" aria-label="Loading items">
      <div>
        <div className="h-16 animate-pulse rounded-xl bg-white" />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }, (_, index) => (
            <div key={index} className="overflow-hidden rounded-xl border border-[#ECE3D8] bg-white">
              <div className="aspect-square animate-pulse bg-[#F4EDE4]" />
              <div className="space-y-2 p-3">
                <div className="h-3.5 w-3/4 animate-pulse rounded bg-[#F4EDE4]" />
                <div className="flex justify-between pt-2">
                  <div className="h-3 w-10 animate-pulse rounded bg-[#F4EDE4]" />
                  <div className="h-8 w-[72px] animate-pulse rounded-lg bg-[#F4EDE4]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="hidden h-96 animate-pulse rounded-xl border border-[#ECE3D8] bg-white lg:block" />
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
    <div className="mx-auto flex max-w-xl flex-col items-center rounded-xl border border-[#ECE3D8] bg-white px-6 py-12 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F6EEE3]">{icon}</span>
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
      className="inline-flex h-11 items-center justify-center rounded-lg bg-bhor-primary px-5 text-bhor-button font-bhor-bold text-white transition-colors hover:bg-bhor-primary-dark"
    >
      Browse puja kits
    </Link>
  );
}
