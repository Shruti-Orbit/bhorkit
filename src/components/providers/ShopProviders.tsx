"use client";

import type { ReactNode } from "react";
import { ShopProvider } from "@/src/context/ShopContext";
import { LoginModal } from "@/src/components/header/LoginModal";
import { SignupOfferPopup } from "@/src/components/promotional/SignupOfferPopup";
import { ShopToast } from "@/src/components/providers/ShopToast";

export function ShopProviders({ children }: { children: ReactNode }) {
  return (
    <ShopProvider>
      {children}
      <LoginModal />
      <SignupOfferPopup />
      <ShopToast />
    </ShopProvider>
  );
}
