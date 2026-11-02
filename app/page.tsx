import Link from "next/link";
import { CategoryIcon } from "@/components/category-icon";
import { ProductCard } from "@/components/product-card";
import { VehicleSelector } from "@/components/vehicle-selector";
import { getCategories, getFeaturedProducts, getVehicleCatalog } from "@/lib/catalog";

export default async function Home() {
  const [cats, featured, catalog] = await Promise.all([
    getCategories(),
    getFeaturedProducts(),
    getVehicleCatalog(),
  ]);

  return (
    <>
      {/* เส้นทางที่ 2: เลือกรถ */}
      <section id="vehicle" className="scroll-mt-40 bg-gradient-to-b from-brand-strong to-brand pb-10 pt-8 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <h1 className="text-2xl font-bold leading-tight sm:text-3xl">หาอะไหล่ที่ใช้ได้กับรถของคุณ</h1>
          <p className="mt-1 text-white/80">เลือกยี่ห้อ รุ่น ปี และเครื่องยนต์ ระบบจะแสดงเฉพาะอะไหล่ที่มีข้อมูลยืนยันว่าใช้กับรถคันนี้ได้</p>
          <div className="mt-5 rounded-lg bg-white p-4 text-ink shadow-lg sm:p-5">
            <VehicleSelector catalog={catalog} layout="row" />
          </div>
          <p className="mt-3 text-sm text-white/80">
            รู้หมายเลขอะไหล่อยู่แล้ว? พิมพ์ในช่องค้นหาด้านบนได้เลย — รองรับรหัสสินค้า หมายเลขอะไหล่ และหมายเลข OEM
          </p>
        </div>
      </section>

      {/* เส้นทางที่ 3: หมวดหมู่ */}
      <section className="mx-auto max-w-7xl px-4 pt-10">
        <h2 className="text-xl font-bold">เลือกตามหมวดหมู่อะไหล่</h2>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {cats.map((c) => (
            <li key={c.slug}>
              <Link href={`/category/${c.slug}`}
                className="flex h-full flex-col gap-2 rounded-lg border border-line bg-white p-4 transition hover:border-brand hover:shadow-md">
                <CategoryIcon icon={c.icon} className="size-9 text-brand" />
                <span className="font-semibold">{c.name}</span>
                <span className="text-xs leading-relaxed text-muted">{c.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-12">
        <h2 className="text-xl font-bold">สินค้าแนะนำ</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          {featured.map((p) => <ProductCard key={p.slug} hit={{ product: p }} />)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-12">
        <ul className="grid gap-3 md:grid-cols-3">
          <li className="rounded-lg bg-surface p-5">
            <p className="font-semibold text-brand">ข้อมูลความเข้ากันได้มีแหล่งอ้างอิง</p>
            <p className="mt-1 text-sm text-ink-soft">
              ทุกรายการระบุแหล่งที่มา ถ้าข้อมูลยังไม่ครบ ระบบจะแสดงว่า “กรุณาตรวจสอบกับร้านก่อนสั่งซื้อ” — ไม่เดาแทนลูกค้า
            </p>
          </li>
          <li className="rounded-lg bg-surface p-5">
            <p className="font-semibold text-brand">ไม่แน่ใจ ถามร้านก่อนได้</p>
            <p className="mt-1 text-sm text-ink-soft">ส่งรุ่นรถ ปี เครื่องยนต์ หรือรูปอะไหล่เดิม ร้านช่วยตรวจสอบให้ก่อนสั่งซื้อ</p>
          </li>
          <li className="rounded-lg bg-surface p-5">
            <p className="font-semibold text-brand">ชำระเงินได้ 2 ทาง</p>
            <p className="mt-1 text-sm text-ink-soft">ชำระออนไลน์ หรือโอนเงินแล้วแนบสลิป ซื้อได้ทั้งแบบสมาชิกและไม่สมัครสมาชิก</p>
          </li>
        </ul>
      </section>
    </>
  );
}
