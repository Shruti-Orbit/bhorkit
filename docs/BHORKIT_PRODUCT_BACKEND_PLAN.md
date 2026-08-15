# BHORKIT Product And Backend Planning Review

Last reviewed: 2026-08-15

This document explains what is already prepared in the BHORKIT frontend and how the backend should be planned around it. The current app is a frontend-only ecommerce prototype with real customer flows mocked through React state and localStorage. The architecture is already close to a proper ecommerce domain, but several boundaries must be converted into backend APIs before production.

## 1. Product Status

BHORKIT is currently implemented as a premium devotional ecommerce frontend using:

- Next.js App Router
- TypeScript
- Tailwind CSS
- React context for customer/cart/account state
- localStorage for mock persistence
- Static product/catalog data from `src/data`
- Frontend-only checkout, order creation, wishlist, addresses, auth and tracking

The frontend supports these customer journeys:

- Homepage discovery
- Product listing sections
- Product detail page
- Cart
- Checkout
- Login/signup with mock OTP
- Member discount
- Address creation and selection
- Buy now
- Order for later
- Pre-order
- Order creation
- My Account
- My Orders
- Order details
- Track Order
- Saved Items / Wishlist
- Saved Addresses

No real backend, payment gateway, inventory service, notification service, shipping service or OTP provider is connected yet.

## 2. Important Current Frontend Files

### Design System

- `src/styles/theme.css`
  Central BHORKIT design tokens: colors, fonts, text sizes, radii, shadows and utility-facing Tailwind variables.

- `src/app/globals.css`
  Global app CSS imports and base styling.

### Catalog And Marketing Data

- `src/data/products.ts`
  Main static product source. This is the most important file for backend migration.

- `src/data/heroSlides.ts`
  Homepage hero slider data.

- `src/data/homeBanners.ts`
  Homepage banner strip data.

- `src/data/categories.ts`
  Shop by category data.

- `src/data/promotions.ts`
  Festival/pre-order promotional banner data.

- `src/data/navigation.ts`
  Header navigation source.

### Customer State

- `src/context/ShopContext.tsx`
  Current frontend source of truth for auth session, cart, checkout mode, orders, saved items and addresses.

- `src/utils/auth.ts`
  Mock user registry, validation, OTP and localStorage registration.

- `src/utils/discount.ts`
  Member discount, handling charge, currency and price parsing utilities.

### Product Detail

- `src/app/products/[slug]/page.tsx`
  Dynamic product detail route.

- `src/components/product-detail/MasterDetailedPage.tsx`
  Master reusable product detail page wrapper.

- `src/components/product-detail/ProductPurchasePanel.tsx`
  Product purchase decisions: order now, order for later, pincode check, add to cart.

### Checkout

- `src/app/checkout/page.tsx`
  Main checkout route.

- `src/components/checkout/CheckoutAuth.tsx`
  Login/signup and OTP flow inside checkout.

- `src/components/checkout/DeliveryAddressSection.tsx`
  Checkout address selection and add-address form.

- `src/components/checkout/CheckoutDeliveryMode.tsx`
  Buy now, scheduled and pre-order delivery UI.

- `src/components/cart/OrderSummary.tsx`
  Subtotal, discount, handling charge and total.

### Account

- `src/app/account/page.tsx`
- `src/app/account/orders/page.tsx`
- `src/app/account/orders/[orderId]/page.tsx`
- `src/app/account/saved-items/page.tsx`
- `src/app/account/addresses/page.tsx`
- `src/app/track-order/page.tsx`

These pages are connected to the same localStorage-backed `ShopContext` state.

## 3. Current Product Model

The central product type is `CollectionProduct` in `src/data/products.ts`.

Current fields:

```ts
type CollectionProduct = {
  id: string;
  sku: string;
  slug: string;
  category: string;
  name: string;
  subtitle: string;
  description: string;
  price: string;
  href: string;
  image: string;
  imageAlt: string;
  badge?: ProductBadge;
  images: ProductImage[];
  rating?: {
    value: number;
    reviewCount: number;
  };
  availability: "preorder" | "available" | "unavailable";
  stock: {
    readyStock: boolean;
  };
  preorder?: {
    title: string;
    description: string;
    expectedDelivery: string;
  };
  delivery: {
    location: string;
    description: string;
    availablePincodes: string[];
    twoHourEligiblePincodes: string[];
    supportsTwoHourDelivery: boolean;
  };
  highlights: {
    title: string;
    description: string;
  }[];
  contents: ProductContentItem[];
  story: ProductStory;
  howToUse: ProductHowToUse[];
  packaging: ProductPackaging;
  faqs: ProductFaq[];
  reviews: ProductReview[];
};
```

