"use client";

import Link from "next/link";
import { useState } from "react";
import { checkFitment } from "@/lib/fitment";
import { formatBaht, formatPositions, unitLabel } from "@/lib/format";
import type { CartLine } from "@/lib/demo-orders";
import { btn } from "@/lib/ui";
import { describeVehicle, type VehicleCatalog } from "@/lib/vehicle";
import { useSelectedVehicle } from "@/lib/vehicle-store";
import { StockBadge, TypeBadge } from "./badges";
import { LineThumb, OrderSummary } from "./checkout-ui";
import { FitmentBadge, fitmentState } from "./fitment-badge";

export function CartView({ initial, catalog }: { initial: CartLine[]; catalog: VehicleCatalog }) {
  const [lines, setLines] = useState(initial);
  const vehicle = useSelectedVehicle();

  const setQty = (slug: string, qty: number) =>
    setLines((ls) => ls.map((l) => (l.product.slug === slug ? { ...l, qty: Math.max(1, Math.min(99, qty)) } : l)));
  const remove = (slug: string) => setLines((ls) => ls.filter((l) => l.product.slug !== slug));

  if (lines.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-line px-4 py-12 text-center">
        <p aria-hidden className="text-4xl">🛒</p>
        <p className="mt-2 text-lg font-semibold">ตะกร้าของคุณยังว่างอยู่</p>
        <p className="mt-1 text-sm text-muted">เลือกรถของคุณก่อน แล้วระบบจะแสดงอะไหล่ที่มีข้อมูลยืนยันว่าใช้ได้</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Link href="/#vehicle" className={btn("primary")}>เลือกรถ</Link>
          <button type="button" onClick={() => setLines(initial)} className={btn("outline")}>คืนค่าตะกร้าตัวอย่าง</button>
        </div>
      </div>
    );
  }

  const checks = lines.map((l) => checkFitment(l.product, vehicle));
  const needsCheck = checks.filter((c) => fitmentState(c) !== "fits").length;
  const hasPreorder = lines.some((l) => l.product.stock === "preorder");

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="grid gap-3">
        {vehicle ? (
          <p className="text-sm text-ink-soft">
            ตรวจความเข้ากันได้กับ: <strong className="text-ink">{describeVehicle(vehicle, catalog)}</strong>{" "}
            <Link href="/#vehicle" className="text-brand hover:underline">เปลี่ยน</Link>
          </p>
        ) : (
          <p className="rounded-md border border-line bg-surface p-3 text-sm">
            ยังไม่ได้เลือกรถ — <Link href="/#vehicle" className="font-semibold text-brand hover:underline">เลือกรถ</Link> เพื่อตรวจว่าสินค้าในตะกร้าใช้กับรถของคุณได้
          </p>
        )}

        {needsCheck > 0 && (
          <div role="alert" className="rounded-md border border-warn/40 bg-warn-soft p-3 text-sm text-warn">
            <strong>⚠ มีสินค้า {needsCheck} รายการที่ยังยืนยันไม่ได้ว่าใช้กับรถของคุณ</strong>
            <p className="mt-0.5">แนะนำให้สอบถามร้านก่อนชำระเงิน เพื่อหลีกเลี่ยงการสั่งผิดรุ่น</p>
            <Link href="/fitment-inquiry" className="mt-1 inline-block font-semibold underline">สอบถามร้าน →</Link>
          </div>
        )}

        <ul className="grid gap-3">
          {lines.map((l, i) => {
            const p = l.product;
            const pos = formatPositions(p.position);
            return (
              <li key={p.slug} className="rounded-lg border border-line bg-white p-3 sm:p-4">
                <div className="flex gap-3">
                  <LineThumb slug={p.categorySlug} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap gap-1.5">
                      <TypeBadge type={p.type} />
                      <StockBadge stock={p.stock} preorderDays={p.preorderDays} />
                    </div>
                    <Link href={`/product/${p.slug}`} className="mt-1 block font-semibold leading-snug hover:text-brand">{p.name}</Link>
                    <p className="text-xs text-muted">
                      รหัส <span className="code">{p.sku}</span>
                      {pos && <> · ตำแหน่ง {pos}</>}
                    </p>
                    <p className="mt-0.5 text-sm">
                      {formatBaht(p.price)} <span className="text-muted">/ {unitLabel[p.unit]}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-3">
                  {vehicle && <FitmentBadge check={checks[i]} />}
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
                  <div className="flex items-center" role="group" aria-label={`จำนวน ${p.name}`}>
                    <button type="button" onClick={() => setQty(p.slug, l.qty - 1)} disabled={l.qty <= 1}
                      className="grid size-10 place-items-center rounded-l-md border border-line text-lg disabled:text-line" aria-label="ลดจำนวน">−</button>
                    <input type="number" inputMode="numeric" min={1} max={99} value={l.qty}
                      onChange={(e) => setQty(p.slug, Number(e.target.value) || 1)}
                      className="h-10 w-14 border-y border-line text-center [appearance:textfield]" aria-label="จำนวน" />
                    <button type="button" onClick={() => setQty(p.slug, l.qty + 1)}
                      className="grid size-10 place-items-center rounded-r-md border border-line text-lg" aria-label="เพิ่มจำนวน">+</button>
                    <span className="ml-2 text-sm text-muted">{unitLabel[p.unit]}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold">{formatBaht(p.price * l.qty)}</span>
                    <button type="button" onClick={() => remove(p.slug)} className={btn("ghost", "sm", "text-bad hover:bg-bad-soft")}>
                      ลบ
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {hasPreorder && (
          <p className="rounded-md border border-line bg-surface p-3 text-sm text-ink-soft">
            <strong>ℹ มีสินค้าพรีออร์เดอร์ในตะกร้า</strong> — ร้านจะจัดส่งเมื่อสินค้าครบทุกรายการ (นโยบายตัวอย่าง รอร้านยืนยัน)
          </p>
        )}
      </div>

      <OrderSummary lines={lines}>
        <Link href="/checkout" className={btn("primary", "lg")}>ดำเนินการสั่งซื้อ</Link>
        <Link href="/" className={btn("ghost")}>เลือกซื้อสินค้าต่อ</Link>
      </OrderSummary>
    </div>
  );
}
