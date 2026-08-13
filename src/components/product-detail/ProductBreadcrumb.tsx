import Link from "next/link";
import type { CollectionProduct } from "@/src/data/products";

type ProductBreadcrumbProps = {
  product: CollectionProduct;
};

export function ProductBreadcrumb({ product }: ProductBreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mx-auto max-w-[1512px] px-4 pb-3 pt-5 text-bhor-caption font-bhor-medium text-bhor-text-muted sm:px-6 lg:px-8"
    >
      <ol className="flex min-w-0 items-center gap-2">
        <li>
          <Link className="hover:text-bhor-primary" href="/">
            Home
          </Link>
        </li>
        <li aria-hidden>/</li>
        <li>
          <Link className="hover:text-bhor-primary" href="/shop">
            Products
          </Link>
        </li>
        <li aria-hidden>/</li>
        <li className="truncate text-bhor-text" aria-current="page">
          {product.name}
        </li>
      </ol>
    </nav>
  );
}