### Products Currently Prepared

Ganesh Chaturthi products:

- `BHOR Ganesh Puja Essentials Kit`
- `BHOR Ganesh Puja + Durva Kit`
- `Make Your Own Ganesha Clay Kit`
- `DIY Ganesha + Decoration Kit`

Upcoming Navratri products:

- `BHOR Daily Puja Kit`
- `BHOR Navratri Day 1 Shubh Aarambh Kit`
- `BHOR Navratri Daily Puja Kit`
- `BHOR Navratri 9-Day Subscription`

Regular puja products:

- `BHOR Daily Puja Essentials Kit`
- `BHOR Incense & Dhoop Kit`
- `BHOR Pooja Samagri Refill Kit`
- `BHOR Kalash & Decor Kit`

### Backend Note

The current product model is rich enough for product detail pages, but it mixes CMS content, commerce fields and fulfillment fields in one frontend object. For backend planning, split it into:

- Product core
- Product variants/SKUs
- Product media
- Product contents
- Product editorial content
- Inventory
- Fulfillment eligibility
- Reviews
- SEO metadata

## 4. Current Auth Model

Authentication is frontend-only.

Current behavior:

- Signup requires name, email and mobile.
- Login accepts registered email or mobile.
- OTP is mocked with `123456`.
- OTP is always presented as sent to email.
- Registered users are stored in localStorage key `bhorkit_registered_users`.
- Active session is stored in localStorage key `bhorkit_mock_auth`.
- Login fails if the user is not registered.
- Logout clears session but preserves cart, orders, saved items and addresses.

Current user shape:

```ts
type CurrentUser = {
  id: string;
  email: string;
  name: string;
  mobile?: string;
};
```

### Backend Requirements

You will need:

- User table
- Customer profile table or columns
- OTP request table
- OTP verification service
- Session/JWT mechanism
- Rate limiting for OTP
- Account existence checks
- Email and mobile uniqueness constraints
- Audit logs for login/signup attempts

Recommended auth flow:

1. Customer enters email or mobile.
2. Backend checks if account exists.
3. Login path only proceeds for existing account.
4. Signup path requires name, email and mobile.
5. OTP is generated server-side.
6. OTP is sent through email and/or SMS provider.
7. OTP verification returns session token.
8. Frontend receives user profile and auth token.

## 5. Current Cart Model

Cart is frontend-only and stored in localStorage key `bhorkit_guest_cart`.

Current cart item:

```ts
type CartItem = {
  product: CollectionProduct;
  quantity: number;
};
```

Current behavior:

- Guest cart persists locally.
- Login does not delete cart.
- Add to cart increments quantity if product exists.
- Buy now replaces cart with one product.
- Checkout is blocked if cart is empty.
- Order creation clears cart after success.

### Backend Requirements

Do not store the full product object in the production cart. Store references:

```ts
type CartLine = {
  productId: string;
  variantId?: string;
  sku: string;
  quantity: number;
  unitPriceSnapshot: number;
};
```

Backend should support:

- Guest cart ID
- Authenticated user cart
- Guest cart merge after login
- Quantity validation
- Inventory validation
- Price recalculation from source of truth
- Cart line price snapshots
- Cart expiry rules

## 6. Current Pricing Rules

Pricing is handled by `src/utils/discount.ts`.

Current business rules:

- Member discount is unlocked after login/signup.
- Discount rate is 10 percent.
- Discount applies only to the lowest-priced item in the cart.
- Handling charge is INR 2.
- Handling charge is free when subtotal is at least INR 999.
- Empty cart has zero handling charge.

Current utility constants:

```ts
memberDiscountRate = 0.1
handlingCharge = 2
freeHandlingThreshold = 999
```

### Backend Requirements

Pricing must be backend-owned in production.

Backend should calculate:

- Subtotal
- Item-level discounts
- Member discount
- Handling charge
- Delivery fee
- Taxes if applicable
- Final payable total

Frontend should send cart lines and purchase mode, but backend must return the final order quote.

Recommended quote endpoint:

```http
POST /api/checkout/quote
```

