import type { BodyType, Position, ProductType, SaleUnit, SourceType, StockStatus } from "./types";

export const bodyTypeLabel: Record<BodyType, string> = {
  sedan: "รถเก๋ง",
  hatchback: "รถเก๋ง 5 ประตู",
  pickup: "รถกระบะ",
  suv: "SUV",
  ppv: "PPV",
  mpv: "MPV (7 ที่นั่ง)",
};

const baht = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

export const formatBaht = (n: number) => baht.format(n);

export const unitLabel: Record<SaleUnit, string> = {
  piece: "ชิ้น",
  pair: "คู่",
  set: "ชุด",
  liter: "ลิตร",
};

export const typeLabel: Record<ProductType, string> = {
  genuine: "อะไหล่แท้",
  aftermarket: "อะไหล่ทดแทน",
  used: "อะไหล่มือสอง",
};

export const stockLabel: Record<StockStatus, string> = {
  in_stock: "พร้อมส่ง",
  preorder: "พรีออร์เดอร์",
  out_of_stock: "สินค้าหมด",
};

export const positionLabel: Record<Position, string> = {
  front: "หน้า",
  rear: "หลัง",
  left: "ซ้าย",
  right: "ขวา",
  upper: "บน",
  lower: "ล่าง",
};

export const sourceLabel: Record<SourceType, string> = {
  manufacturer_catalog: "แคตตาล็อกผู้ผลิต",
  oem_reference: "ข้อมูลอ้างอิงอะไหล่แท้",
  store_verified: "ร้านตรวจสอบแล้ว",
  demo: "ข้อมูลตัวอย่าง",
};

export const formatPositions = (p?: Position[]) =>
  p && p.length ? p.map((x) => positionLabel[x]).join(" / ") : "";

export function formatYears(from?: number, to?: number) {
  if (from == null && to == null) return "";
  if (from === to) return String(from);
  return `${from ?? ""}–${to ?? ""}`;
}
