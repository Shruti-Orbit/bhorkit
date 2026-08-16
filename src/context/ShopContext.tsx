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
import { logout as logoutFromBackend } from "@/src/lib/api/auth.api";
import {
  calculateHandlingCharge,
  calculateMemberDiscount,
  parsePrice,
} from "@/src/utils/discount";
import { isValidGaneshPreOrderDate } from "@/src/utils/preorder";

export type CheckoutMode = "buy-now" | "scheduled" | "pre-order";
export type PaymentMethod = "unselected" | "online";

export type CurrentUser = {
  email: string;
  id: string;
  image?: string | null;
  mobile?: string;
  name: string;
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
  email?: string;
};

type ShopContextValue = {
  isLoggedIn: boolean;
  currentUser: CurrentUser | null;
  discountUnlocked: boolean;
  authModalOpen: boolean;
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
  setAuthEmail: (email: string) => void;
  completeAuth: (user: CurrentUser) => void;
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
const checkoutModeStorageKey = "bhorkit_checkout_mode";
const customerDataStorageKey = "bhorkit_customer_data";
const authSessionStorageKey = "bhorkit_auth_session";

export function ShopProvider({ children }: { children: ReactNode }) {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>(() => getInitialCart());
  const [checkoutMode, setCheckoutModeState] = useState<CheckoutMode>(() => getInitialCheckoutMode());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("unselected");
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => getInitialAuthSession());
  const [customerData, setCustomerData] = useState<CustomerDataStore>(() => getInitialCustomerData());
  const [selectedAddressId, setSelectedAddressIdState] = useState("");
  const [scheduledDeliveryDate, setScheduledDeliveryDate] = useState("");
  const [scheduledDeliverySlot, setScheduledDeliverySlot] = useState("");

  const isLoggedIn = Boolean(currentUser);
  const discountUnlocked = isLoggedIn;
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

  useEffect(() => {
    if (currentUser) {
      window.localStorage.setItem(authSessionStorageKey, JSON.stringify(currentUser));
      return;
    }

    window.localStorage.removeItem(authSessionStorageKey);
  }, [currentUser]);

  useEffect(() => {
    if (isLoggedIn) {
      const timer = window.setTimeout(() => setAuthModalOpen(false), 0);
      return () => window.clearTimeout(timer);
    }
  }, [isLoggedIn]);

  const effectiveSelectedAddressId =
    selectedAddressId || addresses.find((address) => address.isDefault)?.id || addresses[0]?.id || "";

  const openAuthModal = useCallback((options?: AuthModalOptions) => {
    setAuthEmail(options?.email ?? "");
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
  }, []);

  const completeAuth = useCallback((user: CurrentUser) => {
    setCurrentUser(user);
    setAuthModalOpen(false);
    setSuccessMessage("Logged in successfully");
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setAuthModalOpen(false);
    setSuccessMessage("Logged out");
    void logoutFromBackend().catch(() => undefined);
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
      openAuthModal();
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
    effectiveSelectedAddressId,
    handlingCharge,
    memberDiscount,
    paymentMethod,
    scheduledDeliveryDate,
    scheduledDeliverySlot,
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
      addAddress,
      addToCart,
      addresses,
      authEmail,
      authModalOpen,
      buyNow,
      cartCount,
      cartDrawerOpen,
      cartItems,
      cartSubtotal,
      cartTotal,
      checkoutMode,
      closeAuthModal,
      completeAuth,
      closeCartDrawer,
      createOrder,
      currentUser,
      deleteAddress,
      discountUnlocked,
      effectiveSelectedAddressId,
      findOrders,
      getOrderById,
      handlingCharge,
      isLoggedIn,
      isSavedItem,
      logout,
      memberDiscount,
      openAuthModal,
      openCartDrawer,
      orders,
      paymentMethod,
      removeFromCart,
      savedItems,
      scheduledDeliveryDate,
      scheduledDeliverySlot,
      setCheckoutMode,
      setDefaultAddress,
      successMessage,
      toggleSavedItem,
      updateAddress,
      updateCartItem,
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

function getInitialCheckoutMode(): CheckoutMode {
  if (typeof window === "undefined") {
    return "buy-now";
  }

  const storedMode = window.localStorage.getItem(checkoutModeStorageKey);
  return storedMode === "scheduled" || storedMode === "pre-order" ? storedMode : "buy-now";
}

function getInitialAuthSession(): CurrentUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(authSessionStorageKey);
    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored) as Partial<CurrentUser>;
    return parsed.id && parsed.email && parsed.name
      ? {
          email: parsed.email,
          id: parsed.id,
          image: parsed.image,
          mobile: parsed.mobile,
          name: parsed.name,
        }
      : null;
  } catch {
    return null;
  }
}
