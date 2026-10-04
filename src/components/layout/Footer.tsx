import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { FooterTrending } from "@/src/components/layout/FooterTrending";
import { FooterNewsletter } from "@/src/components/layout/FooterNewsletter";
import { SocialLinks } from "@/src/components/layout/SocialLinks";
import { getShopCategories } from "@/src/lib/api/category.api";
import { getProductsByShopCategory } from "@/src/lib/api/product.api";
import type { CollectionProduct } from "@/src/data/products";

const SUPPORT_PHONE = "9296914463";

// Every href here points at a route that exists.
const staticGroups = [
  {
    title: "Help & Support",
    links: [
      { label: "Track Order", href: "/track-order" },
      { label: "FAQs", href: "/faq" },
      { label: "Shipping & Delivery", href: "/policies#shipping-delivery" },
      { label: "Returns & Refunds", href: "/policies#returns-refunds" },
      { label: "Help & Support", href: "/support" },
    ],
  },
  {
    title: "Policies",
    links: [
      { label: "Privacy Policy", href: "/policies#privacy" },
      { label: "Terms & Conditions", href: "/policies#terms" },
      { label: "Refund Policy", href: "/policies#returns-refunds" },
      { label: "Cancellation Policy", href: "/policies#cancellation" },
    ],
  },
];

/** The priority-1 category's products. The footer is navigation, so a failed fetch just leaves the column out. */
async function loadTrendingProducts(slug: string | undefined): Promise<CollectionProduct[]> {
  if (!slug) return [];
  try {
    return await getProductsByShopCategory(slug);
  } catch {
    return [];
  }
}

export async function Footer() {
  // The same visible categories, in the same order, as the header Shop menu, so
  // a hidden or newly added category changes both without a code change.
  const categories = await getShopCategories();
  const trendingProducts = await loadTrendingProducts(categories[0]?.slug);
  const footerGroups = [
    {
      title: "Shop",
      links: [
        ...categories.map((category) => ({ label: category.name, href: `/shop/${category.slug}` })),
        { label: "All Products", href: "/shop" },
      ],
    },
    ...staticGroups,
  ];

  return (
    <footer className="bg-bhor-primary text-white">
      <div className="mx-auto grid max-w-[1512px] gap-8 px-4 py-10 sm:px-6 md:grid-cols-[30%_1fr] lg:px-8">
        <div>
          <Link href="/" className="inline-flex focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bhor-gold-light">
            <Image
              src="/images/logo/bhor-kit-logo.png"
              alt="BHORKIT — Begin Your Day Divine"
              width={150}
              height={78}
              className="h-auto w-32 brightness-0 invert"
            />
          </Link>
          <p className="mt-4 max-w-xs text-bhor-small leading-bhor-body text-white/80">
            Premium devotional kits, thoughtfully curated for Indian festivals and home puja rituals.
          </p>
          <div className="mt-5 space-y-2 text-bhor-small text-white/85">
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-bhor-gold-light" aria-hidden />
              Patna, Bihar
            </p>
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-bhor-gold-light" aria-hidden />
              <a href={`tel:${SUPPORT_PHONE}`} className="transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-gold-light">
                {SUPPORT_PHONE}
              </a>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-bhor-gold-light" aria-hidden />
              bhorkit@gmail.com
            </p>
          </div>
        </div>

        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
          {footerGroups.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h2 className="text-bhor-small font-bhor-bold uppercase tracking-wide text-bhor-gold-light">
                {group.title}
              </h2>
              <ul className="mt-4 space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-bhor-small text-white/80 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-gold-light"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <FooterTrending products={trendingProducts} />
        </div>
      </div>

      <div className="border-t border-white/15 px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1512px] flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-bhor-caption text-white/70">
            © 2026 BHORKIT. All Rights Reserved.
          </p>
          <FooterNewsletter />
          <SocialLinks
            className="text-bhor-caption text-white/80 hover:text-white"
            includeWhatsApp={false}
            showLabels
          />
        </div>
      </div>
    </footer>
  );
}
