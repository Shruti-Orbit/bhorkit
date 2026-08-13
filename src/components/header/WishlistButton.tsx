import Link from "next/link";
import { Heart } from "lucide-react";

export function WishlistButton() {
  return (
    <Link
      href="/wishlist"
      aria-label="Wishlist"
      className="flex h-11 w-11 items-center justify-center text-bhor-text transition-colors hover:text-bhor-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary"
    >
      <Heart className="h-6 w-6" aria-hidden />
    </Link>
  );
}
