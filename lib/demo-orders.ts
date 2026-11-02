// ⚠️ ข้อมูลจำลอง (Demo) สำหรับแบบร่างตะกร้า Checkout การชำระเงิน และสถานะคำสั่งซื้อ
// ธนาคาร เลขบัญชี ค่าส่ง และเลขคำสั่งซื้อ เป็นค่าสมมติทั้งหมด

import { products } from "./catalog-data";
import type { Product } from "./types";

export type CartLine = { product: Product; qty: number };

const bySlug = (s: string) => products.find((p) => p.slug === s)!;

export const demoCart: CartLine[] = [
  { product: bySlug("brake-pad-front-revo-stopmax"), qty: 1 },
  { product: bySlug("oil-filter-revo-flowpure"), qty: 2 },
  { product: bySlug("water-pump-revo-genuine"), qty: 1 },
  { product: bySlug("battery-65ah-voltline"), qty: 1 },
];

export const shippingOptions = [
  { id: "standard", name: "ขนส่งมาตรฐาน (ตัวอย่าง)", eta: "2–4 วันทำการ", fee: 60 },
  { id: "express", name: "ขนส่งด่วน (ตัวอย่าง)", eta: "1–2 วันทำการ", fee: 120 },
  { id: "pickup", name: "รับเองที่ร้าน", eta: "รับได้เมื่อร้านแจ้ง", fee: 0 },
] as const;

export const demoBank = {
  bank: "ธนาคารตัวอย่าง (Demo)",
  accountName: "บจก. ช็อปปิ้งอะไหล่ออนไลน์ (ตัวอย่าง)",
  accountNo: "000-0-00000-0",
  promptPay: "0-0000-00000-00-0",
};

export const cartSubtotal = (lines: CartLine[]) => lines.reduce((s, l) => s + l.product.price * l.qty, 0);

export type OrderStatus =
  | "awaiting_payment"
  | "slip_review"
  | "slip_rejected"
  | "paid"
  | "preparing"
  | "shipped"
  | "completed"
  | "cancelled";

export const orderStatusLabel: Record<OrderStatus, string> = {
  awaiting_payment: "รอชำระเงิน",
  slip_review: "รอตรวจสอบสลิป",
  slip_rejected: "สลิปไม่ผ่านการตรวจสอบ",
  paid: "ชำระเงินแล้ว",
  preparing: "กำลังเตรียมสินค้า",
  shipped: "จัดส่งแล้ว",
  completed: "สำเร็จ",
  cancelled: "ยกเลิก",
};

export type DemoOrder = {
  no: string;
  method: "online" | "transfer";
  status: OrderStatus;
  placedAt: string;
  shippingId: (typeof shippingOptions)[number]["id"];
  rejectReason?: string;
  trackingNo?: string;
  /** ลำดับขั้นที่ผ่านมาแล้ว พร้อมเวลา (ข้อความคงที่ — ข้อมูลจำลอง) */
  history: { status: OrderStatus; at: string }[];
};

export const demoOrders: DemoOrder[] = [
  {
    no: "DEMO-1001",
    method: "online",
    status: "shipped",
    placedAt: "2 พ.ย. 2569 10:15",
    shippingId: "standard",
    trackingNo: "DEMO-TRACK-0001",
    history: [
      { status: "awaiting_payment", at: "2 พ.ย. 2569 10:15" },
      { status: "paid", at: "2 พ.ย. 2569 10:17" },
      { status: "preparing", at: "2 พ.ย. 2569 13:40" },
      { status: "shipped", at: "3 พ.ย. 2569 09:05" },
    ],
  },
  {
    no: "DEMO-1002",
    method: "transfer",
    status: "slip_review",
    placedAt: "2 พ.ย. 2569 11:02",
    shippingId: "express",
    history: [
      { status: "awaiting_payment", at: "2 พ.ย. 2569 11:02" },
      { status: "slip_review", at: "2 พ.ย. 2569 11:20" },
    ],
  },
  {
    no: "DEMO-1003",
    method: "transfer",
    status: "slip_rejected",
    placedAt: "1 พ.ย. 2569 16:30",
    shippingId: "standard",
    rejectReason: "ยอดเงินในสลิป (1,500 บาท) ไม่ตรงกับยอดที่ต้องชำระ",
    history: [
      { status: "awaiting_payment", at: "1 พ.ย. 2569 16:30" },
      { status: "slip_review", at: "1 พ.ย. 2569 16:45" },
      { status: "slip_rejected", at: "1 พ.ย. 2569 17:10" },
    ],
  },
];

export const getDemoOrder = (no: string) => demoOrders.find((o) => o.no === no) ?? null;