Request:

```json
{
  "cartId": "cart_123",
  "checkoutMode": "buy-now",
  "addressId": "addr_123",
  "scheduledDeliveryDate": null,
  "scheduledDeliverySlot": null
}
```

Response:

```json
{
  "subtotal": 799,
  "discounts": [
    {
      "code": "BHORKIT_MEMBER_LOWEST_ITEM_10",
      "label": "BHORKIT Member Discount (10% on lowest item)",
      "amount": 79.9
    }
  ],
  "handlingCharge": 2,
  "deliveryFee": 0,
  "tax": 0,
  "total": 721.1
}
```

## 7. Current Purchase Modes

The frontend supports three checkout modes:

```ts
type CheckoutMode = "buy-now" | "scheduled" | "pre-order";
```

### Buy Now

Meaning:

- Current product
- Earliest available delivery
- No delivery slot selector

Frontend display:

- "Earliest Available Delivery"

### Scheduled / Order For Later

Meaning:

- Current product
- Customer chooses a future date and time slot

Frontend display:

- Delivery Date
- Delivery Time
- Slots:
  - 9 AM - 12 PM
  - 12 PM - 3 PM
  - 3 PM - 6 PM
  - 6 PM - 9 PM

### Pre-Order

Meaning:

- Upcoming product reservation
- Expected dispatch/delivery information
- No normal delivery slot by default

Frontend display:

- Expected Delivery / Dispatch from product data

### Backend Requirements

Backend should model purchase intent explicitly.

Recommended enum:

```ts
enum CheckoutMode {
  BUY_NOW = "buy-now",
  SCHEDULED = "scheduled",
  PRE_ORDER = "pre-order"
}
```

Backend validation:

- `buy-now`: requires stock availability and serviceable address.
- `scheduled`: requires stock availability, serviceable address, delivery date and slot.
- `pre-order`: requires product pre-order window to be open.
- Coming soon products must not create paid orders unless notify-only.

## 8. Current Delivery And Pincode Logic

Delivery logic is currently static inside product data:

```ts
delivery: {
  location: "Patna only",
  availablePincodes: ["800001", "800002", ...],
  twoHourEligiblePincodes: ["800001", "800003", "800013"],
  supportsTwoHourDelivery: true
}
```

Product detail pincode check returns:

- `two-hour`
- `standard`
- `unavailable`

The 2-hour promise is shown only if:

- Product has ready stock
- Product supports 2-hour delivery
- Pincode is eligible

### Backend Requirements

Create a fulfillment service or table for:

- Serviceable pincodes
- Delivery zones
- Delivery methods
- Cutoff times
- Available delivery slots
- 2-hour eligibility
- Festival/pre-order dispatch windows
- Temporary service pauses

Recommended endpoint:

```http
POST /api/delivery/check
```

Request:

```json
{
  "pincode": "800001",
  "productIds": ["ganesh-puja-durva-kit"],
  "checkoutMode": "buy-now"
}
```

Response:

```json
{
  "serviceable": true,
  "deliveryType": "two-hour",
  "message": "2-hour delivery available in your area",
  "availableSlots": [],
  "expectedDelivery": "Earliest available delivery"
}
```

## 9. Current Address Model

Addresses are frontend-only and stored inside `bhorkit_customer_data` by user ID.

Current type:

```ts
type CustomerAddress = {
  id: string;
  fullName: string;
  mobile: string;
  house: string;
  area: string;
  landmark: string;
  pincode: string;
  city: string;
  state: string;
  isDefault?: boolean;
};
```

Current behavior:

- Checkout unlocks address after login.
- Customer can add address during checkout.
- Saved address also appears in My Account > Addresses.
- Customer can mark default address.
- Customer can delete address.
- Checkout can select an existing saved address.

### Backend Requirements

Address should be a customer-owned resource:

```http
GET /api/account/addresses
POST /api/account/addresses
PATCH /api/account/addresses/:id
DELETE /api/account/addresses/:id
POST /api/account/addresses/:id/default
```

Backend should validate:

- Indian mobile number
- 6-digit pincode
- Serviceability
- Required fields
- User ownership

## 10. Current Order Model

Orders are created in `ShopContext.createOrder()`.

Current type:

