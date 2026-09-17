import type { Metadata } from "next";
import { CustomizeOrder } from "@/src/components/customize/CustomizeOrder";

export const metadata: Metadata = {
  title: "Customize Your Puja Box | BHORKIT",
  description:
    "Build your own puja box with BHORKIT — choose exactly the samagri you need for any puja and get it delivered in Patna.",
  alternates: {
    canonical: "/customize",
  },
};

/**
 * Customize Order: one builder, for any puja. Everything interactive lives in
 * the client component; the items and the box total come from the API.
 */
export default function CustomizeOrderPage() {
  return <CustomizeOrder />;
}
