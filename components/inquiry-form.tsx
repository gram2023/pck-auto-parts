"use client";

import Link from "next/link";
import { useState } from "react";
import { btn, errorCls, hintCls, inputCls, labelCls } from "@/lib/ui";
import { describeVehicle, type VehicleCatalog } from "@/lib/vehicle";
import { useSelectedVehicle } from "@/lib/vehicle-store";

export function InquiryForm({ catalog, productName }: { catalog: VehicleCatalog; productName?: string }) {
  const vehicle = useSelectedVehicle();
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<{ contact?: string; car?: string }>({});

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const errs: typeof errors = {};
    if (!String(fd.get("contact") ?? "").trim()) errs.contact = "กรุณาใส่เบอร์โทรหรือ LINE ID เพื่อให้ร้านตอบกลับ";
    if (!vehicle && !String(fd.get("car") ?? "").trim()) errs.car = "กรุณาระบุรถ หรือเลือกรถจากหน้าแรก";
    setErrors(errs);
    if (!Object.keys(errs).length) setSent(true);
  }

  if (sent) {
    return (
      <div role="status" className="rounded-lg border border-ok/30 bg-ok-soft p-6 text-center">
        <p aria-hidden className="mx-auto grid size-12 place-items-center rounded-full bg-ok text-2xl text-white">✓</p>
        <p className="mt-3 text-lg font-bold text-ok">ส่งคำถามถึงร้านแล้ว (Demo)</p>
        <p className="mt-1 text-sm text-ink-soft">ร้านจะตอบกลับตามช่องทางที่ให้ไว้ ภายในเวลาทำการ (รอข้อมูลจากร้าน)</p>
        <Link href="/" className={btn("outline", "md", "mt-5")}>กลับไปเลือกซื้อสินค้า</Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-4">
      {productName && (
        <p className="rounded-md bg-surface p-3 text-sm">สินค้าที่สอบถาม: <strong>{productName}</strong></p>
      )}
      <div className="grid gap-1">
        <span className={labelCls}>รถของคุณ <span className="text-bad">*</span></span>
        {vehicle ? (
          <p className="text-sm">🚗 <strong>{describeVehicle(vehicle, catalog)}</strong> <Link href="/#vehicle" className="ml-2 text-brand hover:underline">เปลี่ยน</Link></p>
        ) : (
          <>
            <label htmlFor="iq-car" className="sr-only">รถของคุณ</label>
            <input id="iq-car" name="car" className={inputCls} placeholder="ยี่ห้อ รุ่น ปี เครื่องยนต์ เช่น Toyota Hilux Revo 2018 2.4 ดีเซล"
              aria-invalid={errors.car ? true : undefined} />
            {errors.car && <p className={errorCls}>✕ {errors.car}</p>}
          </>
        )}
      </div>
      <div className="grid gap-1">
        <label htmlFor="iq-vin" className={labelCls}>เลขตัวถัง (VIN) <span className="text-muted">(ไม่บังคับ แต่ช่วยให้ตอบได้แม่นขึ้น)</span></label>
        <input id="iq-vin" name="vin" maxLength={17} className={`${inputCls} code uppercase`} />
      </div>
      <div className="grid gap-1">
        <label htmlFor="iq-msg" className={labelCls}>รายละเอียด / หมายเลขอะไหล่เดิม</label>
        <textarea id="iq-msg" name="msg" rows={3} className={`${inputCls} h-auto py-2`} placeholder="เช่น เลขที่ตอกบนอะไหล่ชิ้นเดิม อาการที่พบ" />
      </div>
      <div className="grid gap-1">
        <label htmlFor="iq-photo" className={labelCls}>รูปอะไหล่เดิม <span className="text-muted">(ไม่บังคับ)</span></label>
        <input id="iq-photo" name="photo" type="file" accept="image/*" className="text-sm file:mr-3 file:h-10 file:rounded-md file:border-0 file:bg-brand-soft file:px-4 file:font-semibold file:text-brand" />
        <p className={hintCls}>ถ่ายให้เห็นหมายเลขหรือป้ายบนชิ้นงาน</p>
      </div>
      <div className="grid gap-1">
        <label htmlFor="iq-contact" className={labelCls}>เบอร์โทร หรือ LINE ID <span className="text-bad">*</span></label>
        <input id="iq-contact" name="contact" className={inputCls} aria-invalid={errors.contact ? true : undefined} />
        {errors.contact && <p className={errorCls}>✕ {errors.contact}</p>}
      </div>
      <button type="submit" className={btn("primary", "lg")}>ส่งคำถามถึงร้าน</button>
    </form>
  );
}
