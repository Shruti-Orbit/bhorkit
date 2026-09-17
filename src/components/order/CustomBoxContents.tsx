import type { OrderItem } from "@/src/lib/api/order.api";
import { formatPaise } from "@/src/utils/money";

type CustomBoxContentsProps = {
  item: OrderItem;
  /** Admin only. Customers are never sent these prices in the first place. */
  showPrices?: boolean;
};

/** What is inside a custom puja box, under its order line. Renders nothing for other lines. */
export function CustomBoxContents({ item, showPrices = false }: CustomBoxContentsProps) {
  const custom = item.customization;
  if (!custom || custom.lines.length === 0) return null;

  return (
    <div className="mt-2 rounded-bhor-sm border border-bhor-border bg-bhor-cream px-3 py-2.5">
      {custom.occasion ? (
        <p className="text-bhor-caption font-bhor-semibold text-bhor-primary">For {custom.occasion}</p>
      ) : null}
      <p className="text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-text-muted">
        {custom.lines.length} items in this box
      </p>
      <ul className={`mt-1.5 grid gap-x-6 gap-y-1 ${showPrices ? "" : "sm:grid-cols-2"}`}>
        {custom.lines.map((line) => (
          <li key={line.ingredientId} className="flex min-w-0 justify-between gap-3 text-bhor-caption text-bhor-text">
            <span className="min-w-0">
              {line.name}{" "}
              <span className="text-bhor-text-muted">
                ({line.pack}) × {line.quantity}
              </span>
            </span>
            {showPrices && typeof line.unitPrice === "number" && typeof line.lineTotal === "number" ? (
              <span className="shrink-0 text-bhor-text-muted">
                {formatPaise(line.unitPrice)} × {line.quantity} ={" "}
                <span className="font-bhor-semibold text-bhor-text">{formatPaise(line.lineTotal)}</span>
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
