import { CHECK_WITH_STORE } from "@/lib/fitment";
import type { FitmentCheck } from "@/lib/types";

const styles = {
  fits: { cls: "bg-ok-soft text-ok border-ok/25", icon: "✓", text: "รองรับรถของคุณ" },
  conditional: { cls: "bg-warn-soft text-warn border-warn/25", icon: "!", text: "รองรับแบบมีเงื่อนไข" },
  not_fit: { cls: "bg-bad-soft text-bad border-bad/25", icon: "✕", text: "ไม่รองรับรถของคุณ" },
  unknown: { cls: "bg-info-soft text-info border-info/25", icon: "?", text: CHECK_WITH_STORE },
} as const;

export function FitmentBadge({ check, size = "sm" }: { check: FitmentCheck; size?: "sm" | "md" }) {
  const s = styles[check.kind];
  const conditions = check.kind !== "unknown" ? check.fitment.conditions : undefined;
  return (
    <div className={`rounded-md border ${s.cls} ${size === "md" ? "px-3 py-2 text-sm" : "px-2 py-1 text-xs"}`}>
      <p className="flex items-center gap-1.5 font-semibold">
        <span aria-hidden className="grid size-4 shrink-0 place-items-center rounded-full bg-current text-[10px] leading-none">
          <span className="text-white">{s.icon}</span>
        </span>
        {s.text}
      </p>
      {conditions && <p className="mt-0.5 font-normal">เงื่อนไข: {conditions}</p>}
    </div>
  );
}
