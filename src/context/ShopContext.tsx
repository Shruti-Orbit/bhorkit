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
import { getCurrentUser, logout as logoutFromBackend } from "@/src/lib/api/auth.api";
import { ApiClientError } from "@/src/lib/api/client";
import {
  addToWishlist as addToWishlistApi,
  getWishlist as getWishlistApi,
  removeFromWishlist as removeFromWishlistApi,
} from "@/src/lib/api/wishlist.api";
import {
  addCartItem as addCartItemApi,
  clearCart as clearCartApi,
  getCart as getCartApi,
  mergeCart as mergeCartApi,
  removeCartItem as removeCartItemApi,
  setCartItemQuantity as setCartItemQuantityApi,
  type BackendCart,
} from "@/src/lib/api/cart.api";
import {
  createAddress as createAddressApi,
  deleteAddress as deleteAddressApi,
  getAddresses as getAddressesApi,
  setDefaultAddress as setDefaultAddressApi,
  updateAddress as updateAddressApi,
} from "@/src/lib/api/address.api";
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
  redirectTo?: string;
};

type ShopContextValue = {
  isLoggedIn: boolean;
  currentUser: CurrentUser | null;
  discountUnlocked: boolean;
  authModalOpen: boolean;
  authRedirectTo: string;
  successMessage: string;
  errorMessage: string;
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
  addAddress: (address: Omit<CustomerAddress, "id">) => Promise<boolean>;
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
  clearErrorMessage: () => void;
};

const ShopContext = createContext<ShopContextValue | null>(null);
const cartStorageKey = "bhorkit_guest_cart";
const checkoutModeStorageKey = "bhorkit_checkout_mode";
const customerOrdersStorageKey = "bhorkit_customer_orders";
const authSessionStorageKey = "bhorkit_auth_session";

function toCartItems(cart: BackendCart): CartItem[] {
  return cart.items.map((item) => ({ product: item.product, quantity: item.quantity }));
}

function applyCartAdd(items: CartItem[], product: CollectionProduct, quantity: number): CartItem[] {
  const existingItem = items.find((item) => item.product.id === product.id);
  if (existingItem) {
    return items.map((item) =>
      item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item,
    );
  }
  return [...items, { product, quantity }];
}

function applyCartSet(items: CartItem[], productId: string, quantity: number): CartItem[] {
  return items
    .map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    .filter((item) => item.quantity > 0);
}

function errorMessageFrom(error: unknown, fallback: string) {
  return error instanceof ApiClientError ? error.message : fallback;
}

