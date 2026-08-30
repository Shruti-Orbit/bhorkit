import { apiDelete, apiGet, apiPatch, apiPost, apiPut, getApiUrl } from "@/src/lib/api/client";
import type { BackendOrder, OrderStatus } from "@/src/lib/api/order.api";
import type { CollectionProduct } from "@/src/data/products";

// Every one of these calls hits an endpoint that re-verifies the caller's
// admin role against the database. Nothing here grants access — the UI simply
// stops rendering what the server would refuse anyway.

export type AdminPageMeta = { total: number; page: number; limit: number };

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  image: string | null;
  createdAt: string;
  lastLoginAt: string;
  disabledAt: string | null;
  disabledReason: string | null;
};

export type AdminAddress = {
  id: string;
  fullName: string;
  mobile: string;
  house: string;
  area: string;
  landmark: string;
  pincode: string;
  city: string;
  state: string;
  isDefault: boolean;
};

export type AdminDashboard = {
  users: { total: number; newLast30Days: number };
  orders: {
    total: number; pending: number; confirmed: number; processing: number; packed: number;
    shipped: number; outForDelivery: number; delivered: number; cancelled: number; paymentFailed: number;
  };
  revenue: { totalPaise: number; last30DaysPaise: number; paidOrders: number };
  products: { total: number; byAvailability: Record<string, number>; outOfStock: number };
  refundsPending: number;
  recentOrders: BackendOrder[];
  recentUsers: AdminUser[];
};

export type AdminPaymentView = {
  provider: string;
  status: string;
  method: string | null;
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  paidAmountPaise: number | null;
  paidAt: string | null;
  failureReason: string | null;
  attempts: { razorpayPaymentId: string | null; status: string; code: string; description: string; at: string }[];
};

export type AdminOrderDetail = {
  order: BackendOrder;
  payment: AdminPaymentView;
  /** Server-computed legal next statuses; the UI never invents its own list. */
  allowedTransitions: OrderStatus[];
};

/** One Shop range with its live product count. The set is fixed server-side. */
export type AdminCategory = { slug: string; label: string; products: number };

