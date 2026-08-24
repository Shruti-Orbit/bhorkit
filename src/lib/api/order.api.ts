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

export type PaymentStatus = "created" | "attempted" | "paid" | "failed" | "cancelled" | "refunded";

export type DeliveryMode = "standard" | "scheduled";

export type OrderItem = {
  productId: string;
  sku: string;
  name: string;
  slug: string;
  image: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
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
  /** "direct" = bought straight from a product page, never via the cart. */
  source: "cart" | "direct";
  address: OrderAddress;
  pricing: {
    subtotal: number;
    discount: number;
    handlingCharge: number;
    total: number;
    currency: string;
  };
  delivery: { mode: DeliveryMode; date: string; slotId: string; slotLabel: string };
  payment: {
    status: PaymentStatus;
    method: string | null;
    razorpayOrderId: string;
    razorpayPaymentId: string | null;
    paidAt: string | null;
    failureReason: string | null;
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
  mode: DeliveryMode;
  minDate: string;
  maxDate: string;
  today: string;
  date: string;
  slots: { id: string; label: string }[];
  allSlots: { id: string; label: string }[];
};

export type CheckoutSession = {
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

export async function getDeliveryOptions(mode: DeliveryMode, date?: string) {
  const params = new URLSearchParams({ mode });
  if (date) params.set("date", date);
  const response = await apiGet<DeliveryOptions>(`/orders/delivery-options?${params.toString()}`);
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
};

export async function createCheckout(input: CreateCheckoutInput) {
  const response = await apiPost<CheckoutSession, CreateCheckoutInput>("/orders/checkout", input);
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
