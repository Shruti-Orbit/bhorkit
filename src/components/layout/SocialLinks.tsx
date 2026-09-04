import Link from "next/link";
import type { SVGProps } from "react";
import { seoConfig } from "@/src/lib/seo/config";

export const WHATSAPP_HREF = "https://wa.me/919296914463";

type SocialLinksProps = {
  className?: string;
  iconClassName?: string;
  showLabels?: boolean;
};

const socialItems = [
  {
    label: "Instagram",
    href: seoConfig.socialLinks.instagram,
    icon: InstagramIcon,
  },
  {
    label: "Facebook",
    href: seoConfig.socialLinks.facebook,
    icon: FacebookIcon,
  },
  {
    label: "YouTube",
    href: seoConfig.socialLinks.youtube,
    icon: YouTubeIcon,
  },
];

export function SocialLinks({
  className = "",
  iconClassName = "h-4 w-4",
  showLabels = false,
}: SocialLinksProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`} aria-label="BHORKIT social media">
      {socialItems.map(({ href, icon: Icon, label }) => (
        <Link
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="inline-flex items-center gap-2 transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
        >
          <Icon className={iconClassName} aria-hidden />
          {showLabels ? <span>{label}</span> : null}
        </Link>
      ))}
      <Link
        href={WHATSAPP_HREF}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
        title="WhatsApp"
        className="inline-flex items-center gap-2 transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
      >
        <WhatsAppIcon className={iconClassName} aria-hidden />
        {showLabels ? <span>WhatsApp</span> : null}
      </Link>
    </div>
  );
}

function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="4" y="4" width="16" height="16" rx="5" />
      <circle cx="12" cy="12" r="3.5" />
      <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M14.1 8.7V6.9c0-.7.5-1.2 1.3-1.2H17V3h-2.4c-2.7 0-4.3 1.6-4.3 4.2v1.5H8v3h2.3V21h3.8v-9.3h2.5l.5-3h-3Z" />
    </svg>
  );
}

function YouTubeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M21.6 7.2a3 3 0 0 0-2.1-2.1C17.7 4.6 12 4.6 12 4.6s-5.7 0-7.5.5a3 3 0 0 0-2.1 2.1A31.2 31.2 0 0 0 2 12a31.2 31.2 0 0 0 .4 4.8 3 3 0 0 0 2.1 2.1c1.8.5 7.5.5 7.5.5s5.7 0 7.5-.5a3 3 0 0 0 2.1-2.1A31.2 31.2 0 0 0 22 12a31.2 31.2 0 0 0-.4-4.8ZM10 15.5v-7l6 3.5-6 3.5Z" />
    </svg>
  );
}

export function WhatsAppIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2.5a9.3 9.3 0 0 0-8 14.1L3 21.5l5-1.3A9.3 9.3 0 1 0 12 2.5Zm0 16.8a7.5 7.5 0 0 1-3.8-1l-.3-.2-3 .8.8-2.9-.2-.3A7.5 7.5 0 1 1 12 19.3Zm4.2-5.6c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.6.1-.6.8-.7.9-.3.2-.5.1a6.2 6.2 0 0 1-3.1-2.7c-.2-.3 0-.4.1-.5l.4-.5c.1-.2.2-.3.3-.5.1-.1 0-.3 0-.5l-.7-1.6c-.2-.4-.4-.3-.6-.3h-.5c-.2 0-.5.1-.7.3-.2.3-1 1-1 2.3s1 2.7 1.1 2.9c.1.2 2 3.1 4.8 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1 0-.2-.2-.3-.4-.4Z" />
    </svg>
  );
}
