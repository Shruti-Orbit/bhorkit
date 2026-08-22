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
import { getOrders as getOrdersApi, type BackendOrder } from "@/src/lib/api/order.api";
import {
  calculateHandlingCharge,
  calculateMemberDiscount,
  parsePrice,
} from "@/src/utils/discount";

export type CheckoutMode = "buy-now" | "scheduled" | "pre-order";

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

// Orders are server-owned now: they're created by the payment flow, keyed to
// a real Razorpay payment, and read back from the API. The previous
// localStorage-backed CustomerOrder type is gone — a browser-authored order
// record can't be reconciled against a payment, survives no device change,
// and was only ever a placeholder for this.
export type CustomerOrder = BackendOrder;

type AuthModalOptions = {
  redirectTo?: string;
};

type ShopContextValue = {
  isLoggedIn: boolean;
  isAuthReady: boolean;
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
  checkoutMode: CheckoutMode;
  orders: CustomerOrder[];
  isOrdersLoading: boolean;
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
  refreshOrders: () => Promise<void>;
  getOrderById: (orderId: string) => CustomerOrder | undefined;
  findOrders: (query: string) => CustomerOrder[];
  clearSuccessMessage: () => void;
  clearErrorMessage: () => void;
};

const ShopContext = createContext<ShopContextValue | null>(null);
const cartStorageKey = "bhorkit_guest_cart";
const checkoutModeStorageKey = "bhorkit_checkout_mode";

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
  // Always starts null (never read from localStorage here): the server
  // never sees the session cookie during SSR — it's scoped to the backend's
  // own origin — so SSR can only ever render "logged out". Seeding this from
  // localStorage on the client's first render would make that first render
  // disagree with the server-rendered HTML (a hydration mismatch), which
  // forces React to throw away and re-render the mismatched subtree — a
  // real, visible flash, not just a dev-mode console warning. The bootstrap
  // effect below is the only source of truth, confirmed against the server.
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  // Which user's orders the initial load has completed for. Tracking it this
  // way lets "are we loading?" be derived during render instead of being
  // flipped on inside the bootstrap effect (react-hooks/set-state-in-effect).
  const [ordersSyncedUserId, setOrdersSyncedUserId] = useState<string | null>(null);
  const [isRefreshingOrders, setIsRefreshingOrders] = useState(false);
  const [savedItems, setSavedItems] = useState<CollectionProduct[]>([]);
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [selectedAddressId, setSelectedAddressIdState] = useState("");
  const [scheduledDeliveryDate, setScheduledDeliveryDate] = useState("");
  const [scheduledDeliverySlot, setScheduledDeliverySlot] = useState("");

  const isLoggedIn = Boolean(currentUser);
  const discountUnlocked = isLoggedIn;
  const userId = currentUser?.id ?? "";
  const isOrdersLoading = (Boolean(userId) && ordersSyncedUserId !== userId) || isRefreshingOrders;

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
    let hasRetried = false;

    function checkSession() {
      getCurrentUser()
        .then((user) => {
          if (!isActive) return;
          setCurrentUser({
            email: user.email,
            id: user.id,
            image: user.image,
            name: user.name,
          });
          setIsAuthReady(true);
        })
        .catch((error) => {
          if (!isActive) return;

          // A definitive 401 (no/invalid session) or 404 (token verifies
          // but the account it points to no longer exists) both mean
          // retrying is pointless — the outcome won't change. Any other
          // failure (a network blip, the backend momentarily unreachable)
          // gets one retry before we conclude the user is logged out.
          // Without this, a single transient failure right after login
          // would leave someone who really is authenticated stuck looking
          // logged out until they manually refresh.
          const isTokenValidButAccountGone =
            error instanceof ApiClientError && error.status === 404;
          const isDefinitelyLoggedOut =
            error instanceof ApiClientError && (error.status === 401 || error.status === 404);

          if (isDefinitelyLoggedOut || hasRetried) {
            // 404 means the cookie's token still verifies, but the account it
            // points to no longer exists (e.g. the database was reset). That
            // token can never succeed again, so actively clear it — otherwise
            // the browser keeps attaching a dead cookie to every request until
            // it expires days later, and that one browser stays stuck looking
            // logged out while others work fine.
            if (isTokenValidButAccountGone) {
              void logoutFromBackend().catch(() => undefined);
            }
            setCurrentUser(null);
            setIsAuthReady(true);
            return;
          }

          hasRetried = true;
          window.setTimeout(checkSession, 800);
        });
    }

    checkSession();

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
        const [cart, wishlist, userAddresses, userOrders] = await Promise.all([
          guestCartItems.length > 0
            ? mergeCartApi(guestCartItems.map((item) => ({ productId: item.product.id, quantity: item.quantity })))
            : getCartApi(),
          getWishlistApi(),
          getAddressesApi(),
          getOrdersApi(),
        ]);

        if (!isActive) return;

        window.localStorage.removeItem(cartStorageKey);
        setCartItems(toCartItems(cart));
        setSavedItems(wishlist);
        setAddresses(userAddresses);
        setOrders(userOrders);
      } catch {
        if (!isActive) return;
        setErrorMessage("Couldn't load your saved cart, wishlist and orders. Please refresh.");
      } finally {
        // Marked synced either way — a failed load shouldn't leave every
        // orders view stuck on a spinner with no way out but a refresh.
        if (isActive) setOrdersSyncedUserId(currentUser.id);
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
    setIsAuthReady(true);
    setAuthModalOpen(false);
    setSuccessMessage("Logged in successfully");
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setSavedItems([]);
    setAddresses([]);
    setOrders([]);
    setOrdersSyncedUserId(null);
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
  // Every order is paid online through Razorpay — there is no payment-method
  // choice any more — so the online-payment discount always applies. The
  // server applies the identical rule when it prices the order; this is only
  // for display.
  const memberDiscount = calculateMemberDiscount(cartSubtotal);
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

  // Re-pulls the authoritative order list. Called after a payment is
  // confirmed, and by any page that wants to be sure it isn't rendering a
  // stale list — the server, not this context, decides what orders exist.
  // The cart is cleared server-side as part of confirming the payment, so it
  // gets re-read here rather than being emptied optimistically.
  const refreshOrders = useCallback(async () => {
    if (!userId) return;
    setIsRefreshingOrders(true);
    try {
      const [userOrders, cart] = await Promise.all([getOrdersApi(), getCartApi()]);
      setOrders(userOrders);
      setCartItems(toCartItems(cart));
      setCheckoutModeState("buy-now");
    } catch (error) {
      setErrorMessage(errorMessageFrom(error, "Couldn't load your orders. Please refresh."));
    } finally {
      setIsRefreshingOrders(false);
    }
  }, [userId]);

  const getOrderById = useCallback(
    (orderId: string) =>
      orders.find(
        (order) =>
          order.id === orderId || order.orderNumber.toLowerCase() === orderId.toLowerCase(),
      ),
    [orders],
  );

  const findOrders = useCallback(
    (query: string) => {
      const normalized = query.trim().toLowerCase();
      if (!normalized) {
        return [];
      }
      const digitsOnly = normalized.replace(/\s/g, "");

      return orders.filter((order) => {
        const addressMobile = order.address.mobile.replace(/\s/g, "");
        return (
          order.orderNumber.toLowerCase() === normalized ||
          order.id === normalized ||
          addressMobile === digitsOnly
        );
      });
    },
    [orders],
  );

  const value = useMemo<ShopContextValue>(
    () => ({
      isLoggedIn,
      isAuthReady,
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
      checkoutMode,
      orders,
      isOrdersLoading,
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
      refreshOrders,
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
      currentUser,
      deleteAddress,
      discountUnlocked,
      effectiveSelectedAddressId,
      errorMessage,
      findOrders,
      getOrderById,
      handlingCharge,
      isAuthReady,
      isLoggedIn,
      isOrdersLoading,
      isSavedItem,
      logout,
      memberDiscount,
      openAuthModal,
      openCartDrawer,
      orders,
      refreshOrders,
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

