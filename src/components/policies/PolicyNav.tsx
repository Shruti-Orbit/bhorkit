"use client";

import { useEffect, useState } from "react";

type PolicyNavProps = {
  sections: { id: string; label: string }[];
};

/**
 * Navigation between the five policies.
 *
 * On large screens it sticks alongside the text and highlights whichever policy
 * is currently in view. On smaller screens the same links wrap into a compact
 * block of chips above the content, so every policy is one tap away.
 *
 * The links are plain `#` anchors, so they work before hydration and on a
 * direct visit to /policies#privacy — the smooth scrolling and the active
 * highlight are enhancements on top, not the mechanism.
 */
export function PolicyNav({ sections }: PolicyNavProps) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? "");

  useEffect(() => {
    const headings = sections
      .map((section) => document.getElementById(section.id))
      .filter((element): element is HTMLElement => element !== null);

    if (headings.length === 0) return;

    // rootMargin pulls the detection line down below the header and up from the
    // bottom, so the highlighted item is the policy actually being read rather
    // than whichever one happens to touch the viewport edge.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-120px 0px -55% 0px", threshold: 0 },
    );

    for (const heading of headings) observer.observe(heading);
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav aria-label="Policy sections" className="lg:sticky lg:top-6">
      <p className="hidden text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-text-muted lg:block">
        On this page
      </p>

      {/* Mobile and tablet: the five labels wrap onto as many lines as they
          need. A horizontal scroll strip clipped the last two, and with only
          five short items there is nothing to gain from hiding any of them
          behind a swipe most people never try. */}
      <ul className="flex flex-wrap gap-2 lg:mt-3 lg:flex-col lg:flex-nowrap lg:gap-1">
        {sections.map((section) => {
          const active = activeId === section.id;
          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                aria-current={active ? "true" : undefined}
                className={`block rounded-bhor-sm border px-3 py-2 text-bhor-caption font-bhor-semibold transition-colors lg:border-0 lg:border-l-2 lg:px-3 lg:text-bhor-small ${
                  active
                    ? "border-bhor-primary bg-bhor-primary-soft text-bhor-primary lg:bg-transparent"
                    : "border-bhor-border bg-bhor-surface text-bhor-text-muted hover:text-bhor-primary lg:bg-transparent"
                }`}
              >
                {section.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
