import type { Metadata } from "next";

export const metadata: Metadata = { title: "ติดต่อร้าน" };

// รอข้อมูลจริงจากร้าน (แผนเฟส 1 ข้อ K)
const rows = [
  { label: "LINE Official", value: "รอข้อมูลจากร้าน" },
  { label: "โทรศัพท์", value: "รอข้อมูลจากร้าน" },
  { label: "เวลาทำการ", value: "รอข้อมูลจากร้าน" },
  { label: "ที่อยู่ร้าน", value: "รอข้อมูลจากร้าน" },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold">ติดต่อร้าน</h1>
      <p className="mt-2 text-ink-soft">
        ไม่แน่ใจว่าอะไหล่ใช้กับรถของคุณได้หรือไม่ ติดต่อร้านพร้อมแจ้งยี่ห้อ รุ่น ปี เครื่องยนต์ และเลขตัวถัง (ถ้ามี)
      </p>
      <dl className="mt-6 divide-y divide-line rounded-lg border border-line">
        {rows.map((r) => (
          <div key={r.label} className="flex gap-4 px-4 py-3">
            <dt className="w-36 shrink-0 text-muted">{r.label}</dt>
            <dd className="italic text-muted">{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
