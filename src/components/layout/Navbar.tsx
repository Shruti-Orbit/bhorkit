"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import { navigation } from "@/src/data/navigation";

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary navigation"
      className="flex min-w-0 items-center justify-center gap-6 xl:gap-9 2xl:gap-10"
    >
      {navigation.map((item) => {
        const isActive =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className="group relative inline-flex h-[90px] items-center gap-1.5 whitespace-nowrap text-bhor-body font-bhor-medium text-bhor-text transition-colors hover:text-bhor-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-8px] focus-visible:outline-bhor-primary"
          >
            <span className={isActive ? "text-bhor-primary" : undefined}>
              {item.label}
            </span>
            {item.dropdown ? (
              <ChevronDown className="h-3.5 w-3.5 text-bhor-text-muted transition-colors group-hover:text-bhor-primary" aria-hidden />
            ) : null}
            {item.badge ? (
              <span className="ml-1 rounded-bhor-sm bg-bhor-primary px-2 py-1 text-bhor-badge font-bhor-bold leading-none text-white">
                {item.badge}
              </span>
            ) : null}
            <span
              className={`absolute bottom-0 left-0 h-px bg-bhor-primary transition-all ${
                isActive ? "w-full" : "w-0 group-hover:w-full"
              }`}
              aria-hidden
            />
          </Link>
        );
      })}
    </nav>
  );
}
