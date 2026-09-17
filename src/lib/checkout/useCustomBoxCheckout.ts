"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { SummaryTotals } from "@/src/components/cart/OrderSummary";
import { ApiClientError } from "@/src/lib/api/client";
import {
  getCustomizationCatalog,
  quoteCustomBox,
  type CustomBoxQuote,
  type CustomizationItem,
} from "@/src/lib/api/customization.api";
import { customBoxSignature, useCustomBox } from "@/src/lib/customization/customBoxStore";
import { calculateHandlingCharge, calculateMemberDiscount } from "@/src/utils/discount";
import { paiseToRupees } from "@/src/utils/money";

type Loaded = {
  key: string;
  quote: CustomBoxQuote | null;
  items: Map<string, CustomizationItem>;
  error: string;
};

export type CustomBoxCheckoutLine = {
  ingredientId: string;
  name: string;
  pack: string;
  quantity: number;
};

/**
 * The custom box, resolved for the checkout page: its contents by name, its
 * total, and whether it can be ordered as it stands.
 *
 * The total comes from the server's quote and the other figures mirror the
 * server's pricing rules, as for a Buy Now — display only. The order is priced
 * again, line by line, when it is created.
 */
export function useCustomBoxCheckout(active: boolean) {
  const box = useCustomBox();
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [nonce, setNonce] = useState(0);

  const signature = `${customBoxSignature(box)}#${nonce}`;
  const hasLines = box.lines.length > 0;

  useEffect(() => {
    if (!active || !hasLines) return;
    let live = true;
    const lines = box.lines;

    Promise.all([quoteCustomBox(lines), getCustomizationCatalog()])
      .then(([quote, catalog]) => {
        if (!live) return;
        setLoaded({
          key: signature,
          quote,
          items: new Map(catalog.items.map((item) => [item.id, item])),
          error: "",
        });
      })
      .catch((error: unknown) => {
        if (!live) return;
        setLoaded({
          key: signature,
          quote: null,
          items: new Map(),
          error: error instanceof ApiClientError ? error.message : "Couldn't load your custom box. Please try again.",
        });
      });

    return () => {
      live = false;
    };
    // box.lines is captured through `signature`, which changes whenever it does.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, hasLines, signature]);

  /** Re-prices the box, e.g. after checkout was refused because it changed. */
  const refresh = useCallback(() => setNonce((value) => value + 1), []);

  // What checkout sends. Stable while the box is unchanged — the store hands
  // back the same object until it changes — so it can sit in effect deps.
  const selection = useMemo(() => {
    const occasion = box.occasion.trim();
    return {
      items: box.lines.map((line) => ({ ingredientId: line.ingredientId, quantity: line.quantity })),
      ...(occasion ? { occasion } : {}),
    };
  }, [box]);

  const current = loaded?.key === signature ? loaded : null;
  const isLoading = active && hasLines && !current;
  const quote = current?.quote ?? null;

  let problem = "";
  if (!hasLines) {
    problem = "Your custom box is empty.";
  } else if (current?.error) {
    problem = current.error;
  } else if (quote && !quote.enabled) {
    problem = "Custom orders aren't being accepted right now.";
  } else if (quote && quote.unavailableIds.length > 0) {
    problem = "Some items in your box are no longer available. Edit your box to continue.";
  } else if (quote && !quote.meetsMinimum) {
    problem = `Add at least ${quote.minItems} different items to your box to continue.`;
  }

  const subtotal = quote ? paiseToRupees(quote.totalPaise) : 0;
  const discount = calculateMemberDiscount(subtotal);
  const handlingCharge = calculateHandlingCharge(subtotal);
  const totals: SummaryTotals | null =
    quote && !problem ? { subtotal, discount, handlingCharge, total: subtotal - discount + handlingCharge } : null;

  const lines: CustomBoxCheckoutLine[] = box.lines.map((line) => {
    const item = current?.items.get(line.ingredientId);
    return {
      ingredientId: line.ingredientId,
      name: item?.name ?? "Unavailable item",
      pack: item?.pack ?? "",
      quantity: line.quantity,
    };
  });

  return {
    lines,
    occasion: box.occasion.trim(),
    itemCount: box.lines.length,
    totals,
    isLoading,
    /** Why the box can't be ordered right now, or "". */
    error: isLoading ? "" : problem,
    ready: Boolean(totals) && !isLoading,
    /** What checkout sends: ids, counts and the occasion — never a price. */
    selection,
    signature,
    refresh,
  };
}
