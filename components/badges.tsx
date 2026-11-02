import { stockLabel, typeLabel } from "@/lib/format";
import type { ProductType, StockStatus } from "@/lib/types";

const pill = "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap";

export function StockBadge({ stock, preorderDays }: { stock: StockStatus; preorderDays?: number }) {
  const cls = {
    in_stock: "bg-ok-soft text-ok",
    preorder: "bg-warn-soft text-warn",
    out_of_stock: "bg-surface text-muted",
  }[stock];
  return (
    <span className={`${pill} ${cls}`}>
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {stockLabel[stock]}
      {stock === "preorder" && preorderDays ? ` · ~${preorderDays} วัน` : ""}
    </span>
  );
}

export function TypeBadge({ type }: { type: ProductType }) {
  const cls = {
    genuine: "bg-brand text-white",
    aftermarket: "bg-brand-soft text-brand",
    used: "bg-warn-soft text-warn ring-1 ring-warn/30",
  }[type];
  return <span className={`${pill} ${cls}`}>{typeLabel[type]}</span>;
}
