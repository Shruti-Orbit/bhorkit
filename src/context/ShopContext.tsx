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

/**
 * A Buy Now selection made on a product page, kept outside the cart. Only
 * identifiers and a quantity are stored — never a price — so a tampered value
 * can't affect what the customer is charged; the server prices the product
 * from the catalogue at checkout, and the checkout page re-fetches it for
 * display.
 */
export type DirectCheckoutItem = {
  productId: string;
  slug: string;
  quantity: number;
};

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
  buyNow: (product: CollectionProduct, mode?: CheckoutMode, quantity?: number) => void;
  directCheckoutItem: DirectCheckoutItem | null;
  clearDirectCheckout: () => void;
  setCheckoutMode: (mode: CheckoutMode) => void;
  updateCartItem: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  toggleSavedItem: (product: CollectionProduct) => void;
  isSavedItem: (productId: string) => boolean;
  addAddress: (address: Omit<CustomerAddress, "id">) => Promise<boolean>;
  updateAddress: (addressId: string, fields: Partial<Omit<CustomerAddress, "id">>) => Promise<boolean>;
  /** Cap enforced by the server; the UI hides "Add" once it's reached. */
  maxAddresses: number;
  canAddMoreAddresses: boolean;
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
// sessionStorage, not localStorage: a Buy Now belongs to the tab and journey
// the customer is in the middle of. It has to survive a refresh or a
// back-navigation on /checkout (the payment flow depends on that), but it
// should not still be waiting days later in a new session.
const directCheckoutStorageKey = "bhorkit_direct_checkout";

function readDirectCheckout(): DirectCheckoutItem | null {
  try {
    const stored = window.sessionStorage.getItem(directCheckoutStorageKey);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as Partial<DirectCheckoutItem>;
    if (typeof parsed?.productId !== "string" || typeof parsed?.slug !== "string") return null;
    return {
      productId: parsed.productId,
      slug: parsed.slug,
      quantity: Number.isInteger(parsed.quantity) && parsed.quantity! > 0 ? parsed.quantity! : 1,
    };
  } catch {
    return null;
  }
}

