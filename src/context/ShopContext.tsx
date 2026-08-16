"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { CollectionProduct } from "@/src/data/products";
import {
  calculateHandlingCharge,
  calculateMemberDiscount,
  parsePrice,
} from "@/src/utils/discount";
import { isValidGaneshPreOrderDate } from "@/src/utils/preorder";
import type { RegisteredUser } from "@/src/utils/auth";

export type AuthMode = "login" | "signup";
export type AuthStep = "email" | "otp" | "success";
export type CheckoutMode = "buy-now" | "scheduled" | "pre-order";
export type PaymentMethod = "unselected" | "online";

export type CurrentUser = {
  email: string;
  id: string;
  name: string;
  mobile?: string;
};

export type CartItem = {
  product: CollectionProduct;
  quantity: number;
};

export type CustomerAddress = {
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

export type OrderStatus =
  | "confirmed"
  | "processing"
  | "packed"
  | "out-for-delivery"
  | "delivered"
  | "cancelled"
  | "pre-order-confirmed"
  | "preparing"
  | "scheduled-for-dispatch"
  | "dispatched";

export type CustomerOrder = {
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
  paymentMethod: PaymentMethod;
  expectedDelivery?: string;
  expectedDispatch?: string;
  deliveryDate?: string;
  deliverySlot?: string;
};

type AuthModalOptions = {
  mode?: AuthMode;
  email?: string;
};

type ShopContextValue = {
  isLoggedIn: boolean;
  currentUser: CurrentUser | null;
  discountUnlocked: boolean;
  authModalOpen: boolean;
  authMode: AuthMode;
  authStep: AuthStep;
  authEmail: string;
  successMessage: string;
  cartDrawerOpen: boolean;
  cartItems: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  memberDiscount: number;
  handlingCharge: number;
  cartTotal: number;
  paymentMethod: PaymentMethod;
  checkoutMode: CheckoutMode;
  orders: CustomerOrder[];
  savedItems: CollectionProduct[];
  savedItemCount: number;
  addresses: CustomerAddress[];
  selectedAddressId: string;
  scheduledDeliveryDate: string;
  scheduledDeliverySlot: string;
  openAuthModal: (options?: AuthModalOptions) => void;
  closeAuthModal: () => void;
  setAuthMode: (mode: AuthMode) => void;
  setAuthStep: (step: AuthStep) => void;
  setAuthEmail: (email: string) => void;
  completeAuth: (email: string, mode: AuthMode, profile?: RegisteredUser) => void;
  logout: () => void;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  addToCart: (product: CollectionProduct, quantity?: number) => void;
  buyNow: (product: CollectionProduct, mode?: CheckoutMode) => void;
  setCheckoutMode: (mode: CheckoutMode) => void;
  updateCartItem: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  toggleSavedItem: (product: CollectionProduct) => void;
  isSavedItem: (productId: string) => boolean;
  addAddress: (address: Omit<CustomerAddress, "id">) => void;
  updateAddress: (address: CustomerAddress) => void;
  deleteAddress: (addressId: string) => void;
  setDefaultAddress: (addressId: string) => void;
  setSelectedAddressId: (addressId: string) => void;
  setScheduledDeliveryDate: (date: string) => void;
  setScheduledDeliverySlot: (slot: string) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  createOrder: () => CustomerOrder | null;
  getOrderById: (orderId: string) => CustomerOrder | undefined;
  findOrders: (query: string) => CustomerOrder[];
  clearSuccessMessage: () => void;
};

const ShopContext = createContext<ShopContextValue | null>(null);
const cartStorageKey = "bhorkit_guest_cart";
const authStorageKey = "bhorkit_mock_auth";
const checkoutModeStorageKey = "bhorkit_checkout_mode";
const customerDataStorageKey = "bhorkit_customer_data";

export function ShopProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => getInitialAuth());
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(getInitialAuth()));
  const [discountUnlocked, setDiscountUnlocked] = useState(() => Boolean(getInitialAuth()));
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [authStep, setAuthStep] = useState<AuthStep>("email");
  const [authEmail, setAuthEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>(() => getInitialCart());
  const [checkoutMode, setCheckoutModeState] = useState<CheckoutMode>(() => getInitialCheckoutMode());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("unselected");
  const [customerData, setCustomerData] = useState<CustomerDataStore>(() => getInitialCustomerData());
  const [selectedAddressId, setSelectedAddressIdState] = useState("");
  const [scheduledDeliveryDate, setScheduledDeliveryDate] = useState("");
  const [scheduledDeliverySlot, setScheduledDeliverySlot] = useState("");

  const userId = currentUser?.id ?? "";
  const userData = userId ? getUserData(customerData, userId) : emptyUserData;
  const orders = userData.orders;
  const savedItems = userData.savedItems;
  const addresses = userData.addresses;

  useEffect(() => {
    window.localStorage.setItem(cartStorageKey, JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    window.localStorage.setItem(checkoutModeStorageKey, checkoutMode);
  }, [checkoutMode]);

  useEffect(() => {
    window.localStorage.setItem(customerDataStorageKey, JSON.stringify(customerData));
  }, [customerData]);

  const effectiveSelectedAddressId =
    selectedAddressId || addresses.find((address) => address.isDefault)?.id || addresses[0]?.id || "";

  const openAuthModal = useCallback((options?: AuthModalOptions) => {
    setAuthMode(options?.mode ?? "login");
    setAuthEmail(options?.email ?? "");
    setAuthStep("email");
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
    setAuthStep("email");
  }, []);

  const completeAuth = useCallback((email: string, mode: AuthMode, profile?: RegisteredUser) => {
    const identifier = (profile?.email || email).trim().toLowerCase();
    const isMobile = /^[6-9]\d{9}$/.test(identifier);
    const user = {
      email: profile?.email ?? (isMobile ? "" : identifier),
      id: profile?.id ?? identifier,
      name: profile?.name ?? "BHORKIT Devotee",
      mobile: profile?.mobile ?? (isMobile ? identifier : undefined),
    };
    setIsLoggedIn(true);
    setCurrentUser(user);
    setDiscountUnlocked(true);
    setAuthStep("success");
    setSuccessMessage(
      mode === "signup"
        ? "Welcome to BHORKIT! Your account is ready."
        : "Welcome back to BHORKIT.",
    );
    window.localStorage.setItem(authStorageKey, JSON.stringify(user));
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setDiscountUnlocked(false);
    window.localStorage.removeItem(authStorageKey);
  }, []);

  const openCartDrawer = useCallback(() => {
    setCartDrawerOpen(true);
  }, []);

  const closeCartDrawer = useCallback(() => {
    setCartDrawerOpen(false);
  }, []);

  const addToCart = useCallback((product: CollectionProduct, quantity = 1) => {
    setCartItems((items) => {
      const existingItem = items.find((item) => item.product.id === product.id);
      if (existingItem) {
        return items.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }

      return [...items, { product, quantity }];
    });
    setSuccessMessage("Added to your cart");
    setCartDrawerOpen(true);
  }, []);

  const setCheckoutMode = useCallback((mode: CheckoutMode) => {
    setCheckoutModeState(mode);
  }, []);

  const buyNow = useCallback((product: CollectionProduct, mode: CheckoutMode = "buy-now") => {
    setCartItems([{ product, quantity: 1 }]);
    setCheckoutModeState(mode);
  }, []);

  const updateCartItem = useCallback((productId: string, quantity: number) => {
    setCartItems((items) =>
      items
        .map((item) => (item.product.id === productId ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCartItems((items) => items.filter((item) => item.product.id !== productId));
  }, []);

  const cartSubtotal = useMemo(
    () =>
      cartItems.reduce(
        (subtotal, item) => subtotal + parsePrice(item.product.price) * item.quantity,
        0,
      ),
    [cartItems],
  );
  const memberDiscount = paymentMethod === "online" ? calculateMemberDiscount(cartSubtotal) : 0;
  const handlingCharge = calculateHandlingCharge(cartSubtotal);
  const cartTotal = cartSubtotal - memberDiscount + handlingCharge;
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  const updateCurrentUserData = useCallback((updater: (data: UserCustomerData) => UserCustomerData) => {
    if (!userId) {
      return;
    }

    setCustomerData((data) => ({
      ...data,
      [userId]: updater(getUserData(data, userId)),
    }));
  }, [userId]);

  const toggleSavedItem = useCallback((product: CollectionProduct) => {
    if (!userId) {
      openAuthModal({ mode: "login" });
      return;
    }

    updateCurrentUserData((data) => {
      const exists = data.savedItems.some((item) => item.id === product.id);
      setSuccessMessage(exists ? "Removed from Saved Items" : "Added to Saved Items");
      return {
        ...data,
        savedItems: exists
          ? data.savedItems.filter((item) => item.id !== product.id)
          : [...data.savedItems, product],
      };
    });
  }, [openAuthModal, updateCurrentUserData, userId]);

  const isSavedItem = useCallback(
    (productId: string) => savedItems.some((product) => product.id === productId),
    [savedItems],
  );

  const addAddress = useCallback((address: Omit<CustomerAddress, "id">) => {
    updateCurrentUserData((data) => {
      const newAddress = {
        ...address,
        id: createClientId("addr"),
        isDefault: address.isDefault ?? data.addresses.length === 0,
      };
      setSelectedAddressIdState(newAddress.id);
      return {
        ...data,
        addresses: newAddress.isDefault
          ? [newAddress, ...data.addresses.map((item) => ({ ...item, isDefault: false }))]
          : [...data.addresses, newAddress],
      };
    });
    setSuccessMessage("Address saved");
  }, [updateCurrentUserData]);

  const updateAddress = useCallback((address: CustomerAddress) => {
    updateCurrentUserData((data) => ({
      ...data,
      addresses: data.addresses.map((item) =>
        item.id === address.id ? address : address.isDefault ? { ...item, isDefault: false } : item,
      ),
    }));
    setSuccessMessage("Address updated");
  }, [updateCurrentUserData]);

  const deleteAddress = useCallback((addressId: string) => {
    updateCurrentUserData((data) => ({
      ...data,
      addresses: data.addresses.filter((address) => address.id !== addressId),
    }));
    if (selectedAddressId === addressId) {
      setSelectedAddressIdState("");
    }
    setSuccessMessage("Address deleted");
  }, [selectedAddressId, updateCurrentUserData]);

  const setDefaultAddress = useCallback((addressId: string) => {
    updateCurrentUserData((data) => ({
      ...data,
      addresses: data.addresses.map((address) => ({
        ...address,
        isDefault: address.id === addressId,
      })),
    }));
    setSelectedAddressIdState(addressId);
  }, [updateCurrentUserData]);

  const createOrder = useCallback(() => {
    if (!userId || cartItems.length === 0) {
      return null;
    }

    if (
      checkoutMode === "scheduled" &&
      (!isValidGaneshPreOrderDate(scheduledDeliveryDate) || !scheduledDeliverySlot)
    ) {
      setSuccessMessage("Please select a valid pre-order date and delivery slot.");
      return null;
    }

    const address = addresses.find((item) => item.id === effectiveSelectedAddressId) ?? addresses[0] ?? null;
    const order: CustomerOrder = {
      id: generateOrderId(),
      userId,
      items: cartItems,
      subtotal: cartSubtotal,
      discount: memberDiscount,
      deliveryFee: handlingCharge,
      total: cartTotal,
      address,
      checkoutMode,
      orderDate: new Date().toISOString(),
      status:
        checkoutMode === "pre-order" || checkoutMode === "scheduled"
          ? "pre-order-confirmed"
          : "confirmed",
      paymentStatus: "paid",
      paymentMethod,
      expectedDelivery:
        checkoutMode === "buy-now"
          ? "Earliest available delivery"
          : checkoutMode === "scheduled"
            ? "Pre-order delivery before Ganesh Chaturthi"
            : cartItems[0]?.product.preorder?.expectedDelivery,
      expectedDispatch:
        checkoutMode === "pre-order" || checkoutMode === "scheduled"
          ? cartItems[0]?.product.preorder?.expectedDelivery
          : undefined,
      deliveryDate: checkoutMode === "scheduled" ? scheduledDeliveryDate : undefined,
      deliverySlot: checkoutMode === "scheduled" ? scheduledDeliverySlot : undefined,
    };

    updateCurrentUserData((data) => ({
      ...data,
      orders: [order, ...data.orders],
    }));
    setCartItems([]);
    setCheckoutModeState("buy-now");
    setSuccessMessage(`Order ${order.id} created`);
    return order;
  }, [
    addresses,
    cartItems,
    cartSubtotal,
    cartTotal,
    checkoutMode,
    memberDiscount,
    handlingCharge,
    paymentMethod,
    scheduledDeliveryDate,
    scheduledDeliverySlot,
    effectiveSelectedAddressId,
    updateCurrentUserData,
    userId,
  ]);

  const getOrderById = useCallback(
    (orderId: string) => orders.find((order) => order.id.toLowerCase() === orderId.toLowerCase()),
    [orders],
  );

  const findOrders = useCallback(
    (query: string) => {
      const normalized = query.trim().toLowerCase();
      if (!normalized) {
        return [];
      }

      return orders.filter((order) => {
        const addressMobile = order.address?.mobile.replace(/\s/g, "") ?? "";
        return order.id.toLowerCase() === normalized || addressMobile === normalized.replace(/\s/g, "");
      });
    },
    [orders],
  );

  const value = useMemo<ShopContextValue>(
    () => ({
      isLoggedIn,
      currentUser,
      discountUnlocked,
      authModalOpen,
      authMode,
      authStep,
      authEmail,
      successMessage,
      cartDrawerOpen,
      cartItems,
      cartCount,
      cartSubtotal,
      memberDiscount,
      handlingCharge,
      cartTotal,
      paymentMethod,
      checkoutMode,
      orders,
      savedItems,
      savedItemCount: savedItems.length,
      addresses,
      selectedAddressId: effectiveSelectedAddressId,
      scheduledDeliveryDate,
      scheduledDeliverySlot,
      openAuthModal,
      closeAuthModal,
      setAuthMode,
      setAuthStep,
      setAuthEmail,
      completeAuth,
      logout,
      openCartDrawer,
      closeCartDrawer,
      addToCart,
      buyNow,
      setCheckoutMode,
      updateCartItem,
      removeFromCart,
      toggleSavedItem,
      isSavedItem,
      addAddress,
      updateAddress,
      deleteAddress,
      setDefaultAddress,
      setSelectedAddressId: setSelectedAddressIdState,
      setScheduledDeliveryDate,
      setScheduledDeliverySlot,
      setPaymentMethod,
      createOrder,
      getOrderById,
      findOrders,
      clearSuccessMessage: () => setSuccessMessage(""),
    }),
    [
      addToCart,
      authEmail,
      authModalOpen,
      authMode,
      authStep,
      buyNow,
      cartDrawerOpen,
      cartCount,
      cartItems,
      cartSubtotal,
      cartTotal,
      checkoutMode,
      closeAuthModal,
      closeCartDrawer,
      completeAuth,
      currentUser,
      createOrder,
      findOrders,
      getOrderById,
      discountUnlocked,
      handlingCharge,
      isLoggedIn,
      isSavedItem,
      logout,
      memberDiscount,
      openAuthModal,
      openCartDrawer,
      removeFromCart,
      addresses,
      addAddress,
      deleteAddress,
      orders,
      savedItems,
      scheduledDeliveryDate,
      scheduledDeliverySlot,
      paymentMethod,
      effectiveSelectedAddressId,
      setCheckoutMode,
      setDefaultAddress,
      setScheduledDeliveryDate,
      setScheduledDeliverySlot,
      updateCartItem,
      toggleSavedItem,
      updateAddress,
      successMessage,
    ],
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error("useShop must be used inside ShopProvider");
  }

  return context;
}

function safelyParseCart(value: string): CartItem[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function safelyParseAuth(value: string): CurrentUser | null {
  try {
    const parsed = JSON.parse(value);
    if (typeof parsed?.id === "string") {
      return {
        id: parsed.id,
        email: typeof parsed.email === "string" ? parsed.email : "",
        name: typeof parsed.name === "string" ? parsed.name : "BHORKIT Devotee",
        mobile: typeof parsed.mobile === "string" ? parsed.mobile : undefined,
      };
    }
    return typeof parsed?.email === "string"
      ? { id: parsed.email, email: parsed.email, name: "BHORKIT Devotee" }
      : null;
  } catch {
    return null;
  }
}

type UserCustomerData = {
  orders: CustomerOrder[];
  savedItems: CollectionProduct[];
  addresses: CustomerAddress[];
};

type CustomerDataStore = Record<string, UserCustomerData>;

const emptyUserData: UserCustomerData = {
  orders: [],
  savedItems: [],
  addresses: [],
};

function getUserData(data: CustomerDataStore, userId: string): UserCustomerData {
  return data[userId] ?? emptyUserData;
}

function getInitialCustomerData(): CustomerDataStore {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const stored = window.localStorage.getItem(customerDataStorageKey);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function createClientId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function generateOrderId() {
  const date = new Date();
  const stamp = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("");
  const suffix = `${date.getHours()}${date.getMinutes()}${date.getSeconds()}${Math.floor(Math.random() * 90 + 10)}`;
  return `BHK${stamp}${suffix}`;
}

function getInitialCart() {
  if (typeof window === "undefined") {
    return [];
  }

  const storedCart = window.localStorage.getItem(cartStorageKey);
  return storedCart ? safelyParseCart(storedCart) : [];
}

function getInitialAuth() {
  if (typeof window === "undefined") {
    return null;
  }

  const storedAuth = window.localStorage.getItem(authStorageKey);
  return storedAuth ? safelyParseAuth(storedAuth) : null;
}

function getInitialCheckoutMode(): CheckoutMode {
  if (typeof window === "undefined") {
    return "buy-now";
  }

  const storedMode = window.localStorage.getItem(checkoutModeStorageKey);
  return storedMode === "scheduled" || storedMode === "pre-order" ? storedMode : "buy-now";
}
