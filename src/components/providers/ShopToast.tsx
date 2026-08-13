"use client";

import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { useShop } from "@/src/context/ShopContext";

export function ShopToast() {
  const { successMessage, clearSuccessMessage } = useShop();

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timer = window.setTimeout(clearSuccessMessage, 3000);
    return () => window.clearTimeout(timer);
  }, [clearSuccessMessage, successMessage]);

  if (!successMessage) {
    return null;
  }

  return (
    <div className="fixed right-4 top-4 z-[100] flex max-w-sm items-start gap-3 rounded-bhor-md border border-bhor-border bg-bhor-surface p-4 text-bhor-small font-bhor-semibold text-bhor-text shadow-bhor-soft">
      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-bhor-success" aria-hidden />
      {successMessage}
    </div>
  );
}
