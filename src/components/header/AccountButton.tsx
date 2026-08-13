"use client";

import { useState } from "react";
import { UserRound } from "lucide-react";
import { LoginModal } from "./LoginModal";

export function AccountButton() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label="Account login"
        onClick={() => setIsLoginOpen(true)}
        className="flex h-11 w-11 items-center justify-center text-bhor-text transition-colors hover:text-bhor-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary"
      >
        <UserRound className="h-6 w-6" aria-hidden />
      </button>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
}
