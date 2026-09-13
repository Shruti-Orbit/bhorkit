import Link from "next/link";
import { Gift, HelpCircle, MapPin } from "lucide-react";
import { getOrderingStatus, isRangeOpen, type OrderingStatus } from "@/src/lib/api/ordering.api";
import { SocialLinks } from "./SocialLinks";

/**
 * Asked on the server, before the strip is sent.
 *
 * The line used to read "Ganesh Chaturthi Pre-Orders Now Open" whatever the
 * admin had configured. Fetching the status in the browser fixed that only
 * after the page had loaded, so every visitor first saw the open wording —
 * for a second or more on a slow phone — while orders were closed. Rendering
 * it here means the first thing anyone sees is already true.
 *
 * A failed request must not take the page down, so it falls back to the open
 * wording; the server refuses a closed order either way.
 */
async function loadOrderingStatus(): Promise<OrderingStatus | null> {
  try {
    return await getOrderingStatus();
  } catch {
    return null;
  }
}

function promoLine(status: OrderingStatus | null) {
  if (status && !status.acceptingOrders) return "We’re not accepting orders right now";
  if (!isRangeOpen(status, "ganesh-chaturthi")) return "Ganesh Chaturthi orders are now closed";
  return "Ganesh Chaturthi Pre-Orders Now Open";
}

export async function TopBar() {
  const status = await loadOrderingStatus();

  return (
    <div className="bg-bhor-header text-white">
      <div className="mx-auto flex h-9 max-w-[1512px] items-center justify-center gap-4 px-4 text-bhor-caption font-bhor-bold sm:px-6 lg:h-[42px] lg:justify-between lg:px-8">
        <p className="flex min-w-0 items-center gap-2">
          <Gift className="h-4 w-4 shrink-0 text-bhor-gold-light" aria-hidden />
          <span className="truncate">{promoLine(status)}</span>
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
          <SocialLinks iconClassName="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}
