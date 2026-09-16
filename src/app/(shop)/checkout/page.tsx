"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Loader2, Lock, ShieldCheck } from "lucide-react";
import { OrderSummary, type SummaryItem } from "@/src/components/cart/OrderSummary";
import { CheckoutAuth } from "@/src/components/checkout/CheckoutAuth";
import { DeliveryAddressSection } from "@/src/components/checkout/DeliveryAddressSection";
import { DeliveryScheduleSection } from "@/src/components/checkout/DeliveryScheduleSection";
import { FirstOrderGiftSection } from "@/src/components/checkout/FirstOrderGiftSection";
import { CouponField } from "@/src/components/checkout/CouponField";
import { PaymentMethodSection } from "@/src/components/checkout/PaymentMethodSection";
import type { AppliedCoupon } from "@/src/lib/api/coupon.api";
import { getPaymentOptions, type PaymentMode, type PaymentOptions } from "@/src/lib/api/order.api";
import { getCheckoutGiftState, type CheckoutGiftState } from "@/src/lib/api/gift.api";
import { useShop } from "@/src/context/ShopContext";
import { useCheckout } from "@/src/lib/checkout/useCheckout";
import { useOrderingStatus } from "@/src/lib/ordering/useOrderingStatus";
import { useDirectCheckoutProduct } from "@/src/lib/checkout/useDirectCheckoutProduct";
import { calculateCouponDiscount, calculateHandlingCharge, formatCurrency, parsePrice } from "@/src/utils/discount";
import { isPreOrderProduct } from "@/src/utils/productState";