```ts
type CustomerOrder = {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  address: CustomerAddress | null;
  checkoutMode: CheckoutMode;
  orderDate: string;
  status: OrderStatus;
  paymentStatus: "pending" | "paid";
  expectedDelivery?: string;
  expectedDispatch?: string;
  deliveryDate?: string;
  deliverySlot?: string;
};
```

Current order ID format:

```text
BHKYYYYMMDDHHMMSSNN
```

Current behavior:

- Order is created after clicking Place Order.
- Payment is mocked as paid.
- Order appears immediately in My Orders.
- Order appears in Track Order.
- Cart is cleared after order creation.
- Orders are user-scoped in localStorage.
- Order history preserves original subtotal, discount, delivery fee and total.

### Current Order Statuses

Standard orders:

- confirmed
- processing
- packed
- out-for-delivery
- delivered
- cancelled

Pre-orders:

- pre-order-confirmed
- preparing
- scheduled-for-dispatch
- dispatched
- delivered

### Backend Requirements

Orders should never be created directly from frontend totals. Use backend quote and payment verification.

Recommended production flow:

1. Create checkout session.
2. Backend calculates quote.
3. Customer selects address and delivery mode.
4. Backend reserves inventory if applicable.
5. Backend creates payment intent/order.
6. Payment gateway confirms payment.
7. Backend creates final order.
8. Backend writes order items, price snapshots and status history.
9. Frontend redirects to order detail/success page.

Recommended endpoints:

```http
POST /api/checkout/session
POST /api/checkout/quote
POST /api/orders
GET /api/account/orders
GET /api/account/orders/:orderId
GET /api/orders/track?query=
```

## 11. Current Wishlist / Saved Items

Saved items are stored per user inside localStorage key `bhorkit_customer_data`.

Current behavior:

- Guest clicking wishlist opens auth modal.
- Logged-in customer can add/remove saved item.
- Header heart count shows saved item count.
- Saved items page lists saved products.
- Saved item state persists after refresh and logout/login.

### Backend Requirements

Wishlist should be a user-owned resource:

```http
GET /api/account/saved-items
POST /api/account/saved-items
DELETE /api/account/saved-items/:productId
```

Store only:

- userId
- productId
- variantId if needed
- createdAt

Do not store full product data inside saved item rows.

## 12. Current Product Detail Experience

The product detail route supports:

- Static product SEO metadata
- Product structured data
- Breadcrumb structured data
- Gallery
- Product information
- Pincode delivery check
- Order Now
- Order For Later
- Add to Cart
- Related products
- Recently viewed sections
- Product reviews empty state
- Mobile sticky CTA

### Backend Requirements

Product detail should eventually come from:

```http
GET /api/products/:slug
GET /api/products/:slug/recommendations
GET /api/products/:slug/reviews
POST /api/recently-viewed
```

SEO should be backend/CMS-driven:

- title
- meta description
- canonical URL
- OG image
- structured data fields

## 13. Current Pages Prepared

Public pages:

- `/`
- `/shop`
- `/shop/ganesh-chaturthi`
- `/products/[slug]`
- `/cart`
- `/checkout`
- `/pre-order`
- `/collections/festivals`
- `/track-order`
- `/support`

Customer pages:

- `/account`
- `/account/orders`
- `/account/orders/[orderId]`
- `/account/saved-items`
- `/account/addresses`

Redirect/helper pages:

- `/orders`
- `/wishlist`

## 14. Current LocalStorage Keys

Current mock persistence:

```text
bhorkit_guest_cart
bhorkit_mock_auth
bhorkit_checkout_mode
bhorkit_customer_data
bhorkit_registered_users
```

Production backend should replace these with:

- HTTP-only auth session or token
- Server cart
- Server checkout session
- Server customer profile
- Server order history
- Server wishlist
- Server address book

## 15. Recommended Backend Domain Model

### users

```text
id
name
email
mobile
email_verified_at
mobile_verified_at
created_at
updated_at
```

### customer_addresses

```text
id
user_id
full_name
mobile
house
area
landmark
pincode
city
state
is_default
created_at
updated_at
```

### products

```text
id
sku
slug
name
subtitle
description
category_id
status
availability
price
mrp
is_preorder
preorder_window_start
preorder_window_end
expected_dispatch
expected_delivery
created_at
updated_at
```

### product_media

```text
id
product_id
url
alt
sort_order
is_primary
```

### product_contents

```text
id
product_id
name
quantity
unit
description
sort_order
```

### product_editorial_sections

