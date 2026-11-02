import type { Metadata } from "next";
import { CartView } from "@/components/cart-view";
import { CheckoutSteps, DemoNotice } from "@/components/checkout-ui";
import { getVehicleCatalog } from "@/lib/catalog";
import { demoCart } from "@/lib/demo-orders";

export const metadata: Metadata = { title: "ตะกร้าสินค้า", robots: { index: false } };

export default async function CartPage() {
  const catalog = await getVehicleCatalog();
  return (
    <div className="mx-auto grid max-w-6xl gap-4 px-4 py-6">
      <CheckoutSteps current={0} />
      <h1 className="text-2xl font-bold">ตะกร้าสินค้า</h1>
      <DemoNotice>ตะกร้าแสดงสินค้าตัวอย่าง 4 รายการ ปรับจำนวนหรือลบเพื่อดูการทำงานได้ ยังไม่บันทึกจริง</DemoNotice>
      <CartView initial={demoCart} catalog={catalog} />
    </div>
  );
}
