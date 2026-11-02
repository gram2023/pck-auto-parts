"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { demoCart, shippingOptions } from "@/lib/demo-orders";
import { formatBaht } from "@/lib/format";
import { btn, errorCls, hintCls, inputCls, labelCls } from "@/lib/ui";
import { describeVehicle, type VehicleCatalog } from "@/lib/vehicle";
import { useSelectedVehicle } from "@/lib/vehicle-store";
import { OrderSummary } from "./checkout-ui";

type Field = "name" | "phone" | "email" | "address" | "district" | "province" | "postcode";
type Errors = Partial<Record<Field, string>>;

const fieldLabel: Record<Field, string> = {
  name: "ชื่อ-นามสกุล",
  phone: "เบอร์โทรศัพท์",
  email: "อีเมล",
  address: "ที่อยู่",
  district: "ตำบล/แขวง อำเภอ/เขต",
  province: "จังหวัด",
  postcode: "รหัสไปรษณีย์",
};

function validate(v: Record<Field, string>, needAddress: boolean): Errors {
  const e: Errors = {};
  if (!v.name.trim()) e.name = "กรุณากรอกชื่อ-นามสกุล";
  if (!/^0\d{9}$/.test(v.phone.replace(/[\s-]/g, ""))) e.phone = "กรุณากรอกเบอร์โทร 10 หลัก เช่น 0812345678";
  if (v.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) e.email = "รูปแบบอีเมลไม่ถูกต้อง";
  if (needAddress) {
    if (!v.address.trim()) e.address = "กรุณากรอกบ้านเลขที่ ถนน ซอย";
    if (!v.district.trim()) e.district = "กรุณากรอกตำบล/แขวง และอำเภอ/เขต";
    if (!v.province.trim()) e.province = "กรุณากรอกจังหวัด";
    if (!/^\d{5}$/.test(v.postcode)) e.postcode = "รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก";
  }
  return e;
}

