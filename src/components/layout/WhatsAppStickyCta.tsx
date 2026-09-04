import Link from "next/link";
import { WHATSAPP_HREF, WhatsAppIcon } from "./SocialLinks";

export function WhatsAppStickyCta() {
  return (
    <Link
      href={WHATSAPP_HREF}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp"
      title="WhatsApp"
      className="fixed bottom-5 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-bhor-soft ring-1 ring-white/40 transition-transform hover:-translate-y-0.5 sm:bottom-6 sm:right-6 sm:h-14 sm:w-14"
    >
      <WhatsAppIcon className="h-7 w-7 sm:h-8 sm:w-8" aria-hidden />
    </Link>
  );
}
