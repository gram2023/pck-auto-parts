import { CHECK_WITH_STORE } from "@/lib/fitment";
import type { FitmentCheck } from "@/lib/types";

// สถานะความเข้ากันได้ที่ลูกค้าเห็น มี 3 แบบ (สี + ไอคอน + ข้อความ เสมอ — ไม่ใช้สีอย่างเดียว)
//   1. รองรับ — ตามข้อมูลที่ตรวจสอบแล้ว   (ถ้ามีเงื่อนไข แสดงเงื่อนไขเพิ่ม)
//   2. ไม่รองรับ — ตามข้อมูลที่มี
//   3. ข้อมูลไม่เพียงพอ — ต้องสอบถามร้าน
export type FitmentState = "fits" | "not_fit" | "unknown";

export const fitmentState = (c: FitmentCheck): FitmentState =>
  c.kind === "conditional" ? "fits" : c.kind;

export const fitmentText: Record<FitmentState, { icon: string; title: string; detail: string; cls: string }> = {
  fits: {
    icon: "✓",
    title: "รองรับ",
    detail: "ตามข้อมูลที่ตรวจสอบแล้ว",
    cls: "bg-ok-soft text-ok border-ok/30",
  },
  not_fit: {
    icon: "✕",
    title: "ไม่รองรับ",
    detail: "ตามข้อมูลที่มี",
    cls: "bg-bad-soft text-bad border-bad/30",
  },
  unknown: {
    icon: "?",
    title: "ข้อมูลไม่เพียงพอ",
    detail: CHECK_WITH_STORE,
    cls: "bg-info-soft text-info border-info/30",
  },
};

export function FitmentBadge({ check, size = "sm" }: { check: FitmentCheck; size?: "sm" | "md" }) {
  const state = fitmentState(check);
  const s = fitmentText[state];
  const conditions = check.kind !== "unknown" ? check.fitment.conditions : undefined;
  return (
    <div role="status" className={`rounded-md border ${s.cls} ${size === "md" ? "px-3 py-2 text-sm" : "px-2 py-1.5 text-xs"}`}>
      <p className="flex items-start gap-1.5">
        <span aria-hidden className="mt-px grid size-4 shrink-0 place-items-center rounded-full bg-current text-[10px] font-bold leading-none">
          <span className="text-white">{s.icon}</span>
        </span>
        <span>
          <strong>{s.title}</strong> — {s.detail}
        </span>
      </p>
      {conditions && (
        <p className="mt-1 rounded bg-white/70 px-1.5 py-0.5 font-medium text-warn">
          ⚠ มีเงื่อนไข: {conditions}
        </p>
      )}
    </div>
  );
}
