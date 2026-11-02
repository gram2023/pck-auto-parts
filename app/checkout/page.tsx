import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout-form";
import { CheckoutSteps, DemoNotice } from "@/components/checkout-ui";
import { getVehicleCatalog } from "@/lib/catalog";

export const metadata: Metadata = { title: "ข้อมูลการสั่งซื้อ", robots: { index: false } };

export default async function CheckoutPage() {
  const catalog = await getVehicleCatalog();
  return (
    <div className="mx-auto grid max-w-6xl gap-4 px-4 py-6">
      <CheckoutSteps current={1} />
      <h1 className="text-2xl font-bold">ข้อมูลการสั่งซื้อและจัดส่ง</h1>
      <DemoNotice>ใช้ตะกร้าตัวอย่าง ค่าส่งเป็นค่าสมมติ ข้อมูลที่กรอกไม่ถูกบันทึกหรือส่งไปที่ใด</DemoNotice>
      <CheckoutForm catalog={catalog} />
    </div>
  );
}