export default function CheckoutPage() {
  const {
    addresses,
    cartItems,
    cartSubtotal,
    cartTotal,
    checkoutMode,
    clearDirectCheckout,
    directCheckoutItem,
    isLoggedIn,
    refreshCart,
    refreshOrders,
    selectedAddressId,
  } = useShop();

  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [giftState, setGiftState] = useState<CheckoutGiftState | null>(null);
  const [selectedGiftId, setSelectedGiftId] = useState("");
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliverySlotId, setDeliverySlotId] = useState("");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("online");
  const [paymentOptions, setPaymentOptions] = useState<PaymentOptions | null>(null);
  const [paymentOptionsLoading, setPaymentOptionsLoading] = useState(false);

  // A Buy Now selection takes precedence over the cart for this page only —
  // the cart itself is left untouched and is still there afterwards.
  const direct = useDirectCheckoutProduct(directCheckoutItem);
  const isDirect = Boolean(directCheckoutItem);

  // Pre-order carts deliver in the Ganesh Chaturthi window; everything else
  // uses the standard next-14-days window. The server enforces the same rule.
  const deliveryMode = checkoutMode === "buy-now" ? "standard" : "scheduled";

  const { phase, error, notice, isBusy, startCheckout } = useCheckout({
    onOrderConfirmed: () => {
      // The selection is spent — without this a refresh would re-offer the
      // same Buy Now instead of the (unchanged) cart.
      clearDirectCheckout();
      void refreshOrders();
      // A pay-on-delivery order empties the cart on the server as it is placed.
      void refreshCart();
    },
    onCartChanged: () => {
      void refreshCart();
    },
  });

  // Asked of the server, never inferred here: whether this is a first order
  // depends on payment history the browser does not have.
  useEffect(() => {
    let isActive = true;

    if (!isLoggedIn) {
      // Deferred a tick so this isn't a synchronous setState in the effect
      // body (react-hooks/set-state-in-effect).
      queueMicrotask(() => {
        if (isActive) setGiftState(null);
      });
      return () => {
        isActive = false;
      };
    }

    getCheckoutGiftState()
      .then((state) => {
        if (isActive) setGiftState(state);
      })
      .catch(() => {
        // A gift is a bonus, not a blocker — a failure here must not stop
        // someone checking out.
        if (isActive) setGiftState(null);
      });

    return () => {
      isActive = false;
    };
  }, [isLoggedIn]);

  // Asked of the server whenever what is being bought changes: whether every
  // item allows pay on delivery, and what it would cost, are decided there.
  const cartSignature = cartItems.map((line) => `${line.product.id}:${line.quantity}`).join(",");
  const directProductId = directCheckoutItem?.productId;
  const directQuantity = directCheckoutItem?.quantity;
  const couponCode = coupon?.code;
  useEffect(() => {
    let isActive = true;

    if (!isLoggedIn) {
      queueMicrotask(() => {
        if (!isActive) return;
        setPaymentOptions(null);
        setPaymentOptionsLoading(false);
      });
      return () => {
        isActive = false;
      };
    }

    queueMicrotask(() => {
      if (isActive) setPaymentOptionsLoading(true);
    });
    getPaymentOptions({
      ...(directProductId ? { productId: directProductId, quantity: directQuantity ?? 1 } : {}),
      ...(couponCode ? { couponCode } : {}),
    })
      .then((result) => {
        if (isActive) setPaymentOptions(result);
      })
      .catch(() => {
        // Online payment still works; pay on delivery is simply not offered.
        if (isActive) setPaymentOptions(null);
      })
      .finally(() => {
        if (isActive) setPaymentOptionsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [isLoggedIn, cartSignature, directProductId, directQuantity, couponCode]);

  // Pay on delivery can stop being available while it is selected — a coupon or
  // a quantity change can take the order over the limit — so the choice falls
  // back to online rather than offering an order the server would refuse.
  const effectivePaymentMode: PaymentMode =
    paymentMode === "pay_on_delivery" && paymentOptions?.payOnDelivery.available ? "pay_on_delivery" : "online";

  const selectGift = useCallback((giftId: string) => setSelectedGiftId(giftId), []);

  /**
   * What the customer is actually buying, for the summary.
   *
   * Built from whichever source this checkout is using — the cart, or the one
   * product of a Buy Now — so the list beside the totals is always the same
   * set of items those totals were calculated from.
   *
   * Display only. The server re-prices every line from the catalogue when the
   * order is created, so nothing here can influence what is charged.
   */
  const summaryItems: SummaryItem[] = isDirect
    ? direct.product
      ? [{
          id: direct.product.id,
          name: direct.product.name,
          image: direct.product.image,
          imageAlt: direct.product.imageAlt,
          quantity: directCheckoutItem?.quantity ?? 1,
          unitPrice: parsePrice(direct.product.price),
          lineTotal: parsePrice(direct.product.price) * (directCheckoutItem?.quantity ?? 1),
          ...(isPreOrderProduct(direct.product) ? { badge: "Pre-order" } : {}),
        }]
      : []
    : cartItems.map((line) => ({
        id: line.product.id,
        name: line.product.name,
        image: line.product.image,
        imageAlt: line.product.imageAlt,
        quantity: line.quantity,
        unitPrice: parsePrice(line.product.price),
        lineTotal: parsePrice(line.product.price) * line.quantity,
        ...(isPreOrderProduct(line.product) ? { badge: "Pre-order" } : {}),
      }));

  const isPreOrder = deliveryMode === "scheduled";
  // A preview only. The order is priced again server-side from catalogue
  // prices, so this figure decides what the customer sees and nothing else.
  const summaryCoupon = coupon
    ? {
        code: coupon.code,
        discountPercent: coupon.discountPercent,
        discount: calculateCouponDiscount(
          isDirect ? direct.totals?.subtotal ?? 0 : cartSubtotal,
          coupon.discountPercent,
        ),
      }
    : null;
  const hasItems = isDirect ? Boolean(direct.product) : cartItems.length > 0;
  // The button says what the summary says. Both are previews — the amount
  // Razorpay is asked for comes from the server's own pricing.
  // Pay on delivery: no online discount, plus the fee the server reported. Still
  // a preview — the order is priced again on the server when it is placed.
  const baseSubtotal = isDirect ? direct.totals?.subtotal ?? 0 : cartSubtotal;
  const baseHandling = isDirect ? direct.totals?.handlingCharge ?? 0 : calculateHandlingCharge(cartSubtotal);
  const codFeeRupees = paymentOptions ? paymentOptions.payOnDelivery.feePaise / 100 : 0;
  const codTotals =
    effectivePaymentMode === "pay_on_delivery"
      ? {
          subtotal: baseSubtotal,
          discount: 0,
          handlingCharge: baseHandling,
          total: baseSubtotal + baseHandling + codFeeRupees,
        }
      : null;
  const payableTotal = Math.max(
    0,
    (codTotals ? codTotals.total : isDirect ? direct.totals?.total ?? 0 : cartTotal) - (summaryCoupon?.discount ?? 0),
  );

  // The selected address must still be deliverable. The server enforces this
  // again on order creation — this only keeps the button from starting a
  // payment that is certain to be refused.
  const selectedAddress = addresses.find((address) => address.id === selectedAddressId);
  const selectedUndeliverable = selectedAddress?.deliverable === false;

  // The store switch: while it is off the server refuses every order, so the
  // Pay button is held back and the reason shown instead.
  const ordering = useOrderingStatus();
  const storeClosed = ordering?.acceptingOrders === false;

  const canPay =
    isLoggedIn &&
    hasItems &&
    Boolean(selectedAddressId) &&
    !selectedUndeliverable &&
    Boolean(deliveryDate) &&
    Boolean(deliverySlotId) &&
    (!isPreOrder || policyAccepted) &&
    !storeClosed &&
    !isBusy;

  function pay() {
    if (!canPay) return;
    void startCheckout({
      addressId: selectedAddressId,
      deliveryMode,
      ...(giftState?.eligible && selectedGiftId ? { giftId: selectedGiftId } : {}),
      ...(coupon ? { couponCode: coupon.code } : {}),
      paymentMode: effectivePaymentMode,
      deliveryDate,
      deliverySlotId,
      // Sends only the id and quantity; the server prices it.
      ...(directCheckoutItem
        ? {
            directItem: {
              productId: directCheckoutItem.productId,
              quantity: directCheckoutItem.quantity,
            },
          }
        : {}),
    });
  }

  const showEmptyState = isDirect ? Boolean(direct.error) : cartItems.length === 0;

  return (
    <main className="flex flex-1 flex-col bg-bhor-cream px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-[1512px] gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-5">
          <div>
            <h1 className="font-bhor-display text-bhor-h2-mobile font-bhor-semibold text-bhor-text md:text-bhor-h2">
              Checkout
            </h1>
            <p className="mt-2 flex items-center gap-2 text-bhor-small text-bhor-text-muted">
              <Lock className="h-4 w-4 text-bhor-success" aria-hidden />
              Payments are processed securely by Razorpay.
            </p>
          </div>

          {isDirect && direct.isLoading ? (
            <div className="rounded-bhor-lg border border-bhor-border bg-bhor-surface p-8 text-center">
              <p className="flex items-center justify-center gap-2 text-bhor-small text-bhor-text-muted">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Loading your selection…
              </p>
            </div>
          ) : showEmptyState ? (
            <div className="rounded-bhor-lg border border-bhor-border bg-bhor-surface p-8 text-center">
              <p className="text-bhor-body font-bhor-semibold text-bhor-text">
                {direct.error || "Your cart is empty."}
              </p>
              <Link
                href={isDirect ? "/shop" : "/"}
                onClick={isDirect ? clearDirectCheckout : undefined}
                className="mt-5 inline-flex min-h-11 items-center justify-center rounded-bhor-sm bg-bhor-primary px-5 text-bhor-button font-bhor-bold uppercase text-white"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <>
              <CheckoutAuth />

              {isDirect && direct.product ? (
                <section className="rounded-bhor-lg border border-bhor-border bg-bhor-surface p-5 shadow-bhor-soft">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-bhor-product font-bhor-bold text-bhor-text">Your Item</h2>
                    <Link
                      href="/cart"
                      onClick={clearDirectCheckout}
                      className="text-bhor-caption font-bhor-bold uppercase text-bhor-primary"
                    >
                      Checkout cart instead
                    </Link>
                  </div>
                  <div className="mt-4 flex gap-4">
                    <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-bhor-md bg-bhor-peach">
                      <Image
                        src={direct.product.image}
                        alt={direct.product.imageAlt}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-bhor-small font-bhor-semibold text-bhor-text">
                        {direct.product.name}
                      </p>
                      <p className="mt-1 text-bhor-small text-bhor-text-muted">
                        Qty {directCheckoutItem?.quantity ?? 1} ×{" "}
                        {formatCurrency(parsePrice(direct.product.price))}
                      </p>
                    </div>
                  </div>
                </section>
              ) : null}

              <DeliveryAddressSection />

              {isLoggedIn ? (
                <DeliveryScheduleSection
                  mode={deliveryMode}
                  date={deliveryDate}
                  slotId={deliverySlotId}
                  {...(directCheckoutItem ? { directProductId: directCheckoutItem.productId } : {})}
                  onDateChange={setDeliveryDate}
                  onSlotChange={setDeliverySlotId}
                />
              ) : null}

              {isLoggedIn ? (
                <FirstOrderGiftSection
                  state={giftState}
                  selectedGiftId={selectedGiftId}
                  onSelect={selectGift}
                />
              ) : null}

              {isLoggedIn ? (
                <PaymentMethodSection
                  value={effectivePaymentMode}
                  onChange={setPaymentMode}
                  options={paymentOptions}
                  loading={paymentOptionsLoading}
                />
              ) : null}

            </>
          )}
        </section>

        {hasItems ? (
          <div className="space-y-4 xl:sticky xl:top-6 xl:self-start">
            <OrderSummary
              items={summaryItems}
              {...(codTotals
                ? { totals: codTotals, payOnDeliveryFee: codFeeRupees }
                : isDirect && direct.totals
                  ? { totals: direct.totals }
                  : {})}
              coupon={summaryCoupon}
              couponControl={
                isLoggedIn ? (
                  <CouponField
                    applied={coupon}
                    onApplied={setCoupon}
                    onRemoved={() => setCoupon(null)}
                  />
                ) : null
              }
            />

            {isPreOrder ? (
              <label className="flex gap-3 p-3 text-xs text-bhor-text">
                <input
                  type="checkbox"
                  checked={policyAccepted}
                  onChange={(event) => setPolicyAccepted(event.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-bhor-primary"
                />
                <span className="text-bhor-primary">
                  I understand this is a pre-order and payment is non-refundable and the order cannot be
                  cancelled after payment.
                </span>
              </label>
            ) : null}

            {storeClosed ? (
              <p
                role="status"
                className="rounded-bhor-sm border border-bhor-error bg-bhor-peach px-4 py-3 text-bhor-small font-bhor-semibold leading-bhor-body text-bhor-error"
              >
                {ordering?.message}
              </p>
            ) : null}

            {error ? (
              <p
                role="alert"
                className="rounded-bhor-sm border border-bhor-error bg-bhor-peach px-4 py-3 text-bhor-small font-bhor-semibold leading-bhor-body text-bhor-error"
              >
                {error}
              </p>
            ) : null}

            {notice ? (
              <p className="rounded-bhor-sm border border-bhor-border bg-bhor-surface px-4 py-3 text-bhor-small font-bhor-semibold leading-bhor-body text-bhor-text-muted">
                {notice}
              </p>
            ) : null}

            <button
              type="button"
              disabled={!canPay}
              onClick={pay}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-bhor-sm bg-bhor-primary px-5 text-bhor-button font-bhor-bold uppercase text-white transition-colors hover:bg-bhor-primary-dark disabled:bg-bhor-border disabled:text-bhor-text-muted"
            >
              {isBusy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
              {payButtonLabel()}
            </button>

            <p className="flex items-center justify-center gap-2 text-bhor-caption font-bhor-medium text-bhor-text-muted">
              <ShieldCheck className="h-4 w-4 text-bhor-success" aria-hidden />
              {effectivePaymentMode === "pay_on_delivery"
                ? "Pay by UPI QR or cash when your order arrives"
                : "UPI · Cards · Net Banking · Wallets"}
            </p>
          </div>
        ) : null}
      </div>
    </main>
  );

  function payButtonLabel() {
    if (storeClosed) return "Orders Closed";
    if (phase === "creating") {
      return effectivePaymentMode === "pay_on_delivery" ? "Placing your order…" : "Starting secure payment…";
    }
    if (phase === "awaiting_payment") return "Complete payment in the window";
    if (phase === "verifying") return "Confirming your payment…";
    if (phase === "resuming") return "Checking payment status…";
    if (!isLoggedIn) return "Login to Continue";
    if (addresses.length === 0 || !selectedAddressId) return "Add Address to Continue";
    if (selectedUndeliverable) return "Delivery Unavailable at This Pincode";
    if (!deliveryDate || !deliverySlotId) return "Select Delivery Date & Slot";
    if (isPreOrder && !policyAccepted) return "Accept Pre-Order Policy";
    return effectivePaymentMode === "pay_on_delivery"
      ? `Place Order · ${formatCurrency(payableTotal)}`
      : `Pay ${formatCurrency(payableTotal)}`;
  }
}
