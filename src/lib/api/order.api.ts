import { apiGet, apiPost, getApiUrl } from "@/src/lib/api/client";

// Money crosses the wire in paise, matching how the server stores it and how
// Razorpay denominates it. Convert only for display, via paiseToRupees.
export type OrderStatus =
  | "awaiting_payment"
  | "confirmed"
  | "processing"
  | "packed"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "payment_failed";

/** `due`: a pay-on-delivery order whose payment is still to be collected. */
export type PaymentStatus = "created" | "attempted" | "paid" | "failed" | "cancelled" | "refunded" | "due";

export type PaymentMode = "online" | "pay_on_delivery";

export type DeliveryMode = "standard" | "scheduled";

export type OrderItem = {
  productId: string;
  sku: string;
  name: string;
  slug: string;
  image: string;
  shopCategory?: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  /**
   * Present on a custom puja box: what is inside it. Item prices are sent only
   * to the admin panel.
   */
  customization?: {
    occasion: string | null;
    lines: {
      ingredientId: string;
      name: string;
      pack: string;
      quantity: number;
      unitPrice?: number;
      lineTotal?: number;
    }[];
  };
};

/** A custom box as checkout sends it: item ids and counts, never a price. */
export type CustomBoxRequest = {
  items: { ingredientId: string; quantity: number }[];
  occasion?: string;
};

export type OrderAddress = {
  addressId: string;
  fullName: string;
  mobile: string;
  house: string;
  area: string;
  landmark: string;
  pincode: string;
  city: string;
  state: string;
};

