"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { navigation, type NavigationItem } from "@/src/data/navigation";

const itemClass =
  "group relative inline-flex h-[90px] items-center gap-1.5 whitespace-nowrap text-bhor-body font-bhor-medium text-bhor-text transition-colors hover:text-bhor-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-8px] focus-visible:outline-bhor-primary";

export function Navbar() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);

  // The open menu is remembered together with the route it was opened on, and
  // read back only while the route still matches. That makes "close on
  // navigation" fall out of the derivation — no effect syncing state to
  // pathname, and no stale menu left hanging over the new page after a
  // back/forward. Choosing an item closes it through that link's own onClick.
  const [menu, setMenu] = useState<{ href: string; path: string } | null>(null);
  const openMenu = menu && menu.path === pathname ? menu.href : null;

  useEffect(() => {
    if (!openMenu) return;

    function onPointerDown(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setMenu(null);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenu(null);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openMenu]);

  function isSectionActive(item: NavigationItem) {
    return item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
  }

  return (
    <nav
      ref={navRef}
      aria-label="Primary navigation"
      className="flex min-w-0 items-center justify-center gap-6 xl:gap-9 2xl:gap-10"
    >
      {navigation.map((item) => {
        const isActive = isSectionActive(item);
        const underline = (
          <span
            className={`absolute bottom-0 left-0 h-px bg-bhor-primary transition-all ${
              isActive ? "w-full" : "w-0 group-hover:w-full"
            }`}
            aria-hidden
          />
        );

        if (!item.children) {
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={itemClass}
            >
              <span className={isActive ? "text-bhor-primary" : undefined}>{item.label}</span>
              {item.badge ? (
                <span className="ml-1 rounded-bhor-sm bg-bhor-primary px-2 py-1 text-bhor-badge font-bhor-bold leading-none text-white">
                  {item.badge}
                </span>
              ) : null}
              {underline}
            </Link>
          );
        }

        const open = openMenu === item.href;

        return (
          <div key={item.href} className="relative">
            <button
              type="button"
              aria-expanded={open}
              aria-haspopup="menu"
              aria-current={isActive ? "page" : undefined}
              onClick={() => setMenu(open ? null : { href: item.href, path: pathname })}
              className={itemClass}
            >
              <span className={isActive ? "text-bhor-primary" : undefined}>{item.label}</span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-all group-hover:text-bhor-primary ${
                  open ? "rotate-180 text-bhor-primary" : "text-bhor-text-muted"
                }`}
                aria-hidden
              />
              {underline}
            </button>

            {open ? (
              <div
                role="menu"
                aria-label={item.label}
                // Pulled up to meet the header edge rather than floating below
                // it, so the pointer never crosses a gap on the way down.
                className="absolute left-0 top-[calc(100%-14px)] z-50 w-[268px] overflow-hidden rounded-bhor-md border border-bhor-border bg-bhor-surface py-1.5 shadow-bhor-soft"
              >
                {item.children.map((child) => {
                  const childActive = pathname === child.href;
                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      role="menuitem"
                      aria-current={childActive ? "page" : undefined}
                      onClick={() => setMenu(null)}
                      className={`block px-4 py-2.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-bhor-primary ${
                        childActive ? "bg-bhor-primary-soft" : "hover:bg-bhor-cream"
                      }`}
                    >
                      <span
                        className={`block text-bhor-small font-bhor-semibold ${
                          childActive ? "text-bhor-primary" : "text-bhor-text"
                        }`}
                      >
                        {child.label}
                      </span>
                      {child.blurb ? (
                        <span className="mt-0.5 block text-bhor-caption leading-bhor-body text-bhor-text-muted">
                          {child.blurb}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}