function writeDirectCheckout(item: DirectCheckoutItem | null) {
  try {
    if (item) {
      window.sessionStorage.setItem(directCheckoutStorageKey, JSON.stringify(item));
    } else {
      window.sessionStorage.removeItem(directCheckoutStorageKey);
    }
  } catch {
    // Private-mode storage failures only cost the refresh-resume convenience.
  }
}

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
  // Both start at the value SSR produces — an empty cart and the default
  // mode — and are restored from localStorage in an effect below, for the same
  // reason currentUser is (see its comment). Reading storage in the
  // initialiser made the client's first render disagree with the server's:
  // SSR has no `window`, so it rendered a cart of 0 with aria-label "Cart",
  // while the browser rendered the stored guest cart with a badge and
  // aria-label "Cart, N items". That is a genuine hydration mismatch, not a
  // dev-only warning — React discards and re-renders the whole mismatched
  // subtree.
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [checkoutMode, setCheckoutModeState] = useState<CheckoutMode>("buy-now");
  // Guards the persistence effects below. Without it they would fire on the
  // first commit — before the restore effect has run — and write the empty
  // initial state straight over the visitor's saved guest cart.
  const [storageRestored, setStorageRestored] = useState(false);
  // Always starts null and is hydrated from sessionStorage in an effect, for
  // the same reason currentUser is: seeding it in the initialiser would make
  // the client's first render disagree with the server-rendered HTML.
  const [directCheckoutItem, setDirectCheckoutItem] = useState<DirectCheckoutItem | null>(null);
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
  // Served by the API alongside the list, so the cap lives in exactly one
  // place (the server) instead of being duplicated as a UI constant that can
  // drift from what's actually enforced.
  const [maxAddresses, setMaxAddresses] = useState(2);
  const [selectedAddressId, setSelectedAddressIdState] = useState("");
  const [scheduledDeliveryDate, setScheduledDeliveryDate] = useState("");
  const [scheduledDeliverySlot, setScheduledDeliverySlot] = useState("");

  const isLoggedIn = Boolean(currentUser);
  const discountUnlocked = isLoggedIn;
  const userId = currentUser?.id ?? "";
  const isOrdersLoading = (Boolean(userId) && ordersSyncedUserId !== userId) || isRefreshingOrders;

  // Declared here, above the bootstrap effect that calls it, so the effect
  // always closes over the current definition.
  const applyAddressBook = useCallback((book: { addresses: CustomerAddress[]; max: number }) => {
    setAddresses(book.addresses);
    setMaxAddresses(book.max);
  }, []);

  // Restores browser-persisted state after the first paint, so the markup
  // React hydrates is byte-identical to what the server sent. Deferred a tick
  // rather than set synchronously in the effect body
  // (react-hooks/set-state-in-effect).
  useEffect(() => {
    const storedCart = getInitialCart();
    const storedMode = getInitialCheckoutMode();
    queueMicrotask(() => {
      if (storedCart.length > 0) setCartItems(storedCart);
      setCheckoutModeState(storedMode);
      setStorageRestored(true);
    });
  }, []);

  useEffect(() => {
    // Nothing is written until the restore above has happened, or the empty
    // initial cart would clobber what's already saved.
    if (!storageRestored) return;
    // Once logged in, the cart lives in the DB, not localStorage — writing it
    // here would resurrect a stale guest cart every time the DB cart changes.
    if (isLoggedIn) return;
    window.localStorage.setItem(cartStorageKey, JSON.stringify(cartItems));
  }, [cartItems, isLoggedIn, storageRestored]);

  useEffect(() => {
    if (!storageRestored) return;
    window.localStorage.setItem(checkoutModeStorageKey, checkoutMode);
  }, [checkoutMode, storageRestored]);

  // Restores a Buy Now selection after a refresh or back-navigation on the
  // checkout page. Deferred a tick so it isn't a synchronous setState in an
  // effect body (react-hooks/set-state-in-effect).
  useEffect(() => {
    const restored = readDirectCheckout();
    if (!restored) return;
    queueMicrotask(() => setDirectCheckoutItem(restored));
  }, []);

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
        const [cart, wishlist, addressBook, userOrders] = await Promise.all([
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
        applyAddressBook(addressBook);
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
  }, [applyAddressBook, currentUser]);

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

  // Buy Now / Pre-Order Now from a product page. This deliberately does NOT
  // touch cartItems: overwriting them made the header badge and cart drawer
  // show a cart the customer never had, and — because the server cart was
  // untouched — checkout then failed with "Your cart is empty". The selection
  // is recorded separately and sent to the server as `directItem`, which
  // prices it from the catalogue without involving the cart at all.
  const buyNow = useCallback((product: CollectionProduct, mode: CheckoutMode = "buy-now", quantity = 1) => {
    const selection: DirectCheckoutItem = {
      productId: product.id,
      slug: product.slug,
      quantity: Math.max(1, Math.trunc(quantity)),
    };
    setDirectCheckoutItem(selection);
    writeDirectCheckout(selection);
    setCheckoutModeState(mode);
  }, []);

  // Called when the customer chooses cart checkout instead, and once a direct
  // order is confirmed — otherwise a stale selection would hijack the next
  // visit to /checkout.
  const clearDirectCheckout = useCallback(() => {
    setDirectCheckoutItem(null);
    writeDirectCheckout(null);
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

  /**
   * Edits an existing address in place. The id is unchanged by design, so
   * anything already pointing at this address — an in-progress checkout's
   * selection above all — stays valid, and the edit can never be mistaken for
   * a third address against the 2-address cap.
   *
   * Returns whether it succeeded so the form can stay open (with the user's
   * input intact) when the server rejects the change.
   */
  const updateAddress = useCallback((addressId: string, fields: Partial<Omit<CustomerAddress, "id">>) => {
    if (!userId) {
      openAuthModal();
      return Promise.resolve(false);
    }

    return updateAddressApi(addressId, fields)
      .then((updated) => {
        setAddresses((current) => current.map((item) => (item.id === addressId ? updated : item)));
        // Keeps the just-edited address selected for the current checkout.
        // It is almost certainly already selected — the id doesn't change —
        // but a user editing the *other* address at checkout clearly means to
        // use it, and this makes the selection follow that intent.
        setSelectedAddressIdState(addressId);
        setSuccessMessage("Address updated");
        return true;
      })
      .catch((error) => {
        setErrorMessage(errorMessageFrom(error, "Couldn't update this address. Please try again."));
        return false;
      });
  }, [openAuthModal, userId]);

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
        void getAddressesApi().then(applyAddressBook).catch(() => undefined);
      })
      .catch((error) => {
        void getAddressesApi().then(applyAddressBook).catch(() => undefined);
        setErrorMessage(errorMessageFrom(error, "Couldn't delete this address. Please try again."));
      });
  }, [applyAddressBook, selectedAddressId, userId]);

  const setDefaultAddress = useCallback((addressId: string) => {
    if (!userId) return;

    setAddresses((current) => current.map((item) => ({ ...item, isDefault: item.id === addressId })));
    setSelectedAddressIdState(addressId);

    setDefaultAddressApi(addressId).catch((error) => {
      void getAddressesApi().then(applyAddressBook).catch(() => undefined);
      setErrorMessage(errorMessageFrom(error, "Couldn't update your default address. Please try again."));
    });
  }, [applyAddressBook, userId]);

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
      directCheckoutItem,
      clearDirectCheckout,
      setCheckoutMode,
      updateCartItem,
      removeFromCart,
      toggleSavedItem,
      isSavedItem,
      addAddress,
      updateAddress,
      maxAddresses,
      canAddMoreAddresses: addresses.length < maxAddresses,
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
      clearDirectCheckout,
      closeCartDrawer,
      currentUser,
      deleteAddress,
      directCheckoutItem,
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
      maxAddresses,
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