export function CheckoutForm({ catalog }: { catalog: VehicleCatalog }) {
  const router = useRouter();
  const vehicle = useSelectedVehicle();
  const summaryRef = useRef<HTMLDivElement>(null);

  const [buyer, setBuyer] = useState<"guest" | "member">("guest");
  const [shipping, setShipping] = useState<(typeof shippingOptions)[number]["id"]>("standard");
  const [method, setMethod] = useState<"online" | "transfer">("online");
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const fee = shippingOptions.find((s) => s.id === shipping)!.fee;
  const needAddress = shipping !== "pickup";

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const v = Object.fromEntries(
      (Object.keys(fieldLabel) as Field[]).map((k) => [k, String(fd.get(k) ?? "")]),
    ) as Record<Field, string>;
    const errs = validate(v, needAddress);
    setErrors(errs);
    if (Object.keys(errs).length) {
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setSubmitting(true);
    // แบบร่าง: หน้าชำระเงินใช้ค่าส่งมาตรฐานเสมอ — เฟสระบบสั่งซื้อจะสร้างคำสั่งซื้อจริงแล้วส่งเลขคำสั่งซื้อไปแทน
    router.push(`/checkout/payment/${method}`);
  }

  const input = (name: Field, props: React.InputHTMLAttributes<HTMLInputElement> = {}, required = true) => (
    <div className="grid gap-1">
      <label htmlFor={`co-${name}`} className={labelCls}>
        {fieldLabel[name]} {required ? <span className="text-bad">*</span> : <span className="text-muted">(ไม่บังคับ)</span>}
      </label>
      <input id={`co-${name}`} name={name} className={inputCls} aria-invalid={errors[name] ? true : undefined}
        aria-describedby={errors[name] ? `co-${name}-err` : undefined} {...props} />
      {errors[name] && <p id={`co-${name}-err`} className={errorCls}>✕ {errors[name]}</p>}
    </div>
  );

  const radioCard = (checked: boolean) =>
    `flex cursor-pointer items-start gap-3 rounded-lg p-3 text-sm transition ${
      checked ? "border-2 border-brand bg-brand-soft" : "border border-line hover:border-brand/50"
    }`;

  const errorList = Object.entries(errors) as [Field, string][];

  return (
    <form onSubmit={submit} noValidate className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="grid gap-6">
        {errorList.length > 0 && (
          <div ref={summaryRef} tabIndex={-1} role="alert" className="rounded-md border border-bad/40 bg-bad-soft p-3 text-sm text-bad focus:outline-none">
            <strong>✕ กรุณาแก้ไข {errorList.length} รายการก่อนดำเนินการต่อ</strong>
            <ul className="mt-1 list-disc pl-5">
              {errorList.map(([k, m]) => (
                <li key={k}><a href={`#co-${k}`} className="underline">{fieldLabel[k]}: {m}</a></li>
              ))}
            </ul>
          </div>
        )}

        {/* 1. ผู้ซื้อ */}
        <fieldset className="grid gap-3">
          <legend className="mb-2 text-lg font-bold">1. ผู้สั่งซื้อ</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className={radioCard(buyer === "guest")}>
              <input type="radio" name="buyer" checked={buyer === "guest"} onChange={() => setBuyer("guest")} className="mt-1 size-5 accent-brand" />
              <span><strong>สั่งซื้อโดยไม่สมัครสมาชิก</strong><br /><span className="text-muted">กรอกข้อมูลเฉพาะครั้งนี้ ติดตามคำสั่งซื้อด้วยเลขคำสั่งซื้อ + เบอร์โทร</span></span>
            </label>
            <label className={radioCard(buyer === "member")}>
              <input type="radio" name="buyer" checked={buyer === "member"} onChange={() => setBuyer("member")} className="mt-1 size-5 accent-brand" />
              <span><strong>เข้าสู่ระบบสมาชิก</strong><br /><span className="text-muted">ใช้ที่อยู่และรถที่บันทึกไว้ ดูประวัติคำสั่งซื้อได้</span></span>
            </label>
          </div>
          {buyer === "member" && (
            <p className="rounded-md border border-info/30 bg-info-soft p-3 text-sm text-info">
              ℹ ระบบสมาชิกจะทำในเฟสถัดไป — แบบร่างนี้ให้กรอกข้อมูลด้านล่างแทน
            </p>
          )}
        </fieldset>

        {/* 2. ข้อมูลติดต่อ */}
        <fieldset className="grid gap-3">
          <legend className="mb-2 text-lg font-bold">2. ข้อมูลติดต่อ</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {input("name", { autoComplete: "name", placeholder: "เช่น สมชาย ใจดี" })}
            {input("phone", { type: "tel", inputMode: "tel", autoComplete: "tel", placeholder: "0812345678" })}
            <div className="sm:col-span-2">
              {input("email", { type: "email", autoComplete: "email", placeholder: "สำหรับรับใบเสร็จและสถานะคำสั่งซื้อ" }, false)}
            </div>
          </div>
        </fieldset>

        {/* 3. จัดส่ง */}
        <fieldset className="grid gap-3">
          <legend className="mb-2 text-lg font-bold">3. วิธีรับสินค้า</legend>
          <div className="grid gap-2">
            {shippingOptions.map((s) => (
              <label key={s.id} className={radioCard(shipping === s.id)}>
                <input type="radio" name="ship" checked={shipping === s.id} onChange={() => setShipping(s.id)} className="mt-1 size-5 accent-brand" />
                <span className="flex-1"><strong>{s.name}</strong><br /><span className="text-muted">{s.eta}</span></span>
                <strong>{s.fee === 0 ? "ฟรี" : formatBaht(s.fee)}</strong>
              </label>
            ))}
          </div>
          {needAddress ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">{input("address", { autoComplete: "street-address", placeholder: "บ้านเลขที่ หมู่ ซอย ถนน" })}</div>
              {input("district", { placeholder: "เช่น ลาดยาว, จตุจักร" })}
              {input("province", { autoComplete: "address-level1" })}
              {input("postcode", { inputMode: "numeric", autoComplete: "postal-code", maxLength: 5 })}
            </div>
          ) : (
            <p className="rounded-md border border-line bg-surface p-3 text-sm text-ink-soft">ที่อยู่ร้านและเวลาเปิดรับสินค้า: <em className="text-muted">รอข้อมูลจากร้าน</em></p>
          )}
        </fieldset>

        {/* 4. รถที่จะติดตั้ง */}
        <fieldset className="grid gap-3">
          <legend className="mb-2 text-lg font-bold">4. รถที่จะติดตั้ง <span className="text-sm font-normal text-muted">(ช่วยให้ร้านตรวจซ้ำก่อนส่ง)</span></legend>
          {vehicle ? (
            <p className="text-sm">🚗 <strong>{describeVehicle(vehicle, catalog)}</strong> <Link href="/#vehicle" className="ml-2 text-brand hover:underline">เปลี่ยน</Link></p>
          ) : (
            <p className="text-sm text-muted">ยังไม่ได้เลือกรถ — <Link href="/#vehicle" className="text-brand hover:underline">เลือกรถ</Link> หรือพิมพ์ในหมายเหตุ</p>
          )}
          <div className="grid gap-1">
            <label htmlFor="co-vin" className={labelCls}>เลขตัวถัง (VIN) <span className="text-muted">(ไม่บังคับ)</span></label>
            <input id="co-vin" name="vin" className={`${inputCls} code uppercase`} maxLength={17} />
            <p className={hintCls}>ดูได้จากเล่มทะเบียนรถ ใช้ยืนยันรุ่นย่อยให้แม่นยำขึ้น</p>
          </div>
          <div className="grid gap-1">
            <label htmlFor="co-note" className={labelCls}>หมายเหตุถึงร้าน <span className="text-muted">(ไม่บังคับ)</span></label>
            <textarea id="co-note" name="note" rows={2} className={`${inputCls} h-auto py-2`} />
          </div>
        </fieldset>

        {/* 5. วิธีชำระเงิน */}
        <fieldset className="grid gap-3">
          <legend className="mb-2 text-lg font-bold">5. วิธีชำระเงิน</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className={radioCard(method === "online")}>
              <input type="radio" name="method" checked={method === "online"} onChange={() => setMethod("online")} className="mt-1 size-5 accent-brand" />
              <span>
                <strong>💳 ชำระเงินออนไลน์</strong><br />
                <span className="text-muted">บัตรเครดิต/เดบิต หรือ QR พร้อมเพย์ ผ่านผู้ให้บริการชำระเงิน ยืนยันอัตโนมัติทันที</span>
              </span>
            </label>
            <label className={radioCard(method === "transfer")}>
              <input type="radio" name="method" checked={method === "transfer"} onChange={() => setMethod("transfer")} className="mt-1 size-5 accent-brand" />
              <span>
                <strong>🏦 โอนเงินแล้วแนบสลิป</strong><br />
                <span className="text-muted">โอนเข้าบัญชีร้าน แล้วอัปโหลดสลิป ร้านตรวจสอบภายในเวลาทำการ</span>
              </span>
            </label>
          </div>
        </fieldset>
      </div>

      <OrderSummary lines={demoCart} shippingFee={fee} compact>
        <button type="submit" disabled={submitting} className={btn("primary", "lg")}>
          {submitting ? "กำลังดำเนินการ…" : method === "online" ? "ไปหน้าชำระเงิน" : "ยืนยันคำสั่งซื้อ และไปแนบสลิป"}
        </button>
        <Link href="/cart" className={btn("ghost")}>← กลับไปแก้ไขตะกร้า</Link>
        <p className="text-center text-xs text-muted">กดยืนยันถือว่ายอมรับเงื่อนไขการคืนสินค้า (รอข้อมูลจากร้าน)</p>
      </OrderSummary>
    </form>
  );
}
