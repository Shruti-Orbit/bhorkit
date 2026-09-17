"use client";

import { useSyncExternalStore } from "react";

/**
 * The box a customer is filling on the Customize Order page.
 *
 * Kept in localStorage so a refresh, a sign-in round trip or a return visit
 * does not lose a box that took a while to build. It holds item ids and counts
 * only — never a price — and the server re-checks every line whenever the box
 * is priced or ordered.
 *
 * A module-level store read through useSyncExternalStore, so every component
 * showing the box (the builder, the mobile sheet, checkout) sees the same
 * state, other tabs stay in step through the storage event, and the server
 * render always sees an empty box — no hydration mismatch.
 */

export type CustomBoxLine = { ingredientId: string; quantity: number };
export type CustomBox = { lines: CustomBoxLine[]; occasion: string };

export const MAX_OCCASION_LENGTH = 80;

const BOX_KEY = "bhorkit_custom_box";
// sessionStorage, like a Buy Now: "check out my custom box" belongs to this
// tab's journey, not to a visit days later.
const CHECKOUT_KEY = "bhorkit_custom_checkout";

const EMPTY_BOX: CustomBox = { lines: [], occasion: "" };

let cachedBox: CustomBox | null = null;
let cachedCheckout: boolean | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function readBox(): CustomBox {
  try {
    const stored = window.localStorage.getItem(BOX_KEY);
    if (!stored) return EMPTY_BOX;
    const parsed = JSON.parse(stored) as Partial<CustomBox>;
    const seen = new Set<string>();
    const lines = (Array.isArray(parsed.lines) ? parsed.lines : []).filter((line): line is CustomBoxLine => {
      const valid =
        typeof line?.ingredientId === "string" &&
        /^[a-f\d]{24}$/i.test(line.ingredientId) &&
        Number.isInteger(line.quantity) &&
        line.quantity > 0 &&
        !seen.has(line.ingredientId);
      if (valid) seen.add(line.ingredientId);
      return valid;
    });
    const occasion = typeof parsed.occasion === "string" ? parsed.occasion.slice(0, MAX_OCCASION_LENGTH) : "";
    return { lines, occasion };
  } catch {
    return EMPTY_BOX;
  }
}

function writeBox(box: CustomBox) {
  cachedBox = box;
  try {
    if (box.lines.length === 0 && !box.occasion) {
      window.localStorage.removeItem(BOX_KEY);
    } else {
      window.localStorage.setItem(BOX_KEY, JSON.stringify(box));
    }
  } catch {
    // Private-mode storage failures only cost persistence across reloads.
  }
  emit();
}

function readCheckoutFlag() {
  try {
    return window.sessionStorage.getItem(CHECKOUT_KEY) === "1";
  } catch {
    return false;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === BOX_KEY || event.key === null) {
      cachedBox = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function getBoxSnapshot() {
  if (cachedBox === null) cachedBox = readBox();
  return cachedBox;
}

function getServerBox() {
  return EMPTY_BOX;
}

function getCheckoutSnapshot() {
  if (cachedCheckout === null) cachedCheckout = readCheckoutFlag();
  return cachedCheckout;
}

function getServerCheckout() {
  return false;
}

export function useCustomBox() {
  return useSyncExternalStore(subscribe, getBoxSnapshot, getServerBox);
}

/** Whether this tab's checkout is for the custom box rather than the cart or a Buy Now. */
export function useCustomCheckoutActive() {
  return useSyncExternalStore(subscribe, getCheckoutSnapshot, getServerCheckout);
}

export function startCustomCheckout() {
  cachedCheckout = true;
  try {
    window.sessionStorage.setItem(CHECKOUT_KEY, "1");
  } catch {
    // Without storage the flag still holds for this page view.
  }
  emit();
}

export function clearCustomCheckout() {
  if (getCheckoutSnapshot() === false) return;
  cachedCheckout = false;
  try {
    window.sessionStorage.removeItem(CHECKOUT_KEY);
  } catch {
    // Nothing to undo.
  }
  emit();
}

/** Every change to the box. Counts are kept within 1..max; 0 removes the item. */
export const customBoxActions = {
  setQuantity(ingredientId: string, quantity: number, max: number) {
    const box = getBoxSnapshot();
    const next = Math.min(Math.max(0, Math.trunc(quantity)), max);
    const exists = box.lines.some((line) => line.ingredientId === ingredientId);
    const lines =
      next === 0
        ? box.lines.filter((line) => line.ingredientId !== ingredientId)
        : exists
          ? box.lines.map((line) => (line.ingredientId === ingredientId ? { ...line, quantity: next } : line))
          : [...box.lines, { ingredientId, quantity: next }];
    writeBox({ ...box, lines });
  },

  add(ingredientId: string) {
    const box = getBoxSnapshot();
    if (box.lines.some((line) => line.ingredientId === ingredientId)) return;
    writeBox({ ...box, lines: [...box.lines, { ingredientId, quantity: 1 }] });
  },

  remove(ingredientId: string) {
    const box = getBoxSnapshot();
    writeBox({ ...box, lines: box.lines.filter((line) => line.ingredientId !== ingredientId) });
  },

  removeMany(ingredientIds: string[]) {
    if (ingredientIds.length === 0) return;
    const drop = new Set(ingredientIds);
    const box = getBoxSnapshot();
    writeBox({ ...box, lines: box.lines.filter((line) => !drop.has(line.ingredientId)) });
  },

  setOccasion(occasion: string) {
    writeBox({ ...getBoxSnapshot(), occasion: occasion.slice(0, MAX_OCCASION_LENGTH) });
  },

  clear() {
    writeBox(EMPTY_BOX);
  },
};

/** A stable key for "this exact box", for re-pricing when it changes. */
export function customBoxSignature(box: CustomBox) {
  return box.lines.map((line) => `${line.ingredientId}:${line.quantity}`).join(",");
}
