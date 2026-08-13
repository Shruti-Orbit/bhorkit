"use client";

import { useState } from "react";
import { Check, ChevronDown, ClipboardList, Info, Truck } from "lucide-react";
import type { CollectionProduct } from "@/src/data/products";

type AboutProductAccordionProps = {
  product: CollectionProduct;
};

export function AboutProductAccordion({ product }: AboutProductAccordionProps) {
  const [openSection, setOpenSection] = useState("");

  const sections = [
    {
      id: "description",
      label: "Description",
      icon: Info,
      content: (
        <div className="space-y-4">
          <p>{product.description}</p>
          <div>
            <p className="text-bhor-small font-bhor-bold text-bhor-text">What&apos;s inside your kit</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {product.contents.map((item) => (
                <div
                  key={`${item.name}-${item.quantity}-${item.unit}`}
                  className="flex items-start justify-between gap-3 rounded-bhor-sm bg-bhor-cream px-3 py-2"
                >
                  <span className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-bhor-success" aria-hidden />
                    <span>{item.name}</span>
                  </span>
                  <span className="shrink-0 text-bhor-caption font-bhor-semibold text-bhor-text-muted">
                    {item.quantity} {item.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "instructions",
      label: "Instructions",
      icon: ClipboardList,
      content: (
        <ol className="space-y-3">
          {product.howToUse.map((step, index) => (
            <li key={step.title} className="flex gap-3">
              <span className="font-bhor-bold text-bhor-primary">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>
                <span className="font-bhor-semibold text-bhor-text">{step.title}: </span>
                {step.description}
              </span>
            </li>
          ))}
        </ol>
      ),
    },
    {
      id: "delivery",
      label: "Delivery Info",
      icon: Truck,
      content: (
        <div className="space-y-3">
          <p>
            <span className="font-bhor-semibold text-bhor-text">Location: </span>
            {product.delivery.location}
          </p>
          <p>{product.delivery.description}</p>
          {product.preorder ? (
            <p>
              <span className="font-bhor-semibold text-bhor-text">Expected delivery: </span>
              {product.preorder.expectedDelivery}
            </p>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <section aria-labelledby="about-product-heading" className="border-t border-bhor-border">
      <div className="flex items-center justify-between gap-4 py-4">
        <h2 id="about-product-heading" className="text-bhor-product font-bhor-bold text-bhor-text">
          About this product
        </h2>
        <p className="text-bhor-caption font-bhor-medium text-bhor-text-muted">{product.sku}</p>
      </div>

      <div className="divide-y divide-bhor-border border-t border-bhor-border">
        {sections.map((section) => {
          const Icon = section.icon;
          const isOpen = openSection === section.id;

          return (
            <div key={section.id}>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`${section.id}-panel`}
                onClick={() => setOpenSection(isOpen ? "" : section.id)}
                className="flex min-h-14 w-full items-center justify-between gap-4 py-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary"
              >
                <span className="flex items-center gap-3 text-bhor-body font-bhor-semibold text-bhor-text">
                  <Icon className="h-5 w-5 text-bhor-primary" aria-hidden />
                  {section.label}
                </span>
                <ChevronDown
                  className={`h-5 w-5 text-bhor-text-muted transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                  aria-hidden
                />
              </button>
              {isOpen ? (
                <div
                  id={`${section.id}-panel`}
                  className="pb-5 text-bhor-small leading-bhor-body text-bhor-text-muted"
                >
                  {section.content}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
