"use client";

import { useEffect, useState } from "react";
import { getOrderingStatus, type OrderingStatus } from "@/src/lib/api/ordering.api";

/**
 * The current order-acceptance switches, fetched once per mount.
 *
 * `null` until it arrives, and stays `null` if the request fails. Callers treat
 * that as open: this only decides what the page says, and a closed store is
 * refused by the server regardless, so a failed status request must never be
 * what stops a customer ordering.
 */
export function useOrderingStatus(): OrderingStatus | null {
  const [status, setStatus] = useState<OrderingStatus | null>(null);

  useEffect(() => {
    let active = true;
    getOrderingStatus()
      .then((result) => {
        if (active) setStatus(result);
      })
      .catch(() => {
        // Left as null — see above.
      });
    return () => {
      active = false;
    };
  }, []);

  return status;
}
