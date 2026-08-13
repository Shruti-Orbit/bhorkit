import { Gift, PackageOpen, Truck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type PromotionIconName = "PackageOpen" | "Gift" | "Truck";

const iconMap: Record<PromotionIconName, LucideIcon> = {
  PackageOpen,
  Gift,
  Truck,
};

type PreOrderFeatureProps = {
  icon: PromotionIconName;
  title: string;
  description: string;
};

export function PreOrderFeature({
  icon,
  title,
  description,
}: PreOrderFeatureProps) {
  const Icon = iconMap[icon];

  return (
    <div className="group flex items-center gap-3 transition-transform duration-300 hover:-translate-y-0.5 lg:flex-col lg:items-center lg:text-center">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-bhor-primary-dark text-bhor-gold-light lg:h-14 lg:w-14">
        <Icon className="h-5 w-5 lg:h-6 lg:w-6" aria-hidden />
      </span>
      <p className="text-bhor-body-mobile font-bhor-semibold leading-bhor-heading text-white md:text-bhor-body">
        <span className="block">{title}</span>
        <span className="block font-bhor-medium text-white/75">{description}</span>
      </p>
    </div>
  );
}
