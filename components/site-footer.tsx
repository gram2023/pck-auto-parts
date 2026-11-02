import Link from "next/link";
import { getCategories } from "@/lib/catalog";
import { STORE_NAME } from "./site-header";

export async function SiteFooter() {
  const cats = await getCategories();
  return (
    <footer className="mt-16 border-t border-line bg-surface text-sm">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-base font-bold text-brand">{STORE_NAME}</p>
          <p className="mt-2 text-muted">
            ร้านอะไหล่รถยนต์ออนไลน์ ค้นหาจากรุ่นรถหรือหมายเลขอะไหล่ ถ้าไม่แน่ใจว่าใช้ได้กับรถของคุณ สอบถามร้านก่อนสั่งซื้อได้ทุกครั้ง
          </p>
        </div>
        <div>
          <p className="font-semibold text-ink">หมวดหมู่</p>
          <ul className="mt-2 grid grid-cols-2 gap-1 text-muted">
            {cats.map((c) => (
              <li key={c.slug}><Link href={`/category/${c.slug}`} className="hover:text-brand">{c.name}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-semibold text-ink">ช่วยเหลือ</p>
          <ul className="mt-2 grid gap-1 text-muted">
            <li><Link href="/contact" className="hover:text-brand">ติดต่อร้าน</Link></li>
            <li><Link href="/fitment-inquiry" className="hover:text-brand">ถามร้านก่อนซื้อ</Link></li>
            <li><Link href="/design" className="hover:text-brand">ระบบดีไซน์ (แบบร่าง)</Link></li>
          </ul>
          <p className="mt-2 text-xs text-muted">คำถามที่พบบ่อย นโยบายการจัดส่ง การคืนสินค้า และการรับประกัน จะเพิ่มในเฟสถัดไป</p>
        </div>
        <div>
          <p className="font-semibold text-ink">ช่องทางชำระเงิน</p>
          <ul className="mt-2 grid gap-1 text-muted">
            <li>ชำระออนไลน์ (บัตร / PromptPay)</li>
            <li>โอนเงินผ่านธนาคาร + แนบสลิป</li>
          </ul>
        </div>
      </div>
      <p className="border-t border-line py-4 text-center text-xs text-muted">
        © {STORE_NAME} · ราคาทั้งหมดเป็นเงินบาท (THB)
      </p>
    </footer>
  );
}