export function ShopProvider({ children }: { children: ReactNode }) {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authRedirectTo, setAuthRedirectTo] = useState("/");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>(() => getInitialCart());
  const [checkoutMode, setCheckoutModeState] = useState<CheckoutMode>(() => getInitialCheckoutMode());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("unselected");
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => getInitialAuthSession());
  const [customerOrders, setCustomerOrders] = useState<UserOrdersStore>(() => getInitialCustomerOrders());
  const [savedItems, setSavedItems] = useState<CollectionProduct[]>([]);
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [selectedAddressId, setSelectedAddressIdState] = useState("");
  const [scheduledDeliveryDate, setScheduledDeliveryDate] = useState("");
  const [scheduledDeliverySlot, setScheduledDeliverySlot] = useState("");

  const isLoggedIn = Boolean(currentUser);
  const discountUnlocked = isLoggedIn;
  const userId = currentUser?.id ?? "";
  const orders = useMemo(
    () => (userId ? customerOrders[userId] ?? [] : []),
    [customerOrders, userId],
  );

  useEffect(() => {
    // Once logged in, the cart lives in the DB, not localStorage — writing it
    // here would resurrect a stale guest cart every time the DB cart changes.
    if (isLoggedIn) return;
    window.localStorage.setItem(cartStorageKey, JSON.stringify(cartItems));
  }, [cartItems, isLoggedIn]);

  useEffect(() => {
    window.localStorage.setItem(checkoutModeStorageKey, checkoutMode);
  }, [checkoutMode]);

  useEffect(() => {
    window.localStorage.setItem(customerOrdersStorageKey, JSON.stringify(customerOrders));
  }, [customerOrders]);

  useEffect(() => {
    if (currentUser) {
      window.localStorage.setItem(authSessionStorageKey, JSON.stringify(currentUser));
      return;
    }

    window.localStorage.removeItem(authSessionStorageKey);
  }, [currentUser]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authStatus = params.get("auth");
    if (!authStatus) {
      return;
    }

    // Deferred a tick so this doesn't set state synchronously within the
    // effect body (react-hooks/set-state-in-effect).
    if (authStatus === "success") {
      queueMicrotask(() => setSuccessMessage("Logged in successfully"));
    } else if (authStatus === "failed") {
      queueMicrotask(() => setErrorMessage("Google sign-in failed. Please try again."));
    }

    params.delete("auth");
    const nextSearch = params.toString();
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ""}${window.location.hash}`,
    );
  }, []);

  useEffect(() => {
    let isActive = true;

    getCurrentUser()
      .then((user) => {
        if (!isActive) return;
        setCurrentUser({
          email: user.email,
          id: user.id,
          image: user.image,
          name: user.name,
        });
      })
      .catch(() => {
        if (!isActive) return;
        setCurrentUser(null);
      });

    return () => {
      isActive = false;
    };
  }, []);

  // Fires whenever a user session becomes active — both right after a fresh
  // login and after a page reload restores a session from the auth cookie.
  // Any items added to the guest cart before login are merged into the DB
  // cart here; wishlist/cart/addresses then become fully server-sourced.
  useEffect(() => {
    if (!currentUser) {
      return;
    }

    let isActive = true;
    const guestCartItems = getInitialCart();

    (async () => {
      try {
        const [cart, wishlist, userAddresses] = await Promise.all([
          guestCartItems.length > 0
            ? mergeCartApi(guestCartItems.map((item) => ({ productId: item.product.id, quantity: item.quantity })))
            : getCartApi(),
          getWishlistApi(),
          getAddressesApi(),
        ]);

        if (!isActive) return;

        window.localStorage.removeItem(cartStorageKey);
        setCartItems(toCartItems(cart));
        setSavedItems(wishlist);
        setAddresses(userAddresses);
      } catch {
        if (!isActive) return;
        setErrorMessage("Couldn't load your saved cart, wishlist and addresses. Please refresh.");
      }
    })();

    return () => {
      isActive = false;
    };
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
    setAuthRedirectTo(options?.redirectTo ?? window.location.pathname);
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
    setSavedItems([]);
    setAddresses([]);
    setSelectedAddressIdState("");
    // Start the next session with a clean guest cart rather than resurrecting
    // one that was already merged into the account we're signing out of.
    setCartItems([]);
    window.localStorage.removeItem(cartStorageKey);
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
    setCartItems((items) => applyCartAdd(items, product, quantity));
    setSuccessMessage("Added to your cart");
    setCartDrawerOpen(true);

    if (!userId) return;

    addCartItemApi(product.id, quantity)
      .then((cart) => setCartItems(toCartItems(cart)))
      .catch((error) => {
        setErrorMessage(errorMessageFrom(error, "Couldn't add this item to your cart. Please try again."));
        void getCartApi().then((cart) => setCartItems(toCartItems(cart))).catch(() => undefined);
      });
  }, [userId]);

  const setCheckoutMode = useCallback((mode: CheckoutMode) => {
    setCheckoutModeState(mode);
  }, []);

  const buyNow = useCallback((product: CollectionProduct, mode: CheckoutMode = "buy-now") => {
    setCartItems([{ product, quantity: 1 }]);
    setCheckoutModeState(mode);
  }, []);

  const updateCartItem = useCallback((productId: string, quantity: number) => {
    setCartItems((items) => applyCartSet(items, productId, quantity));

    if (!userId) return;

    setCartItemQuantityApi(productId, quantity)
      .then((cart) => setCartItems(toCartItems(cart)))
      .catch((error) => {
        setErrorMessage(errorMessageFrom(error, "Couldn't update your cart. Please try again."));
        void getCartApi().then((cart) => setCartItems(toCartItems(cart))).catch(() => undefined);
      });
  }, [userId]);

  const removeFromCart = useCallback((productId: string) => {
    setCartItems((items) => items.filter((item) => item.product.id !== productId));

    if (!userId) return;

    removeCartItemApi(productId)
      .then((cart) => setCartItems(toCartItems(cart)))
      .catch((error) => {
        setErrorMessage(errorMessageFrom(error, "Couldn't remove this item from your cart. Please try again."));
        void getCartApi().then((cart) => setCartItems(toCartItems(cart))).catch(() => undefined);
      });
  }, [userId]);

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

  const toggleSavedItem = useCallback((product: CollectionProduct) => {
    if (!userId) {
      openAuthModal();
      return;
    }

    const alreadySaved = savedItems.some((item) => item.id === product.id);
    setSavedItems((items) =>
      alreadySaved ? items.filter((item) => item.id !== product.id) : [product, ...items],
    );
    setSuccessMessage(alreadySaved ? "Removed from Saved Items" : "Added to Saved Items");

    const request = alreadySaved ? removeFromWishlistApi(product.id) : addToWishlistApi(product.id);
    request.catch((error) => {
      setSavedItems((items) => {
        const stillHasIt = items.some((item) => item.id === product.id);
        if (alreadySaved && !stillHasIt) return [product, ...items];
        if (!alreadySaved && stillHasIt) return items.filter((item) => item.id !== product.id);
        return items;
      });
      setErrorMessage(errorMessageFrom(error, "Couldn't update your wishlist. Please try again."));
    });
  }, [openAuthModal, savedItems, userId]);

  const isSavedItem = useCallback(
    (productId: string) => savedItems.some((product) => product.id === productId),
    [savedItems],
  );

  const addAddress = useCallback((address: Omit<CustomerAddress, "id">) => {
    if (!userId) {
      openAuthModal();
      return Promise.resolve(false);
    }

    return createAddressApi(address)
      .then((created) => {
        setAddresses((current) => {
          const withoutOldDefault = created.isDefault
            ? current.map((item) => ({ ...item, isDefault: false }))
            : current;
          return [...withoutOldDefault, created];
        });
        setSelectedAddressIdState(created.id);
        setSuccessMessage("Address saved");
        return true;
      })
      .catch((error) => {
        setErrorMessage(errorMessageFrom(error, "Couldn't save this address. Please try again."));
        return false;
      });
  }, [openAuthModal, userId]);

  const updateAddress = useCallback((address: CustomerAddress) => {
    if (!userId) return;
    const { id, ...fields } = address;

    updateAddressApi(id, fields)
      .then((updated) => {
        setAddresses((current) => current.map((item) => (item.id === id ? updated : item)));
        setSuccessMessage("Address updated");
      })
      .catch((error) => {
        setErrorMessage(errorMessageFrom(error, "Couldn't update this address. Please try again."));
      });
  }, [userId]);

  const deleteAddress = useCallback((addressId: string) => {
    if (!userId) return;

    setAddresses((current) => current.filter((address) => address.id !== addressId));
    if (selectedAddressId === addressId) {
      setSelectedAddressIdState("");
    }

    deleteAddressApi(addressId)
      .then(() => {
        setSuccessMessage("Address deleted");
        // The server may have promoted a new default when the deleted
        // address was the default one — re-sync to reflect that.
        void getAddressesApi().then(setAddresses).catch(() => undefined);
      })
      .catch((error) => {
        void getAddressesApi().then(setAddresses).catch(() => undefined);
        setErrorMessage(errorMessageFrom(error, "Couldn't delete this address. Please try again."));
      });
  }, [selectedAddressId, userId]);

  const setDefaultAddress = useCallback((addressId: string) => {
    if (!userId) return;

    setAddresses((current) => current.map((item) => ({ ...item, isDefault: item.id === addressId })));
    setSelectedAddressIdState(addressId);

    setDefaultAddressApi(addressId).catch((error) => {
      void getAddressesApi().then(setAddresses).catch(() => undefined);
      setErrorMessage(errorMessageFrom(error, "Couldn't update your default address. Please try again."));
    });
  }, [userId]);

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

    setCustomerOrders((data) => ({ ...data, [userId]: [order, ...(data[userId] ?? [])] }));
    setCartItems([]);
    setCheckoutModeState("buy-now");
    setSuccessMessage(`Order ${order.id} created`);
    void clearCartApi().catch(() => undefined);
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
      authRedirectTo,
      successMessage,
      errorMessage,
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
      clearErrorMessage: () => setErrorMessage(""),
    }),
    [
      addAddress,
      addToCart,
      addresses,
      authRedirectTo,
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
      errorMessage,
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

type UserOrdersStore = Record<string, CustomerOrder[]>;

function getInitialCustomerOrders(): UserOrdersStore {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const stored = window.localStorage.getItem(customerOrdersStorageKey);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
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
          name: parsed.name,
        }
      : null;
  } catch {
    return null;
  }
}