export type AdminProduct = CollectionProduct & {
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

function queryString(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

// --- dashboard ---

export async function getDashboard() {
  return (await apiGet<AdminDashboard>("/admin/dashboard")).data;
}

// --- products ---

export async function listProducts(params: {
  search?: string; shopCategory?: string; availability?: string;
  sort?: string; page?: number; limit?: number;
}) {
  const response = await apiGet<AdminProduct[], AdminPageMeta>(`/admin/products${queryString(params)}`);
  return { products: response.data, meta: response.meta };
}

export async function getProduct(id: string) {
  return (await apiGet<AdminProduct>(`/admin/products/${encodeURIComponent(id)}`)).data;
}

export async function createProduct(body: Record<string, unknown>) {
  return (await apiPost<AdminProduct, Record<string, unknown>>("/admin/products", body)).data;
}

export async function updateProduct(id: string, body: Record<string, unknown>) {
  return (await apiPatch<AdminProduct, Record<string, unknown>>(`/admin/products/${encodeURIComponent(id)}`, body)).data;
}

export async function setProductActive(id: string, active: boolean) {
  return (await apiPatch<AdminProduct, { active: boolean }>(`/admin/products/${encodeURIComponent(id)}/active`, { active })).data;
}

export async function deleteProduct(id: string) {
  return (await apiDelete<{ id: string }>(`/admin/products/${encodeURIComponent(id)}`)).data;
}

// --- categories ---

/**
 * The Shop ranges and their product counts.
 *
 * Read-only by design. The ranges are a closed set that the storefront routes
 * on (/shop/<slug>), so there is nothing to create, rename or delete —
 * renaming one would silently break three public URLs. Moving a product
 * between ranges is an edit on the product.
 */
export async function listCategories() {
  return (await apiGet<AdminCategory[]>("/admin/categories")).data;
}

// --- delivery coverage ---

export type AdminDeliveryPincode = { pincode: string; label: string; createdAt: string };

export async function listDeliveryPincodes() {
  return (await apiGet<AdminDeliveryPincode[]>("/admin/delivery/pincodes")).data;
}

export async function addDeliveryPincode(pincode: string, label: string) {
  return (await apiPost<AdminDeliveryPincode, { pincode: string; label: string }>(
    "/admin/delivery/pincodes",
    { pincode, label },
  )).data;
}

export async function removeDeliveryPincode(pincode: string) {
  return (await apiDelete<{ pincode: string }>(
    `/admin/delivery/pincodes/${encodeURIComponent(pincode)}`,
  )).data;
}

// --- policies ---

export type AdminPolicySection = {
  slug: string;
  navLabel: string;
  title: string;
  order: number;
  /** The Markdown source an admin edits. */
  bodyMarkdown: string;
  updatedAt: string;
  updatedBy: string | null;
};

export type AdminPolicies = {
  title: string;
  preambleMarkdown: string;
  lastUpdated: string;
  sections: AdminPolicySection[];
  updatedAt: string;
  updatedBy: string | null;
};

export async function getPolicies() {
  return (await apiGet<AdminPolicies>("/admin/policies")).data;
}

/** Updates one policy. Other sections are untouched by the write. */
export async function updatePolicySection(
  slug: string,
  changes: { title?: string; bodyMarkdown?: string },
) {
  return (await apiPatch<AdminPolicies, typeof changes>(
    `/admin/policies/${encodeURIComponent(slug)}`,
    changes,
  )).data;
}

export async function updatePolicyMeta(
  changes: { title?: string; preambleMarkdown?: string; lastUpdated?: string },
) {
  return (await apiPatch<AdminPolicies, typeof changes>("/admin/policies/meta", changes)).data;
}

// --- users ---

export async function listUsers(params: { search?: string; role?: string; status?: string; page?: number; limit?: number }) {
  const response = await apiGet<AdminUser[], AdminPageMeta>(`/admin/users${queryString(params)}`);
  return { users: response.data, meta: response.meta };
}

export type AdminUserDetail = {
  user: AdminUser;
  addresses: AdminAddress[];
  orders: BackendOrder[];
  stats: { orderCount: number; paidOrderCount: number; lifetimeValuePaise: number };
};

export async function getUser(id: string) {
  return (await apiGet<AdminUserDetail>(`/admin/users/${encodeURIComponent(id)}`)).data;
}

export async function updateUser(id: string, name: string) {
  return (await apiPatch<AdminUser, { name: string }>(`/admin/users/${encodeURIComponent(id)}`, { name })).data;
}

export async function setUserDisabled(id: string, disabled: boolean, reason?: string) {
  return (await apiPatch<AdminUser, { disabled: boolean; reason?: string }>(
    `/admin/users/${encodeURIComponent(id)}/status`,
    { disabled, ...(reason ? { reason } : {}) },
  )).data;
}

// --- orders ---

export async function listOrders(params: {
  search?: string; status?: string; paymentStatus?: string; userId?: string;
  from?: string; to?: string; page?: number; limit?: number;
}) {
  const response = await apiGet<BackendOrder[], AdminPageMeta>(`/admin/orders${queryString(params)}`);
  return { orders: response.data, meta: response.meta };
}

export async function getOrder(orderId: string) {
  return (await apiGet<AdminOrderDetail>(`/admin/orders/${encodeURIComponent(orderId)}`)).data;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus, note: string) {
  return (await apiPatch<{ order: BackendOrder; changed: boolean; refundRequired?: boolean }, { status: string; note: string }>(
    `/admin/orders/${encodeURIComponent(orderId)}/status`,
    { status, note },
  )).data;
}

export async function markRefunded(orderId: string, note: string) {
  return (await apiPost<{ order: BackendOrder; changed: boolean }, { note: string }>(
    `/admin/orders/${encodeURIComponent(orderId)}/refund`,
    { note },
  )).data;
}

export function adminInvoiceUrl(orderId: string) {
  return getApiUrl(`/admin/orders/${encodeURIComponent(orderId)}/invoice`);
}

// --- delivery availability ---

/**
 * When each product range can be delivered, and the time slots that apply to
 * all of them.
 *
 * The windows are what the checkout calendar is built from — but only after
 * the server has intersected them for whatever is in the customer's order, so
 * these are the raw configuration rather than anything a customer sees.
 */
export type AdminDeliveryWindow = {
  slug: string;
  label: string;
  startDate: string;
  endDate: string;
};

export type AdminDeliverySlot = {
  id: string;
  label: string;
  startHour: number;
  endHour: number;
};

export type AdminDeliverySettings = {
  windows: AdminDeliveryWindow[];
  slots: AdminDeliverySlot[];
  updatedAt: string | null;
  updatedBy: string | null;
};

export async function getDeliverySettings() {
  return (await apiGet<{ settings: AdminDeliverySettings }>("/admin/delivery/settings")).data.settings;
}

export type DeliverySettingsInput = {
  windows?: Record<string, { startDate: string; endDate: string }>;
  slots?: { startHour: number; endHour: number }[];
};

export async function saveDeliverySettings(input: DeliverySettingsInput) {
  const response = await apiPut<{ settings: AdminDeliverySettings }, DeliverySettingsInput>(
    "/admin/delivery/settings",
    input,
  );
  return response.data.settings;
}

// --- inventory ---

/**
 * The ingredient list every kit is built from.
 *
 * A product does not name its ingredients; it points at these rows. The unit
 * belongs to the ingredient rather than to the product line, because it is a
 * property of the substance — camphor is weighed in grams wherever it appears.
 */
export type AdminIngredient = {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  updatedAt: string;
};

export async function listIngredients() {
  const response = await apiGet<{ ingredients: AdminIngredient[]; units: string[] }>("/admin/ingredients");
  return response.data;
}

export type IngredientInput = { name: string; unit: string; quantity: number };

export async function createIngredient(input: IngredientInput) {
  const response = await apiPost<{ ingredient: AdminIngredient }, IngredientInput>("/admin/ingredients", input);
  return response.data.ingredient;
}

export async function updateIngredient(id: string, input: Partial<IngredientInput>) {
  const response = await apiPatch<{ ingredient: AdminIngredient }, Partial<IngredientInput>>(
    `/admin/ingredients/${id}`,
    input,
  );
  return response.data.ingredient;
}

export async function deleteIngredient(id: string) {
  await apiDelete<{ removed: boolean }>(`/admin/ingredients/${id}`);
}
