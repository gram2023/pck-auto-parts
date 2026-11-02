"use client";

import Link from "next/link";
import { checkFitment } from "@/lib/fitment";
import { describeVehicle, type VehicleCatalog } from "@/lib/vehicle";
import { useSelectedVehicle } from "@/lib/vehicle-store";
import type { Fitment } from "@/lib/types";
import { FitmentBadge } from "./fitment-badge";

/** ตรวจสินค้านี้กับ "รถของฉัน" ที่บันทึกไว้ในเบราว์เซอร์ */
export function MyCarFitment({ fitments, catalog }: { fitments: Fitment[]; catalog: VehicleCatalog }) {
  const sel = useSelectedVehicle();
  if (!sel) {
    return (
      <div className="rounded-md border border-line bg-surface p-3 text-sm">
        <p className="font-semibold">ใช้กับรถของคุณได้ไหม?</p>
        <p className="mt-0.5 text-ink-soft">
          <Link href="/#vehicle" className="font-semibold text-brand hover:underline">เลือกรถของคุณ</Link>{" "}
          เพื่อตรวจสอบกับข้อมูลอ้างอิงของร้าน
        </p>
      </div>
    );
  }
  return (
    <div className="grid gap-1.5">
      <p className="text-sm text-ink-soft">
        ตรวจกับรถของคุณ: <strong className="text-ink">{describeVehicle(sel, catalog)}</strong>{" "}
        <Link href="/#vehicle" className="text-brand hover:underline">เปลี่ยน</Link>
      </p>
      <FitmentBadge check={checkFitment({ fitments }, sel)} size="md" />
    </div>
  );
}
