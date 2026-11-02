import Link from "next/link";
import { categories } from "@/lib/catalog-data";
import { getPartBrand, type ProductHit } from "@/lib/catalog";
import { checkFitment } from "@/lib/fitment";
import { formatBaht, formatPositions, unitLabel } from "@/lib/format";
import type { VehicleSelection } from "@/lib/types";
import { StockBadge, TypeBadge } from "./badges";
import { CategoryIcon } from "./category-icon";
import { FitmentBadge } from "./fitment-badge";

const matchLabel = { sku: "รหัสสินค้า", part_number: "หมายเลขอะไหล่", oem: "หมายเลข OEM" } as const;

export function ProductCard({ hit, vehicle }: { hit: ProductHit; vehicle?: VehicleSelection | null }) {
  const p = hit.product;
  const cat = categories.find((c) => c.slug === p.categorySlug);
  const brand = getPartBrand(p.partBrandId);
  const positions = formatPositions(p.position);

  return (
    <article className="group relative flex flex-col rounded-lg border border-line bg-white transition hover:border-brand/40 hover:shadow-md">
      {hit.match && (
        <p className="rounded-t-lg bg-brand px-3 py-1 text-xs font-semibold text-white">
          ตรงกับ{matchLabel[hit.match.kind]} <span className="code">{hit.match.value}</span>
        </p>
      )}
      <div className="grid aspect-[4/3] place-items-center bg-surface text-brand/70">
        {cat && <CategoryIcon icon={cat.icon} className="size-14" />}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex flex-wrap gap-1.5">
          <TypeBadge type={p.type} />
          <StockBadge stock={p.stock} preorderDays={p.preorderDays} />
        </div>
        <h3 className="font-semibold leading-snug text-ink">
          <Link href={`/product/${p.slug}`} className="after:absolute after:inset-0 group-hover:text-brand">
            {p.name}
          </Link>
        </h3>
        <dl className="grid gap-0.5 text-xs text-muted">
          <div className="flex gap-1"><dt>แบรนด์:</dt><dd className="text-ink-soft">{brand?.name}</dd></div>
          <div className="flex gap-1"><dt>เลขอะไหล่:</dt><dd className="code text-ink-soft">{p.partNumber}</dd></div>
          {positions && <div className="flex gap-1"><dt>ตำแหน่ง:</dt><dd className="text-ink-soft">{positions}</dd></div>}
        </dl>
        {vehicle && <FitmentBadge check={checkFitment(p, vehicle)} />}
        <p className="mt-auto pt-1 text-lg font-bold text-ink">
          {formatBaht(p.price)}
          <span className="text-sm font-normal text-muted"> / {unitLabel[p.unit]}</span>
        </p>
      </div>
    </article>
  );
}
