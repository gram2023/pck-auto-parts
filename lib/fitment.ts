// ตรวจความเข้ากันได้ — ฟังก์ชันบริสุทธิ์ ใช้ได้ทั้งฝั่งเซิร์ฟเวอร์และเบราว์เซอร์
// กติกา (แผนเฟส 1 ข้อ 7):
// - ใช้เฉพาะข้อมูลสถานะ "verified" ที่มีแหล่งอ้างอิง
// - ไม่เดาจากรุ่นใกล้เคียงหรือปีติดกัน
// - ไม่ทราบเครื่องยนต์ / ไม่มีข้อมูล → "unknown" (กรุณาตรวจสอบกับร้านก่อนสั่งซื้อ)

import type { Fitment, FitmentCheck, Product, VehicleSelection } from "./types";

export function publishedFitments(p: Pick<Product, "fitments">): Fitment[] {
  return p.fitments.filter((f) => f.status === "verified" && f.source.ref.trim() !== "");
}

export function checkFitment(
  p: Pick<Product, "fitments">,
  sel: VehicleSelection | null,
): FitmentCheck {
  if (!sel || !sel.vehicleId) return { kind: "unknown" };
  const f = publishedFitments(p).find(
    (x) =>
      x.vehicleId === sel.vehicleId &&
      (x.yearFrom == null || sel.year >= x.yearFrom) &&
      (x.yearTo == null || sel.year <= x.yearTo),
  );
  if (!f) return { kind: "unknown" };
  if (f.result === "not_fit") return { kind: "not_fit", fitment: f };
  if (f.result === "conditional" || f.conditions) return { kind: "conditional", fitment: f };
  return { kind: "fits", fitment: f };
}

export const CHECK_WITH_STORE = "กรุณาตรวจสอบกับร้านก่อนสั่งซื้อ";
