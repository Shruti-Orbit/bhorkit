"use client";

import type { ReactNode } from "react";
import { ShopProvider } from "@/src/context/ShopContext";
import { LoginModal } from "@/src/components/header/LoginModal";
import { SignupOfferPopup } from "@/src/components/promotional/SignupOfferPopup";
import { ShopToast } from "@/src/components/providers/ShopToast";
import { CartDrawer } from "@/src/components/cart/CartDrawer";

export function ShopProviders({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ShopProvider>
      {children}
      <LoginModal />
      <CartDrawer />
      <SignupOfferPopup />
      <ShopToast />
    </ShopProvider>
  );
}
