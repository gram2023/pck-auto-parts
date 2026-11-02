"use client";

import Link from "next/link";
import { saveVehicle, useSelectedVehicle } from "@/lib/vehicle-store";
import { describeVehicle, vehicleQuery, type VehicleCatalog } from "@/lib/vehicle";

/** แถบ "กำลังดูอะไหล่สำหรับ" ใต้หัวเว็บ */
export function VehicleChip({ catalog }: { catalog: VehicleCatalog }) {
  const sel = useSelectedVehicle();
  return (
    <div className="border-b border-line bg-brand-soft">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2 text-sm">
        <span aria-hidden>🚗</span>
        {sel ? (
          <>
            <span className="text-ink-soft">กำลังดูอะไหล่สำหรับ:</span>
            <Link href={`/search?${vehicleQuery(sel)}`} className="font-semibold text-brand hover:underline">
              {describeVehicle(sel, catalog)}
            </Link>
            <span className="flex gap-3">
              <Link href="/#vehicle" className="text-brand underline-offset-2 hover:underline">เปลี่ยนรถ</Link>
              <button type="button" onClick={() => saveVehicle(null)} className="text-muted hover:text-bad">
                ล้าง
              </button>
            </span>
          </>
        ) : (
          <>
            <span className="text-ink-soft">ยังไม่ได้เลือกรถ</span>
            <Link href="/#vehicle" className="font-semibold text-brand hover:underline">
              เลือกรถเพื่อดูอะไหล่ที่ใช้ได้ →
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