export type BackendOrder = {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  /** "direct" = bought straight from a product page; "custom" = a Customize Order box. Neither uses the cart. */
  source: "cart" | "direct" | "custom";
  address: OrderAddress;
  pricing: {
    subtotal: number;
    discount: number;
    couponCode?: string | null;
    couponDiscount?: number;
    handlingCharge: number;
    /** Pay-on-delivery fee, paise. 0 for online orders. */
    codFee?: number;
    total: number;
    currency: string;
  };
  delivery: { mode: DeliveryMode; date: string; slotId: string; slotLabel: string };
  payment: {
    /** Absent from responses made before pay on delivery existed, which were all online. */
    mode?: PaymentMode;
    status: PaymentStatus;
    method: string | null;
    /** Null for pay-on-delivery orders, which have no Razorpay order. */
    razorpayOrderId: string | null;
    razorpayPaymentId: string | null;
    paidAt: string | null;
    failureReason: string | null;
    /** How a pay-on-delivery order was paid, once it has been. */
    collectedVia?: "upi_qr" | "cash" | null;
  };
  status: OrderStatus;
  timeline: { status: OrderStatus; at: string; note?: string }[];
  invoiceNumber: string | null;
  /** Set when a paid order is cancelled and a refund is owed. */
  refundRequiredAt: string | null;
  refundedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DeliveryOptions = {
  /** The product ranges this window had to satisfy. */
  categories?: string[];
  mode: DeliveryMode;
  minDate: string;
  maxDate: string;
  today: string;
  date: string;
  slots: { id: string; label: string }[];
  allSlots: { id: string; label: string }[];
};

export type CheckoutSession = {
  paymentMode: "online";
  orderId: string;
  orderNumber: string;
  amount: number;
  currency: string;
  razorpayOrderId: string;
  razorpayKeyId: string;
  expiresAt: string;
  customer: { name: string; email: string };
  contact: string;
};

/** A pay-on-delivery order, placed — nothing to pay now, so no payment sheet. */
export type CodPlacement = {
  paymentMode: "pay_on_delivery";
  orderId: string;
  orderNumber: string;
  amount: number;
  currency: string;
  order: BackendOrder;
};

export type CheckoutResult = CheckoutSession | CodPlacement;

export type PaymentOptions = {
  online: { available: boolean };
  payOnDelivery: {
    available: boolean;
    /** Why it can't be used, when it can't. */
    reason: string | null;
    feePaise: number;
    maxOrderPaise: number;
    /** What this order would cost paid on delivery — no online discount, fee included. */
    totalPaise: number;
  };
};

/**
 * The bookable dates and slots for what this customer is buying.
 *
 * `productId` is sent for a Buy Now so the server looks at that product rather
 * than the cart. It is only a pointer — the server reads the product and its
 * range from the catalogue, so it cannot be used to claim a friendlier window.
 */
export async function getDeliveryOptions(mode: DeliveryMode, date?: string, productId?: string, customBox?: boolean) {
  const params = new URLSearchParams({ mode });
  if (date) params.set("date", date);
  if (productId) params.set("productId", productId);
  if (customBox) params.set("custom", "1");
  const response = await apiGet<DeliveryOptions>(`/orders/delivery-options?${params.toString()}`);
  return response.data;
}

/**
 * Which payment methods this checkout can use, and what pay on delivery costs.
 * The server resolves the cart (or the Buy Now product) and its prices itself;
 * the parameters only say which of the two it is and which coupon is applied.
 */
export async function getPaymentOptions(params: { productId?: string; quantity?: number; couponCode?: string }) {
  const search = new URLSearchParams();
  if (params.productId) search.set("productId", params.productId);
  if (params.quantity) search.set("quantity", String(params.quantity));
  if (params.couponCode) search.set("couponCode", params.couponCode);
  const qs = search.toString();
  const response = await apiGet<PaymentOptions>(`/orders/payment-options${qs ? `?${qs}` : ""}`);
  return response.data;
}

/** The same, for a custom box — which the server prices from its own item list. */
export async function getCustomBoxPaymentOptions(customBox: CustomBoxRequest, couponCode?: string) {
  const response = await apiPost<PaymentOptions, { customBox: CustomBoxRequest; couponCode?: string }>(
    "/orders/payment-options",
    { customBox, ...(couponCode ? { couponCode } : {}) },
  );
  return response.data;
}

export type CreateCheckoutInput = {
  addressId: string;
  deliveryMode: DeliveryMode;
  deliveryDate: string;
  deliverySlotId: string;
  /**
   * Buy Now straight from a product page. Only an id and a quantity are sent —
   * the server prices the product from the catalogue, so nothing here can
   * influence the amount charged. Omit it to check out the persistent cart.
   */
  directItem?: { productId: string; quantity: number };
  /** A Customize Order box. Not combined with `directItem`. */
  customBox?: CustomBoxRequest;
  /** Which first-order gift card was chosen, when one was offered. */
  giftId?: string;
  /** The applied coupon code. Never a percentage and never an amount. */
  couponCode?: string;
  /** How the customer pays. The server re-checks pay on delivery before accepting it. */
  paymentMode?: PaymentMode;
};

export async function createCheckout(input: CreateCheckoutInput) {
  const response = await apiPost<CheckoutResult, CreateCheckoutInput>("/orders/checkout", input);
  return response.data;
}

export async function verifyPayment(input: {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  const response = await apiPost<{ order: BackendOrder; alreadyConfirmed: boolean }, typeof input>(
    "/orders/verify-payment",
    input,
  );
  return response.data;
}

/**
 * Asks the server to resolve an order whose outcome the browser never saw —
 * a dismissed payment sheet, a refreshed tab, a lost connection. `intent`
 * "cancel" additionally lets the server close the order if Razorpay confirms
 * no payment went through.
 */
export async function reconcileOrder(orderId: string, intent: "cancel" | "status") {
  const response = await apiPost<{ order: BackendOrder; alreadyConfirmed: boolean }, { intent: string }>(
    `/orders/${encodeURIComponent(orderId)}/reconcile`,
    { intent },
  );
  return response.data;
}

export async function getOrders() {
  const response = await apiGet<BackendOrder[]>("/orders");
  return response.data;
}

export async function getOrder(orderId: string) {
  const response = await apiGet<BackendOrder>(`/orders/${encodeURIComponent(orderId)}`);
  return response.data;
}

export function getInvoiceUrl(orderId: string) {
  return getApiUrl(`/orders/${encodeURIComponent(orderId)}/invoice`);
}
