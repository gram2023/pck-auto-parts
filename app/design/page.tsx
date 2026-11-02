import type { Metadata } from "next";
import Link from "next/link";
import { StockBadge, TypeBadge } from "@/components/badges";
import { DemoNotice } from "@/components/checkout-ui";
import { FitmentBadge } from "@/components/fitment-badge";
import { ListingSkeleton } from "@/components/listing-skeleton";
import { ProductCard } from "@/components/product-card";
import { Empty } from "@/components/product-listing";
import { ErrorState, LoadingState } from "@/components/state-views";
import { getFeaturedProducts } from "@/lib/catalog";
import type { Fitment } from "@/lib/types";
import { btn, errorCls, hintCls, inputCls, labelCls } from "@/lib/ui";

export const metadata: Metadata = { title: "ระบบดีไซน์ (แบบร่าง)", robots: { index: false } };

const colors = [
  { token: "brand", hex: "#12355b", use: "สีหลัก หัวเว็บ ลิงก์ ปุ่มรอง", cls: "bg-brand text-white" },
  { token: "brand-soft", hex: "#e7eef7", use: "พื้นแถบรถที่เลือก พื้นเน้น", cls: "bg-brand-soft text-brand" },
  { token: "accent", hex: "#d9480f", use: "ปุ่มหลัก (CTA) 1 ปุ่มต่อหน้าจอ", cls: "bg-accent text-white" },
  { token: "ink", hex: "#17202b", use: "ตัวอักษรหลัก", cls: "bg-ink text-white" },
  { token: "muted", hex: "#667181", use: "ข้อความรอง คำอธิบาย", cls: "bg-muted text-white" },
  { token: "line / surface", hex: "#d8dee6 / #f3f5f8", use: "เส้นขอบ / พื้นหลังส่วนย่อย", cls: "bg-surface text-ink border border-line" },
  { token: "ok", hex: "#17784a", use: "รองรับ · พร้อมส่ง · สำเร็จ", cls: "bg-ok-soft text-ok" },
  { token: "warn", hex: "#995400", use: "มีเงื่อนไข · พรีออร์เดอร์ · ข้อมูล Demo", cls: "bg-warn-soft text-warn" },
  { token: "bad", hex: "#b42318", use: "ไม่รองรับ · ผิดพลาด · ลบ", cls: "bg-bad-soft text-bad" },
  { token: "info", hex: "#2c4a73", use: "ข้อมูลไม่เพียงพอ · ต้องถามร้าน", cls: "bg-info-soft text-info" },
];

const pages = [
  { href: "/", name: "หน้าแรก", note: "ช่องค้นหา + ตัวเลือกรถ + หมวดหมู่" },
  { href: "/search?q=brake", name: "ผลค้นหา + ตัวกรอง", note: "ลองเลือกรถก่อนเพื่อดูการแบ่งกลุ่ม 3 สถานะ" },
  { href: "/category/brake", name: "หมวดหมู่", note: "ตัวกรองเหมือนหน้าค้นหา" },
  { href: "/search?q=zzzz-ไม่มี", name: "ไม่พบสินค้า", note: "สถานะว่าง + ให้ร้านช่วยหา" },
  { href: "/product/brake-pad-front-revo-stopmax", name: "หน้าสินค้า", note: "ตารางรถ, OEM, ตำแหน่ง, เงื่อนไข" },
  { href: "/cart", name: "ตะกร้า", note: "ตรวจความเข้ากันได้ทุกรายการ" },
  { href: "/checkout", name: "Checkout", note: "ผู้ซื้อทั่วไป/สมาชิก ที่อยู่ ขนส่ง วิธีชำระ" },
  { href: "/checkout/payment/online", name: "ชำระออนไลน์", note: "จำลองสำเร็จ / ไม่สำเร็จ" },
  { href: "/checkout/payment/transfer", name: "โอนเงิน + แนบสลิป", note: "ตรวจไฟล์ + แสดงตัวอย่างสลิป" },
  { href: "/order/DEMO-1002", name: "สถานะคำสั่งซื้อ", note: "มี DEMO-1001 / 1002 / 1003" },
  { href: "/fitment-inquiry", name: "สอบถามร้าน", note: "ส่งข้อมูลรถให้ร้านตรวจสอบ" },
];