```text
id
product_id
section_type
title
subtitle
body
image_url
sort_order
```

### inventory

```text
id
product_id
sku
available_quantity
reserved_quantity
ready_stock
low_stock_threshold
updated_at
```

### serviceable_pincodes

```text
pincode
city
state
is_active
supports_standard_delivery
supports_two_hour_delivery
```

### delivery_slots

```text
id
pincode
date
start_time
end_time
capacity
reserved_count
is_active
```

### carts

```text
id
user_id nullable
guest_id nullable
status
created_at
updated_at
```

### cart_items

```text
id
cart_id
product_id
sku
quantity
unit_price_snapshot
created_at
updated_at
```

### checkout_sessions

```text
id
user_id
cart_id
checkout_mode
address_id
delivery_date
delivery_slot_id
quote_snapshot_json
status
created_at
expires_at
```

### orders

```text
id
order_number
user_id
checkout_mode
status
payment_status
subtotal
discount_total
handling_charge
delivery_fee
tax_total
total
address_snapshot_json
expected_delivery
expected_dispatch
delivery_date
delivery_slot
created_at
updated_at
```

### order_items

```text
id
order_id
product_id
sku
product_name_snapshot
quantity
unit_price
line_total
image_snapshot
```

### order_status_history

```text
id
order_id
status
note
created_at
created_by
```

### saved_items

```text
id
user_id
product_id
created_at
```

### otp_requests

```text
id
identifier
channel
otp_hash
purpose
expires_at
attempt_count
consumed_at
created_at
```

## 16. Recommended API Surface

### Auth

```http
POST /api/auth/check-account
POST /api/auth/signup/request-otp
POST /api/auth/login/request-otp
POST /api/auth/verify-otp
POST /api/auth/logout
GET  /api/auth/me
```

### Products

```http
GET /api/products
GET /api/products/:slug
GET /api/collections/:slug/products
GET /api/pre-orders
GET /api/categories
```

### Cart

```http
GET    /api/cart
POST   /api/cart/items
PATCH  /api/cart/items/:itemId
DELETE /api/cart/items/:itemId
POST   /api/cart/merge
```

### Checkout

```http
POST /api/checkout/session
POST /api/checkout/quote
POST /api/checkout/place-order
```

### Delivery

```http
POST /api/delivery/check
GET  /api/delivery/slots?pincode=800001&date=2026-08-18
```

### Orders

```http
GET /api/account/orders
GET /api/account/orders/:orderId
GET /api/orders/track?query=BHK20260815001
```

### Addresses

```http
GET    /api/account/addresses
POST   /api/account/addresses
PATCH  /api/account/addresses/:addressId
DELETE /api/account/addresses/:addressId
POST   /api/account/addresses/:addressId/default
```

### Saved Items

```http
GET    /api/account/saved-items
POST   /api/account/saved-items
DELETE /api/account/saved-items/:productId
```

## 17. Integration Risk And Gaps

### High Priority

- Product prices are stored as strings. Backend should store numeric paise or decimal values.
- Current data has some rupee text encoding issues in source output. Normalize all prices before backend migration.
- Payment is mocked as paid. Production must verify payment webhook before marking paid.
- Order IDs are generated client-side. Production order numbers must be generated server-side.
- Inventory is mocked. Production needs reservation and release logic.
- OTP is mocked. Production needs provider, rate limits and expiry.
- Checkout totals are client-calculated. Production totals must be server-calculated.

### Medium Priority

- Product images are static public files. Backend/CMS should eventually own media references.
- Reviews exist as a data model but no genuine review submission flow exists.
- Recently viewed is not a backend resource yet.
- Pre-order dates are text strings. Backend should use structured dates.
- Delivery slots are static frontend options. Backend should return capacity-aware slots.

### Low Priority

- Header search is UI-only unless a search backend is introduced.
- Editorial homepage sections are static and may later move to CMS.
- Festival collection pages can later be CMS-driven.

## 18. Recommended Build Phases

### Phase 1: Backend Foundation

- Set up database schema.
- Implement users and OTP auth.
- Implement product read APIs.
- Move product data from `src/data/products.ts` to DB seed data.
- Return product detail from API.

### Phase 2: Cart And Pricing

- Implement server cart.
- Implement guest cart and cart merge.
- Implement quote endpoint.
- Move member discount and handling charge to backend.
- Keep frontend UI unchanged but replace local calculations with API responses.

