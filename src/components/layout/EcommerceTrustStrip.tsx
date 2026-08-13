import { Headphones, ShieldCheck, Truck } from "lucide-react";

const trustItems = [
  {
    icon: Truck,
    title: "Patna Doorstep Delivery",
    text: "Fresh devotional kits delivered across Patna",
  },
  {
    icon: ShieldCheck,
    title: "100% Safe & Secure Payments",
    text: "Pay using secure checkout methods",
  },
  {
    icon: Headphones,
    title: "Dedicated Help Center",
    text: "Support for orders, delivery and pre-orders",
  },
];

export function EcommerceTrustStrip() {
  return (
    <section className="border-y border-bhor-border bg-bhor-surface px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-[1512px] gap-6 md:grid-cols-3">
        {trustItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className={`flex items-center gap-4 md:justify-center ${
                index > 0 ? "md:border-l md:border-bhor-border" : ""
              }`}
            >
              <Icon className="h-9 w-9 shrink-0 text-bhor-text-muted" aria-hidden />
              <div>
                <h2 className="text-bhor-product-mobile font-bhor-semibold text-bhor-text md:text-bhor-product">
                  {item.title}
                </h2>
                <p className="mt-1 text-bhor-small text-bhor-text-muted">{item.text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
