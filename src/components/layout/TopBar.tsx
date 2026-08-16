import Link from "next/link";
import { Camera, Gift, HelpCircle, MapPin, MessageCircle } from "lucide-react";

export function TopBar() {
  return (
    <div className="bg-bhor-header text-white">
      <div className="mx-auto flex h-9 max-w-[1512px] items-center justify-center gap-4 px-4 text-bhor-caption font-bhor-bold sm:px-6 lg:h-[42px] lg:justify-between lg:px-8">
        <p className="flex min-w-0 items-center gap-2">
          <Gift className="h-4 w-4 shrink-0 text-bhor-gold-light" aria-hidden />
          <span className="truncate">Ganesh Chaturthi Pre-Orders Now Open</span>
        </p>

        <p className="hidden items-center gap-2 lg:flex">
          <MapPin className="h-4 w-4 text-bhor-gold-light" aria-hidden />
          <span>Delivering Across Patna</span>
        </p>

        <div className="hidden items-center gap-3.5 lg:flex">
          <Link className="transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" href="/track-order">
            Track Order
          </Link>
          <span className="h-3 w-px bg-white/40" aria-hidden />
          <Link className="inline-flex items-center gap-1.5 transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" href="/support">
            <HelpCircle className="h-3.5 w-3.5" aria-hidden />
            Help & Support
          </Link>
          <span className="h-3 w-px bg-white/40" aria-hidden />
          <Link aria-label="Instagram" className="transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" href="https://www.instagram.com/">
            <Camera className="h-4 w-4" aria-hidden />
          </Link>
          <Link aria-label="Facebook" className="transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" href="https://www.facebook.com/">
            <MessageCircle className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}