### Phase 3: Address And Delivery

- Implement address APIs.
- Implement pincode serviceability.
- Implement delivery mode validation.
- Implement scheduled delivery slots.
- Implement 2-hour delivery eligibility.

### Phase 4: Orders And Payment

- Implement checkout session.
- Integrate payment gateway.
- Verify payment webhook.
- Create server-side orders.
- Implement order status history.
- Replace localStorage orders with backend orders.

### Phase 5: Account Ecosystem

- Replace local saved items with backend wishlist.
- Replace local addresses with backend addresses.
- Replace local orders with backend order APIs.
- Add order tracking search by order ID/mobile with secure access rules.

### Phase 6: Admin/Ops

- Admin product management.
- Inventory management.
- Order fulfillment dashboard.
- Delivery zone management.
- Pre-order campaign management.
- Notification templates.

## 19. Frontend Migration Strategy

The cleanest migration is to keep `ShopContext` as the frontend facade and replace its internals gradually.

Recommended approach:

1. Keep component APIs mostly the same.
2. Introduce service modules:
   - `src/services/authService.ts`
   - `src/services/productService.ts`
   - `src/services/cartService.ts`
   - `src/services/checkoutService.ts`
   - `src/services/orderService.ts`
   - `src/services/addressService.ts`
   - `src/services/wishlistService.ts`
3. Let `ShopContext` call service modules instead of localStorage directly.
4. Keep localStorage fallback only for development.
5. Remove localStorage persistence once APIs are stable.

This avoids rewriting UI components when the backend arrives.

## 20. Business Rules To Preserve

These rules are already present in the frontend and should become backend rules:

- Login/signup unlocks member discount.
- Member discount applies to the lowest-priced cart item only.
- Handling charge is INR 2.
- Handling charge becomes free above INR 999 subtotal.
- Cart must not disappear after login.
- Buy now means earliest available delivery and no delivery slot.
- Order for later means scheduled delivery and requires date/slot.
- Pre-order means upcoming reservation and shows expected dispatch/delivery.
- Coming soon products should not show pre-order purchase CTA.
- 2-hour delivery must only be promised when product stock and pincode eligibility are confirmed.
- Order history must preserve original price snapshots.
- Logout must not delete orders, addresses or saved items.

## 21. Suggested Backend Stack Direction

Given the current Next.js app, the simplest production path is:

- Next.js frontend remains as-is.
- Backend can be either:
  - Next.js route handlers with a database, or
  - Separate API service.

Recommended for faster launch:

- PostgreSQL database
- Prisma or Drizzle ORM
- Auth with OTP provider
- Object storage/CDN for product media
- Razorpay or Cashfree for payments
- Transactional email/SMS provider
- Admin panel later

If using Supabase:

- Supabase Auth can handle users, but OTP customization may require care.
- Supabase Postgres fits products, orders, addresses and saved items well.
- Row Level Security can protect user-scoped data.

If using a custom Node/Next backend:

- More control over OTP, payment webhooks and order lifecycle.
- Slightly more engineering effort.

## 22. Backend Readiness Summary

The frontend is prepared enough to guide a proper backend build. The strongest parts are:

- Clear product model
- Reusable product detail architecture
- Cart and checkout mode separation
- Account pages already wired to state
- User-scoped mock data structure
- Order object shape already captures important ecommerce fields
- Pricing rules isolated in utility functions

The backend should now focus on replacing localStorage with real services while preserving the same user experience.

The most important next backend work is:

1. Normalize product catalog and pricing.
2. Implement real auth and user identity.
3. Implement server-owned cart and quote.
4. Implement address and delivery eligibility.
5. Implement order creation only after payment verification.
6. Implement account/order/wishlist APIs.

## 23. Immediate Engineering Notes

- Fix price encoding in product data before migration. Some source output currently appears as garbled rupee text. Store numeric prices in backend and format on frontend.
- Do not trust frontend `checkoutMode`; backend must validate allowed purchase mode per product.
- Do not trust frontend totals; backend must recalculate every quote.
- Do not trust frontend stock; backend must reserve inventory.
- Do not expose all orders by mobile number without verification. Track order can accept mobile, but production should use OTP or logged-in access for sensitive details.
- Keep order address snapshots separate from saved addresses, so old orders remain accurate if the customer edits an address later.
- Keep product price snapshots on order items, so order history never changes when product price changes.

