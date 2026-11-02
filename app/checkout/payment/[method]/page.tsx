import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckoutSteps, DemoNotice, OrderSummary } from "@/components/checkout-ui";
import { PaymentOnline } from "@/components/payment-online";
import { PaymentTransfer } from "@/components/payment-transfer";
import { cartSubtotal, demoCart, shippingOptions } from "@/lib/demo-orders";

const METHODS = { online: "ชำระเงินออนไลน์", transfer: "โอนเงินแล้วแนบสลิป" } as const;
type Method = keyof typeof METHODS;

export function generateStaticParams() {
  return Object.keys(METHODS).map((method) => ({ method }));
}

export async function generateMetadata(props: PageProps<"/checkout/payment/[method]">): Promise<Metadata> {
  const { method } = await props.params;
  return { title: METHODS[method as Method] ?? "ชำระเงิน", robots: { index: false } };
}

export default async function PaymentPage(props: PageProps<"/checkout/payment/[method]">) {
  const { method } = await props.params;
  if (!(method in METHODS)) notFound();
  const m = method as Method;

  const fee = shippingOptions[0].fee;
  const amount = cartSubtotal(demoCart) + fee;
  const orderNo = m === "online" ? "DEMO-1001" : "DEMO-1002";

  return (
    <div className="mx-auto grid max-w-6xl gap-4 px-4 py-6">
      <CheckoutSteps current={2} />
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-2xl font-bold">{METHODS[m]}</h1>
        <p className="text-sm text-muted">คำสั่งซื้อ <span className="code text-ink">{orderNo}</span></p>
      </div>
      <DemoNotice>ไม่มีการตัดเงินจริง ใช้ปุ่มจำลองเพื่อดูแต่ละสถานะ</DemoNotice>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div>
          {m === "online" ? <PaymentOnline amount={amount} orderNo={orderNo} /> : <PaymentTransfer amount={amount} orderNo={orderNo} />}
          <p className="mt-4 text-sm">
            <Link href={m === "online" ? "/checkout/payment/transfer" : "/checkout/payment/online"} className="text-brand hover:underline">
              เปลี่ยนเป็น{m === "online" ? METHODS.transfer : METHODS.online}
            </Link>
          </p>
        </div>
        <OrderSummary lines={demoCart} shippingFee={fee} compact />
      </div>
    </div>
  );
}
