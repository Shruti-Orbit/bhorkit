import type { Metadata } from "next";
import { AdminShell } from "@/src/components/admin/AdminShell";

export const metadata: Metadata = {
  title: "Admin · BHORKIT",
  // The admin section must never be indexed, and search engines shouldn't
  // follow links out of it either.
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
