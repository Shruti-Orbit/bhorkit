"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CollectionProduct } from "@/src/data/products";
import { calculateMemberDiscount, parsePrice } from "@/src/utils/discount";

export type AuthMode = "login" | "signup";
export type AuthStep = "email" | "otp" | "success";

export type CurrentUser = {
  email: string;
};

export type CartItem = {
  product: CollectionProduct;
  quantity: number;
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
  cartItems: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  memberDiscount: number;
  cartTotal: number;
  openAuthModal: (options?: AuthModalOptions) => void;
  closeAuthModal: () => void;
  setAuthMode: (mode: AuthMode) => void;
  setAuthStep: (step: AuthStep) => void;
  setAuthEmail: (email: string) => void;
  completeAuth: (email: string, mode: AuthMode) => void;
  logout: () => void;
  addToCart: (product: CollectionProduct, quantity?: number) => void;
  buyNow: (product: CollectionProduct) => void;
  updateCartItem: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearSuccessMessage: () => void;
};

const ShopContext = createContext<ShopContextValue | null>(null);
const cartStorageKey = "bhorkit_guest_cart";
const authStorageKey = "bhorkit_mock_auth";

export function ShopProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [discountUnlocked, setDiscountUnlocked] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [authStep, setAuthStep] = useState<AuthStep>("email");
  const [authEmail, setAuthEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const storedCart = window.localStorage.getItem(cartStorageKey);
    if (storedCart) {
      setCartItems(safelyParseCart(storedCart));
    }

    const storedAuth = window.localStorage.getItem(authStorageKey);
    if (storedAuth) {
      const parsed = safelyParseAuth(storedAuth);
      setIsLoggedIn(Boolean(parsed?.email));
      setCurrentUser(parsed);
      setDiscountUnlocked(Boolean(parsed?.email));
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(cartStorageKey, JSON.stringify(cartItems));
  }, [cartItems]);

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

  const completeAuth = useCallback((email: string, mode: AuthMode) => {
    const user = { email: email.trim().toLowerCase() };
    setIsLoggedIn(true);
    setCurrentUser(user);
    setDiscountUnlocked(true);
    setAuthStep("success");
    setSuccessMessage(
      mode === "signup"
        ? "Welcome to BHORKIT! Your account is ready and you've unlocked 10% OFF."
        : "Welcome to BHORKIT! You've unlocked 10% OFF on your order.",
    );
    window.localStorage.setItem(authStorageKey, JSON.stringify(user));
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setDiscountUnlocked(false);
    window.localStorage.removeItem(authStorageKey);
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
  }, []);

  const buyNow = useCallback((product: CollectionProduct) => {
    setCartItems([{ product, quantity: 1 }]);
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
  const memberDiscount = discountUnlocked ? calculateMemberDiscount(cartSubtotal) : 0;
  const cartTotal = cartSubtotal - memberDiscount;
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

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
      cartItems,
      cartCount,
      cartSubtotal,
      memberDiscount,
      cartTotal,
      openAuthModal,
      closeAuthModal,
      setAuthMode,
      setAuthStep,
      setAuthEmail,
      completeAuth,
      logout,
      addToCart,
      buyNow,
      updateCartItem,
      removeFromCart,
      clearSuccessMessage: () => setSuccessMessage(""),
    }),
    [
      addToCart,
      authEmail,
      authModalOpen,
      authMode,
      authStep,
      buyNow,
      cartCount,
      cartItems,
      cartSubtotal,
      cartTotal,
      closeAuthModal,
      completeAuth,
      currentUser,
      discountUnlocked,
      isLoggedIn,
      logout,
      memberDiscount,
      openAuthModal,
      removeFromCart,
      updateCartItem,
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
    return typeof parsed?.email === "string" ? { email: parsed.email } : null;
  } catch {
    return null;
  }
}
