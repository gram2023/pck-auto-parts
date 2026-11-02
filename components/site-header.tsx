import Form from "next/form";
import Link from "next/link";
import { getCategories, getVehicleCatalog } from "@/lib/catalog";
import { VehicleChip } from "./vehicle-chip";

export const STORE_NAME = "shoppingอะไหล่ออนไลน์";

export async function SiteHeader() {
  const [cats, catalog] = await Promise.all([getCategories(), getVehicleCatalog()]);
  return (
    <header className="sticky top-0 z-30 bg-white shadow-sm">
      <p className="bg-warn-soft px-4 py-1 text-center text-xs text-warn">
        เว็บไซต์อยู่ระหว่างพัฒนา — สินค้า ราคา และข้อมูลความเข้ากันได้ทั้งหมดเป็นข้อมูลตัวอย่าง
      </p>
      <div className="bg-brand text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <span aria-hidden className="grid size-8 place-items-center rounded-md bg-accent text-base">⚙</span>
            {STORE_NAME}
          </Link>
          <Form action="/search" role="search" className="order-last flex w-full md:order-none md:flex-1">
            <label htmlFor="site-q" className="sr-only">ค้นหาอะไหล่</label>
            <input id="site-q" name="q" type="search" autoComplete="off"
              placeholder="ชื่ออะไหล่ รหัสสินค้า หมายเลขอะไหล่ หรือ OEM"
              className="h-11 min-w-0 flex-1 rounded-l-md border-0 bg-white px-4 text-[15px] text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent" />
            <button type="submit" className="h-11 rounded-r-md bg-accent px-5 font-semibold hover:bg-accent-strong">
              ค้นหา
            </button>
          </Form>
          <nav aria-label="บัญชี" className="ml-auto flex items-center gap-4 text-sm md:ml-0">
            <Link href="/contact" className="hover:underline">ติดต่อร้าน</Link>
          </nav>
        </div>
        <nav aria-label="หมวดหมู่" className="border-t border-white/10">
          <ul className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-2 py-1 text-sm [scrollbar-width:none]">
            {cats.map((c) => (
              <li key={c.slug}>
                <Link href={`/category/${c.slug}`} className="block whitespace-nowrap rounded px-3 py-1.5 text-white/90 hover:bg-white/10 hover:text-white">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <VehicleChip catalog={catalog} />
    </header>
  );
}
