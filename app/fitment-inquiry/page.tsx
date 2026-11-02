import type { Metadata } from "next";
import { Suspense } from "react";
import { DemoNotice } from "@/components/checkout-ui";
import { InquiryForm } from "@/components/inquiry-form";
import { LoadingState } from "@/components/state-views";
import { getProduct, getVehicleCatalog } from "@/lib/catalog";

export const metadata: Metadata = { title: "สอบถามความเข้ากันได้", robots: { index: false } };

async function Form({ searchParams }: { searchParams: PageProps<"/fitment-inquiry">["searchParams"] }) {
  const sp = await searchParams;
  const slug = typeof sp.product === "string" ? sp.product : undefined;
  const q = typeof sp.q === "string" ? sp.q : undefined;
  const [product, catalog] = await Promise.all([slug ? getProduct(slug) : null, getVehicleCatalog()]);
  const name = product ? `${product.name} (${product.partNumber})` : q ? `ค้นหา “${q}” แล้วไม่พบ` : undefined;
  return <InquiryForm catalog={catalog} productName={name} />;
}

export default function FitmentInquiryPage(props: PageProps<"/fitment-inquiry">) {
  return (
    <div className="mx-auto grid max-w-2xl gap-4 px-4 py-6">
      <h1 className="text-2xl font-bold">ถามร้านก่อนซื้อ</h1>
      <p className="text-ink-soft">
        ไม่แน่ใจว่าอะไหล่ใช้กับรถของคุณได้หรือไม่? ส่งข้อมูลรถให้ร้านตรวจสอบจากแหล่งอ้างอิง — ร้านจะไม่ยืนยันถ้ายังไม่มีข้อมูล
      </p>
      <DemoNotice>แบบฟอร์มตัวอย่าง ยังไม่ส่งข้อมูลไปที่ร้านจริง</DemoNotice>
      <Suspense fallback={<LoadingState />}>
        <Form searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}
