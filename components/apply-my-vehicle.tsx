"use client";

import Link from "next/link";
import { useSelectedVehicle } from "@/lib/vehicle-store";
import { describeVehicle, vehicleQuery, type VehicleCatalog } from "@/lib/vehicle";

/** แสดงเมื่อลูกค้าเคยเลือกรถไว้ แต่หน้านี้ยังไม่ได้กรองตามรถ */
export function ApplyMyVehicle({ href, catalog }: { href: string; catalog: VehicleCatalog }) {
  const sel = useSelectedVehicle();
  if (!sel) {
    return (
      <p className="mt-4 rounded-md border border-line bg-surface p-3 text-sm text-ink-soft">
        ยังไม่ได้เลือกรถ — <Link href="/#vehicle" className="font-semibold text-brand hover:underline">เลือกรถ</Link>{" "}
        เพื่อดูว่าอะไหล่ชิ้นไหนใช้กับรถของคุณได้
      </p>
    );
  }
  const join = href.includes("?") ? "&" : "?";
  return (
    <p className="mt-4 rounded-md border border-brand/20 bg-brand-soft p-3 text-sm text-brand">
      คุณเลือกรถ <strong>{describeVehicle(sel, catalog)}</strong> ไว้ —{" "}
      <Link href={`${href}${join}${vehicleQuery(sel)}`} className="font-semibold underline">
        กรองเฉพาะอะไหล่สำหรับรถคันนี้
      </Link>
    </p>
  );
}