const demoFit = (conditions?: string): Fitment => ({
  vehicleId: "demo", result: conditions ? "conditional" : "fits",
  conditions, source: { type: "demo", ref: "ตัวอย่าง" }, status: "verified",
});

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-40 border-t border-line pt-8">
      <h2 className="text-xl font-bold">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default async function DesignPage() {
  const [sample] = await getFeaturedProducts();

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-8">
      <header>
        <p className="text-sm font-semibold text-accent">เฟส 2 · แบบร่าง UX/UI</p>
        <h1 className="text-3xl font-bold">ระบบดีไซน์ของร้าน</h1>
        <p className="mt-2 max-w-2xl text-ink-soft">
          สี ตัวอักษร ปุ่ม แบบฟอร์ม และองค์ประกอบที่ใช้ร่วมกันทุกหน้า ออกแบบบนมือถือก่อน (กว้าง 360px) แล้วขยายที่ 640 / 768 / 1024px
        </p>
        <div className="mt-4"><DemoNotice>ทุกสินค้า ราคา หมายเลข OEM และข้อมูลรถในแบบร่างนี้เป็นข้อมูลจำลอง</DemoNotice></div>
      </header>

      <Section id="pages" title="หน้าที่ส่งตรวจ">
        <ol className="grid gap-2 sm:grid-cols-2">
          {pages.map((p, i) => (
            <li key={p.href}>
              <Link href={p.href} className="flex h-full gap-3 rounded-lg border border-line p-3 hover:border-brand">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-soft text-sm font-bold text-brand">{i + 1}</span>
                <span>
                  <span className="block font-semibold text-brand">{p.name}</span>
                  <span className="text-sm text-muted">{p.note}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="colors" title="สี">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {colors.map((c) => (
            <li key={c.token} className="overflow-hidden rounded-lg border border-line">
              <div className={`flex h-16 items-end px-3 pb-2 text-sm font-semibold ${c.cls}`}>{c.token}</div>
              <div className="px-3 py-2 text-sm">
                <p className="code text-muted">{c.hex}</p>
                <p className="text-ink-soft">{c.use}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-ink-soft">
          กติกา: สีสถานะทุกตัวมาคู่กับ <strong>ไอคอน + ข้อความ</strong> เสมอ ตัวอักษรบนพื้นทุกคู่ผ่านความต่างสี WCAG AA (≥ 4.5:1)
        </p>
      </Section>

      <Section id="type" title="ตัวอักษร">
        <p className="text-sm text-muted">IBM Plex Sans Thai (ไทย + อังกฤษ) · รหัสอะไหล่ใช้ฟอนต์ความกว้างเท่ากัน</p>
        <div className="mt-3 grid gap-3 rounded-lg border border-line p-4">
          <p className="text-3xl font-bold">หัวข้อหน้า 30/700</p>
          <p className="text-2xl font-bold">ชื่อสินค้าในหน้าสินค้า 24/700</p>
          <p className="text-xl font-bold">หัวข้อส่วน 20/700</p>
          <p className="text-[15px]">เนื้อหาและช่องกรอก 15–16/400 — ไม่ต่ำกว่า 15px บนมือถือ</p>
          <p className="text-sm text-muted">ข้อความรอง 14/400</p>
          <p>รหัสอะไหล่: <span className="code rounded bg-surface px-2 py-0.5">DEMO-PN-0001</span> <span className="text-sm text-muted">(ตัวอย่าง ไม่ใช่หมายเลขจริง)</span></p>
          <p className="text-2xl font-bold">฿1,250 <span className="text-base font-normal text-muted">/ ชุด</span></p>
        </div>
      </Section>

      <Section id="buttons" title="ปุ่ม">
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className={btn("primary")}>เพิ่มลงตะกร้า</button>
          <button type="button" className={btn("secondary")}>ใช้ตัวกรอง</button>
          <button type="button" className={btn("outline")}>สอบถามร้าน</button>
          <button type="button" className={btn("ghost")}>แก้ไขรถ</button>
          <button type="button" className={btn("danger")}>ลบ</button>
          <button type="button" disabled className={btn("primary")}>สินค้าหมด</button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button type="button" className={btn("primary", "lg")}>ขนาดใหญ่ 48px</button>
          <button type="button" className={btn("primary", "md")}>ขนาดปกติ 44px</button>
          <button type="button" className={btn("outline", "sm")}>ขนาดเล็ก 36px</button>
        </div>
        <p className="mt-3 text-sm text-ink-soft">ส้ม = การกระทำหลักของหน้า (มี 1 ปุ่ม) · ปุ่มบนมือถือสูงอย่างน้อย 44px · กด Tab แล้วมีกรอบโฟกัสชัดเจน</p>
      </Section>

      <Section id="forms" title="แบบฟอร์ม">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1">
            <label htmlFor="d-name" className={labelCls}>ชื่อ-นามสกุล <span className="text-bad">*</span></label>
            <input id="d-name" className={inputCls} placeholder="เช่น สมชาย ใจดี" />
            <p className={hintCls}>ใช้สำหรับจ่าหน้าพัสดุ</p>
          </div>
          <div className="grid gap-1">
            <label htmlFor="d-phone" className={labelCls}>เบอร์โทรศัพท์ <span className="text-bad">*</span></label>
            <input id="d-phone" className={inputCls} aria-invalid="true" defaultValue="08123" aria-describedby="d-phone-err" />
            <p id="d-phone-err" className={errorCls}>✕ กรุณากรอกเบอร์โทร 10 หลัก เช่น 0812345678</p>
          </div>
          <div className="grid gap-1">
            <label htmlFor="d-sel" className={labelCls}>จังหวัด</label>
            <select id="d-sel" className={inputCls}><option>เลือกจังหวัด</option></select>
          </div>
          <div className="grid gap-1">
            <label htmlFor="d-dis" className={labelCls}>ช่องที่ยังใช้ไม่ได้</label>
            <input id="d-dis" className={inputCls} disabled value="เลือกปีก่อน" readOnly />
          </div>
          <fieldset className="grid gap-2">
            <legend className={labelCls}>ตัวเลือกแบบเลือกหลายข้อ</legend>
            <label className="flex min-h-9 items-center gap-2.5 text-sm"><input type="checkbox" defaultChecked className="size-5 accent-brand" /> พร้อมส่ง</label>
            <label className="flex min-h-9 items-center gap-2.5 text-sm"><input type="checkbox" className="size-5 accent-brand" /> พรีออร์เดอร์</label>
          </fieldset>
          <fieldset className="grid gap-2">
            <legend className={labelCls}>ตัวเลือกแบบการ์ด (เลือกได้ 1)</legend>
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border-2 border-brand bg-brand-soft p-3 text-sm">
              <input type="radio" name="d-r" defaultChecked className="mt-1 size-5 accent-brand" />
              <span><strong>ชำระออนไลน์</strong><br /><span className="text-muted">บัตร / QR พร้อมเพย์</span></span>
            </label>
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-line p-3 text-sm">
              <input type="radio" name="d-r" className="mt-1 size-5 accent-brand" />
              <span><strong>โอนเงินแล้วแนบสลิป</strong></span>
            </label>
          </fieldset>
        </div>
        <p className="mt-3 text-sm text-ink-soft">ป้ายชื่ออยู่เหนือช่องเสมอ · ข้อผิดพลาดแสดงใต้ช่องเป็นข้อความ + ขอบแดง · เมื่อกดส่งแล้วผิด จะมีสรุปข้อผิดพลาดที่ด้านบนฟอร์ม</p>
      </Section>

      <Section id="badges" title="ป้ายสถานะ">
        <div className="grid gap-5">
          <div>
            <h3 className="mb-2 font-semibold">สถานะสต็อก</h3>
            <div className="flex flex-wrap gap-2">
              <StockBadge stock="in_stock" /><StockBadge stock="preorder" preorderDays={7} /><StockBadge stock="out_of_stock" />
            </div>
          </div>
          <div>
            <h3 className="mb-2 font-semibold">ประเภทสินค้า</h3>
            <div className="flex flex-wrap gap-2"><TypeBadge type="genuine" /><TypeBadge type="aftermarket" /><TypeBadge type="used" /></div>
          </div>
          <div>
            <h3 className="mb-2 font-semibold">ความเข้ากันได้กับรถที่เลือก (3 สถานะ)</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              <FitmentBadge size="md" check={{ kind: "fits", fitment: demoFit() }} />
              <FitmentBadge size="md" check={{ kind: "conditional", fitment: demoFit("เฉพาะรุ่นที่ใช้ดิสก์เบรกหลัง (ตัวอย่าง)") }} />
              <FitmentBadge size="md" check={{ kind: "not_fit", fitment: { ...demoFit(), result: "not_fit" } }} />
              <FitmentBadge size="md" check={{ kind: "unknown" }} />
            </div>
            <p className="mt-2 text-sm text-ink-soft">
              “มีเงื่อนไข” เป็นสถานะรองรับ + กล่องเงื่อนไขสีส้ม · ระบบไม่เดาจากรุ่นหรือปีใกล้เคียง ไม่มีข้อมูลยืนยัน = “ข้อมูลไม่เพียงพอ”
            </p>
          </div>
        </div>
      </Section>

      <Section id="card" title="การ์ดสินค้า">
        <div className="grid max-w-md grid-cols-2 gap-3">
          {sample && <ProductCard hit={{ product: sample }} />}
          {sample && <ProductCard hit={{ product: sample, match: { kind: "oem", value: "DEMO-OEM" } }} vehicle={null} />}
        </div>
        <p className="mt-3 text-sm text-ink-soft">
          รูป · ประเภท + สต็อก · ชื่อ · แบรนด์ · รหัสสินค้า · เลขอะไหล่ · ตำแหน่ง · (ผลความเข้ากันได้เมื่อเลือกรถ) · ราคา / หน่วยขาย ·
          ค้นด้วยรหัสจะมีแถบบอกว่าตรงกับรหัสใด · มือถือ 2 คอลัมน์ → จอใหญ่ 4 คอลัมน์
        </p>
      </Section>

      <Section id="states" title="สถานะหน้าจอ">
        <div className="grid gap-6">
          <div>
            <h3 className="mb-2 font-semibold">1. กำลังโหลด</h3>
            <LoadingState label="กำลังค้นหาอะไหล่…" />
            <div className="max-h-56 overflow-hidden rounded-lg border border-line p-3"><ListingSkeleton /></div>
          </div>
          <div>
            <h3 className="mb-2 font-semibold">2. ไม่พบสินค้า</h3>
            <Empty q="ตัวอย่าง-1234" hasFilters clearHref="/search" />
          </div>
          <div>
            <h3 className="mb-2 font-semibold">3. เกิดข้อผิดพลาด</h3>
            <ErrorState code="DEMO-ERR-01">
              <button type="button" className={btn("primary")}>ลองใหม่อีกครั้ง</button>
              <Link href="/contact" className={btn("ghost")}>ติดต่อร้าน</Link>
            </ErrorState>
          </div>
        </div>
      </Section>
    </div>
  );
}
