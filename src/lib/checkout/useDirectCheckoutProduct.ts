"use client";

import { useEffect, useState } from "react";
import type { CollectionProduct } from "@/src/data/products";
import { getProductDetail } from "@/src/lib/api/product.api";
import type { DirectCheckoutItem } from "@/src/context/ShopContext";
import {
  calculateHandlingCharge,
  calculateMemberDiscount,
  parsePrice,
} from "@/src/utils/discount";
import type { SummaryTotals } from "@/src/components/cart/OrderSummary";

type Resolved = {
  product: CollectionProduct | null;
  totals: SummaryTotals | null;
  isLoading: boolean;
  error: string;
};

/**
 * Resolves a Buy Now selection into a product for display.
 *
 * The product is re-fetched from the API rather than carried over from the
 * product page, for two reasons: the selection has to survive a refresh (when
 * no React state remains), and the price shown must be the current catalogue
 * price — the server prices the order the same way, so a stale client-side
 * snapshot could otherwise show a total that differs from the amount actually
 * charged.
 */
export function useDirectCheckoutProduct(item: DirectCheckoutItem | null): Resolved {
  const [product, setProduct] = useState<CollectionProduct | null>(null);
  const [loadedSlug, setLoadedSlug] = useState<string | null>(null);
  const [error, setError] = useState("");

  const slug = item?.slug ?? null;

  useEffect(() => {
    if (!slug) return;

    let active = true;

    getProductDetail(slug)
      .then((detail) => {
        if (!active) return;
        if (!detail) {
          setError("This product is no longer available.");
          setProduct(null);
        } else {
          setError("");
          setProduct(detail.product);
        }
        setLoadedSlug(slug);
      })
      .catch(() => {
        if (!active) return;
        setError("Couldn't load this product. Please try again.");
        setLoadedSlug(slug);
      });

    return () => {
      active = false;
    };
  }, [slug]);

  if (!item) {
    return { product: null, totals: null, isLoading: false, error: "" };
  }

  // Mirrors the server's pricing rules (see pricing.service.ts) purely so the
  // customer sees a live total before paying.
  const isLoading = loadedSlug !== item.slug;
  const resolved = isLoading ? null : product;
  const subtotal = resolved ? parsePrice(resolved.price) * item.quantity : 0;
  const discount = calculateMemberDiscount(subtotal);
  const handlingCharge = calculateHandlingCharge(subtotal);

  return {
    product: resolved,
    totals: resolved
      ? { subtotal, discount, handlingCharge, total: subtotal - discount + handlingCharge }
      : null,
    isLoading,
    error: isLoading ? "" : error,
  };
}
