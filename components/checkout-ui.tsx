import Link from "next/link";
import { categories } from "@/lib/catalog-data";
import { cartSubtotal, type CartLine } from "@/lib/demo-orders";
import { formatBaht, unitLabel } from "@/lib/format";
import { CategoryIcon } from "./category-icon";

const STEPS = ["ตะกร้า", "ข้อมูลจัดส่ง", "ชำระเงิน", "เสร็จสิ้น"];

/** แถบขั้นตอนการสั่งซื้อ — มีเลขลำดับ + ข้อความ + สถานะสำหรับโปรแกรมอ่านหน้าจอ */
export function CheckoutSteps({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-1 text-xs sm:gap-2 sm:text-sm" aria-label="ขั้นตอนการสั่งซื้อ">
      {STEPS.map((s, i) => {
        const state = i < current ? "done" : i === current ? "current" : "todo";
        return (
          <li key={s} className="flex min-w-0 flex-1 items-center gap-1.5" aria-current={state === "current" ? "step" : undefined}>
            <span
              className={`grid size-6 shrink-0 place-items-center rounded-full text-xs font-bold ${
                state === "done" ? "bg-ok text-white" : state === "current" ? "bg-brand text-white" : "border border-line text-muted"
              }`}
            >
              {state === "done" ? "✓" : i + 1}
            </span>
            <span className={`truncate ${state === "current" ? "font-semibold text-ink" : "text-muted"}`}>
              {s}
              <span className="sr-only">{state === "done" ? " (เสร็จแล้ว)" : state === "current" ? " (ขั้นตอนปัจจุบัน)" : ""}</span>
            </span>
            {i < STEPS.length - 1 && <span aria-hidden className="hidden h-px flex-1 bg-line sm:block" />}
          </li>
        );
      })}
    </ol>
  );
}

export function DemoNotice({ children }: { children?: React.ReactNode }) {
  return (
    <p className="rounded-md border border-warn/30 bg-warn-soft px-3 py-2 text-sm text-warn">
      <strong>แบบร่าง Demo</strong> — {children ?? "ข้อมูลในหน้านี้เป็นข้อมูลตัวอย่าง ยังไม่มีการสั่งซื้อหรือชำระเงินจริง"}
    </p>
  );
}

export function LineThumb({ slug }: { slug: string }) {
  const cat = categories.find((c) => c.slug === slug);
  return (
    <span className="grid size-16 shrink-0 place-items-center rounded-md bg-surface text-brand/70">
      {cat && <CategoryIcon icon={cat.icon} className="size-8" />}
    </span>
  );
}

/** สรุปคำสั่งซื้อ (ด้านขวาบนจอใหญ่ / ด้านล่างบนมือถือ) */
export function OrderSummary({
  lines,
  shippingFee,
  compact,
  children,
}: {
  lines: CartLine[];
  shippingFee?: number;
  compact?: boolean;
  children?: React.ReactNode;
}) {
  const subtotal = cartSubtotal(lines);
  return (
    <section aria-labelledby="summary-h" className="h-fit rounded-lg border border-line bg-white p-4 lg:sticky lg:top-44">
      <h2 id="summary-h" className="font-bold">สรุปคำสั่งซื้อ</h2>
      {compact && (
        <ul className="mt-3 grid gap-2 text-sm">
          {lines.map((l) => (
            <li key={l.product.slug} className="flex justify-between gap-3">
              <span className="min-w-0 text-ink-soft">
                <span className="line-clamp-1">{l.product.name}</span>
                <span className="text-xs text-muted">× {l.qty} {unitLabel[l.product.unit]}</span>
              </span>
              <span className="shrink-0">{formatBaht(l.product.price * l.qty)}</span>
            </li>
          ))}
        </ul>
      )}
      <dl className="mt-3 grid gap-1.5 border-t border-line pt-3 text-sm">
        <div className="flex justify-between"><dt className="text-ink-soft">ค่าสินค้า</dt><dd>{formatBaht(subtotal)}</dd></div>
        <div className="flex justify-between">
          <dt className="text-ink-soft">ค่าจัดส่ง</dt>
          <dd>{shippingFee == null ? <span className="text-muted">คำนวณในขั้นตอนถัดไป</span> : shippingFee === 0 ? "ฟรี" : formatBaht(shippingFee)}</dd>
        </div>
        <div className="mt-1 flex items-baseline justify-between border-t border-line pt-2">
          <dt className="font-semibold">ยอดรวม</dt>
          <dd className="text-xl font-bold">{formatBaht(subtotal + (shippingFee ?? 0))}</dd>
        </div>
        <p className="text-xs text-muted">ราคารวมภาษีมูลค่าเพิ่มแล้ว (รอยืนยันกับร้าน)</p>
      </dl>
      {children && <div className="mt-4 grid gap-2">{children}</div>}
    </section>
  );
}

export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link href={href} className="text-sm text-brand hover:underline">← {children}</Link>;
}
