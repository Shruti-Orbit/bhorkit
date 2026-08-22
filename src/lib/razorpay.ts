// Razorpay Checkout is a hosted script — it can't be bundled, and its own
// docs require loading it from checkout.razorpay.com so the payment sheet
// always runs the gateway's current code.

const scriptSrc = "https://checkout.razorpay.com/v1/checkout.js";

export type RazorpaySuccessResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

export type RazorpayFailureResponse = {
  error?: {
    code?: string;
    description?: string;
    metadata?: { order_id?: string; payment_id?: string };
  };
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpaySuccessResponse) => void;
  prefill: { name: string; email: string; contact: string };
  notes: Record<string, string>;
  theme: { color: string };
  modal: { ondismiss: () => void; escape: boolean; confirm_close: boolean };
};

type RazorpayInstance = {
  open: () => void;
  close: () => void;
  on: (event: string, handler: (response: RazorpayFailureResponse) => void) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

let loader: Promise<void> | null = null;

/**
 * Loads the checkout script once per page. The promise is cached so several
 * components (or a retried payment) share a single <script> tag; a failed
 * load clears the cache so the next attempt can retry rather than being stuck
 * with a permanently rejected promise.
 */
export function loadRazorpayScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay can only be loaded in the browser"));
  }
  if (window.Razorpay) {
    return Promise.resolve();
  }
  if (loader) {
    return loader;
  }

  loader = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${scriptSrc}"]`);
    const script = existing ?? document.createElement("script");

    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener(
      "error",
      () => {
        loader = null;
        script.remove();
        reject(new Error("Could not load the payment gateway. Check your connection and try again."));
      },
      { once: true },
    );

    if (!existing) {
      script.src = scriptSrc;
      script.async = true;
      document.body.appendChild(script);
    }
  });

  return loader;
}

export type OpenCheckoutInput = {
  keyId: string;
  amount: number;
  currency: string;
  razorpayOrderId: string;
  orderNumber: string;
  customer: { name: string; email: string };
  contact: string;
  onSuccess: (response: RazorpaySuccessResponse) => void;
  onFailure: (response: RazorpayFailureResponse) => void;
  onDismiss: () => void;
};

export async function openRazorpayCheckout(input: OpenCheckoutInput) {
  await loadRazorpayScript();

  if (!window.Razorpay) {
    throw new Error("Could not load the payment gateway. Please try again.");
  }

  const checkout = new window.Razorpay({
    key: input.keyId,
    amount: input.amount,
    currency: input.currency,
    name: "BHORKIT",
    description: `Order ${input.orderNumber}`,
    order_id: input.razorpayOrderId,
    handler: input.onSuccess,
    prefill: {
      name: input.customer.name,
      email: input.customer.email,
      contact: input.contact,
    },
    notes: { orderNumber: input.orderNumber },
    // --bhor-primary from src/styles/theme.css.
    theme: { color: "#A9164A" },
    modal: {
      ondismiss: input.onDismiss,
      escape: true,
      // Guards against closing the sheet by accident mid-payment.
      confirm_close: true,
    },
  });

  checkout.on("payment.failed", input.onFailure);
  checkout.open();
  return checkout;
}
