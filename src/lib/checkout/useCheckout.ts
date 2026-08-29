"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiClientError } from "@/src/lib/api/client";
import {
  createCheckout,
  reconcileOrder,
  verifyPayment,
  type BackendOrder,
  type DeliveryMode,
} from "@/src/lib/api/order.api";
import { openRazorpayCheckout, type RazorpayFailureResponse } from "@/src/lib/razorpay";

// The id of an order whose payment is in flight. Kept in sessionStorage
// rather than React state because the whole point is to survive things that
// destroy React state: a refresh mid-payment, a back-navigation out of the
// payment sheet, a UPI app that reloads the tab on return. On the next mount
// we ask the server what actually happened to it rather than guessing.
const pendingCheckoutKey = "bhorkit_pending_checkout";

export type CheckoutPhase =
  | "idle"
  | "creating"
  | "awaiting_payment"
  | "verifying"
  | "resuming"
  | "succeeded"
  | "failed";

type StartCheckoutInput = {
  addressId: string;
  deliveryMode: DeliveryMode;
  deliveryDate: string;
  deliverySlotId: string;
  /** Set for a Buy Now; omitted for a cart checkout. */
  directItem?: { productId: string; quantity: number };
  /**
   * The first-order gift card the customer clicked. Passed straight through —
   * the server decides whether this customer may choose at all, and ignores or
   * refuses it otherwise.
   */
  giftId?: string;
};

function readPendingOrderId() {
  try {
    return window.sessionStorage.getItem(pendingCheckoutKey);
  } catch {
    return null;
  }
}

function writePendingOrderId(orderId: string | null) {
  try {
    if (orderId) {
      window.sessionStorage.setItem(pendingCheckoutKey, orderId);
    } else {
      window.sessionStorage.removeItem(pendingCheckoutKey);
    }
  } catch {
    // Private-mode storage failures shouldn't break a payment; the flow just
    // loses its ability to auto-resume.
  }
}

function messageFrom(error: unknown, fallback: string) {
  if (error instanceof ApiClientError) return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
}

export function useCheckout(options: { onOrderConfirmed?: (order: BackendOrder) => void } = {}) {
  const router = useRouter();
  const [phase, setPhase] = useState<CheckoutPhase>("idle");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Guards against a second payment being started while one is in flight —
  // a double-clicked "Pay" button, or a click landing while the sheet opens.
  const inFlight = useRef(false);
  const mounted = useRef(true);
  const onOrderConfirmed = options.onOrderConfirmed;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const settleConfirmed = useCallback(
    (order: BackendOrder) => {
      writePendingOrderId(null);
      if (!mounted.current) return;
      setPhase("succeeded");
      onOrderConfirmed?.(order);
      router.replace(`/checkout/success?orderId=${encodeURIComponent(order.id)}`);
    },
    [onOrderConfirmed, router],
  );

  // Resume path. Runs once on mount: if a payment was in flight when this page
  // last unloaded, the server — not the browser — decides how it ended.
  useEffect(() => {
    const pendingOrderId = readPendingOrderId();
    if (!pendingOrderId) return;

    let active = true;
    // Deferred a tick rather than set synchronously in the effect body
    // (react-hooks/set-state-in-effect), matching how ShopContext handles the
    // same situation. Reading sessionStorage in a useState initialiser isn't
    // an option here: the server always renders "idle", so seeding a different
    // value on the client's first render would be a hydration mismatch.
    queueMicrotask(() => {
      if (active) setPhase("resuming");
    });

    reconcileOrder(pendingOrderId, "status")
      .then((result) => {
        if (!active) return;
        if (result.order.payment.status === "paid") {
          settleConfirmed(result.order);
          return;
        }

        // Not paid, and nothing is driving it any more — clear it so the
        // customer starts clean instead of being stuck on a dead checkout.
        writePendingOrderId(null);
        setPhase("idle");
        if (result.order.status === "payment_failed" || result.order.status === "cancelled") {
          setNotice("Your previous payment didn't go through. You can try again below.");
        }
      })
      .catch(() => {
        if (!active) return;
        // Could not reach the server. Keep the pending id so a later attempt
        // can still resolve it, rather than orphaning a possibly-paid order.
        setPhase("idle");
        setNotice("We couldn't check your last payment. If money was debited, your order will appear shortly.");
      });

    return () => {
      active = false;
    };
  }, [settleConfirmed]);

  const startCheckout = useCallback(
    async (input: StartCheckoutInput) => {
      if (inFlight.current) return;
      inFlight.current = true;
      setError("");
      setNotice("");
      setPhase("creating");

      try {
        // Server-side: prices the cart, creates the Razorpay order, returns
        // the amount to charge. Nothing about the amount comes from here.
        const session = await createCheckout(input);
        writePendingOrderId(session.orderId);

        if (!mounted.current) return;
        setPhase("awaiting_payment");

        await openRazorpayCheckout({
          keyId: session.razorpayKeyId,
          amount: session.amount,
          currency: session.currency,
          razorpayOrderId: session.razorpayOrderId,
          orderNumber: session.orderNumber,
          customer: session.customer,
          contact: session.contact,

          onSuccess: (response) => {
            setPhase("verifying");
            verifyPayment({
              orderId: session.orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            })
              .then((result) => {
                inFlight.current = false;
                settleConfirmed(result.order);
              })
              .catch((verifyError) => {
                inFlight.current = false;
                if (!mounted.current) return;
                // The payment may still be genuinely captured — the webhook
                // is authoritative — so this is worded as "we're checking",
                // never as "your payment failed".
                setPhase("failed");
                setError(
                  messageFrom(
                    verifyError,
                    "We couldn't confirm your payment. If money was debited, your order will be confirmed shortly.",
                  ),
                );
              });
          },

          onFailure: (response: RazorpayFailureResponse) => {
            inFlight.current = false;
            if (!mounted.current) return;
            setPhase("failed");
            setError(
              response.error?.description ??
                "Your payment was unsuccessful. No amount has been charged — please try again.",
            );
          },

          onDismiss: () => {
            inFlight.current = false;
            if (!mounted.current) return;
            setPhase("resuming");
            // The customer closing the sheet is not proof the payment failed —
            // a UPI collect request can still be approved afterwards. Let the
            // server ask Razorpay what actually happened.
            reconcileOrder(session.orderId, "cancel")
              .then((result) => {
                if (!mounted.current) return;
                if (result.order.payment.status === "paid") {
                  settleConfirmed(result.order);
                  return;
                }
                writePendingOrderId(null);
                setPhase("idle");
                setNotice("Payment cancelled. Your cart is safe — you can try again whenever you're ready.");
              })
              .catch(() => {
                if (!mounted.current) return;
                setPhase("idle");
                setNotice("Payment cancelled.");
              });
          },
        });
      } catch (startError) {
        inFlight.current = false;
        writePendingOrderId(null);
        if (!mounted.current) return;
        setPhase("failed");
        setError(messageFrom(startError, "We couldn't start the payment. Please try again."));
      }
    },
    [settleConfirmed],
  );

  const clearMessages = useCallback(() => {
    setError("");
    setNotice("");
  }, []);

  return {
    phase,
    error,
    notice,
    isBusy: phase === "creating" || phase === "awaiting_payment" || phase === "verifying" || phase === "resuming",
    startCheckout,
    clearMessages,
  };
}
