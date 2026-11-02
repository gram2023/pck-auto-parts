import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckoutSteps, DemoNotice, OrderSummary } from "@/components/checkout-ui";
import { demoCart, demoOrders, getDemoOrder, orderStatusLabel, shippingOptions, type OrderStatus } from "@/lib/demo-orders";
import { btn } from "@/lib/ui";

export function generateStaticParams() {
  return demoOrders.map((o) => ({ no: o.no }));
}

export async function generateMetadata(props: PageProps<"/order/[no]">): Promise<Metadata> {
  return { title: `คำสั่งซื้อ ${(await props.params).no}`, robots: { index: false } };
}

const FLOW: Record<"online" | "transfer", OrderStatus[]> = {
  online: ["awaiting_payment", "paid", "preparing", "shipped", "completed"],
  transfer: ["awaiting_payment", "slip_review", "paid", "preparing", "shipped", "completed"],
};

export default async function OrderPage(props: PageProps<"/order/[no]">) {
  const { no } = await props.params;
  const order = getDemoOrder(no);
  if (!order) notFound();

  const ship = shippingOptions.find((s) => s.id === order.shippingId)!;
  const rejected = order.status === "slip_rejected";
  // สลิปไม่ผ่าน = ย้อนกลับไปขั้น "รอตรวจสอบสลิป" และแสดงเป็นขั้นที่มีปัญหา
  const flow = FLOW[order.method];
  const currentIdx = flow.indexOf(rejected ? "slip_review" : order.status);
  const at = (s: OrderStatus) => order.history.find((h) => h.status === s)?.at;

  return (
    <div className="mx-auto grid max-w-6xl gap-4 px-4 py-6">
      <CheckoutSteps current={3} />
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-2xl font-bold">คำสั่งซื้อ <span className="code">{order.no}</span></h1>
        <p className="text-sm text-muted">สั่งเมื่อ {order.placedAt}</p>
      </div>
      <DemoNotice>คำสั่งซื้อตัวอย่าง — ดูสถานะอื่นได้ที่{" "}
        {demoOrders.filter((o) => o.no !== order.no).map((o, i) => (
          <span key={o.no}>{i > 0 && " · "}<Link href={`/order/${o.no}`} className="underline">{o.no}</Link></span>
        ))}
      </DemoNotice>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="grid gap-4">
          <p className="text-lg">
            สถานะ: <strong className={rejected ? "text-bad" : "text-brand"}>{rejected ? "✕ " : ""}{orderStatusLabel[order.status]}</strong>
          </p>

          {rejected && (
            <div role="alert" className="rounded-md border border-bad/30 bg-bad-soft p-4 text-sm">
              <p className="font-bold text-bad">✕ สลิปไม่ผ่านการตรวจสอบ</p>
              <p className="mt-1 text-ink-soft">เหตุผลจากร้าน: {order.rejectReason}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href="/checkout/payment/transfer" className={btn("primary")}>แนบสลิปใหม่</Link>
                <Link href="/contact" className={btn("outline")}>ติดต่อร้าน</Link>
              </div>
            </div>
          )}

          <ol className="grid gap-0 rounded-lg border border-line p-4" aria-label="ความคืบหน้าคำสั่งซื้อ">
            {flow.map((s, i) => {
              const state = rejected && i === currentIdx ? "problem" : i < currentIdx || (i === currentIdx && s === "completed") ? "done" : i === currentIdx ? "current" : "todo";
              const dot = {
                done: "bg-ok text-white",
                current: "bg-brand text-white ring-4 ring-brand-soft",
                problem: "bg-bad text-white",
                todo: "border border-line bg-white text-muted",
              }[state];
              const icon = { done: "✓", current: "●", problem: "✕", todo: String(i + 1) }[state];
              const tag = { done: "เสร็จแล้ว", current: "ขั้นตอนปัจจุบัน", problem: "มีปัญหา", todo: "ยังไม่ถึง" }[state];
              return (
                <li key={s} className="relative flex gap-3 pb-5 last:pb-0" aria-current={state === "current" ? "step" : undefined}>
                  {i < flow.length - 1 && <span aria-hidden className={`absolute left-[13px] top-7 h-[calc(100%-1.5rem)] w-0.5 ${i < currentIdx ? "bg-ok" : "bg-line"}`} />}
                  <span aria-hidden className={`relative grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold ${dot}`}>{icon}</span>
                  <div>
                    <p className={state === "todo" ? "text-muted" : "font-semibold"}>
                      {orderStatusLabel[s]} <span className="text-xs font-normal text-muted">· {tag}</span>
                    </p>
                    {at(s) && <p className="text-xs text-muted">{at(s)}</p>}
                    {s === "shipped" && order.trackingNo && i <= currentIdx && (
                      <p className="text-sm">เลขพัสดุ <span className="code">{order.trackingNo}</span></p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>

          <dl className="grid gap-1 rounded-lg border border-line p-4 text-sm">
            <div className="flex gap-2"><dt className="w-28 text-muted">วิธีชำระ</dt><dd>{order.method === "online" ? "ชำระเงินออนไลน์" : "โอนเงินแล้วแนบสลิป"}</dd></div>
            <div className="flex gap-2"><dt className="w-28 text-muted">การจัดส่ง</dt><dd>{ship.name} · {ship.eta}</dd></div>
          </dl>
        </div>
        <OrderSummary lines={demoCart} shippingFee={ship.fee} compact />
      </div>
    </div>
  );
}
