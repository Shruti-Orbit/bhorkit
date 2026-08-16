"use client";

import type { ReactNode } from "react";
import type { Session } from "next-auth";
import { AuthSessionProvider } from "@/src/components/providers/AuthSessionProvider";
import { ShopProvider } from "@/src/context/ShopContext";
import { LoginModal } from "@/src/components/header/LoginModal";
import { SignupOfferPopup } from "@/src/components/promotional/SignupOfferPopup";
import { ShopToast } from "@/src/components/providers/ShopToast";
import { CartDrawer } from "@/src/components/cart/CartDrawer";

export function ShopProviders({
  children,
  session,
}: {
  children: ReactNode;
  session: Session | null;
}) {
  return (
    <AuthSessionProvider session={session}>
      <ShopProvider>
        {children}
        <LoginModal />
        <CartDrawer />
        <SignupOfferPopup />
        <ShopToast />
      </ShopProvider>
    </AuthSessionProvider>
  );
}
