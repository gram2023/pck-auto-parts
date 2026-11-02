"use client";

import Link from "next/link";
import { useState } from "react";
import { formatBaht } from "@/lib/format";
import { btn } from "@/lib/ui";

type Stage = "ready" | "processing" | "success" | "failed";

/** จำลองการชำระผ่านผู้ให้บริการ (ยังไม่ได้เลือก payment gateway) */
export function PaymentOnline({ amount, orderNo }: { amount: number; orderNo: string }) {
  const [stage, setStage] = useState<Stage>("ready");
  const [channel, setChannel] = useState<"card" | "qr">("qr");

  const simulate = (result: "success" | "failed") => {
    setStage("processing");
    setTimeout(() => setStage(result), 1200);
  };

  if (stage === "success") {
    return (
      <div role="status" className="rounded-lg border border-ok/30 bg-ok-soft p-6 text-center">
        <p aria-hidden className="mx-auto grid size-12 place-items-center rounded-full bg-ok text-2xl text-white">✓</p>
        <p className="mt-3 text-lg font-bold text-ok">ชำระเงินสำเร็จ</p>
        <p className="mt-1 text-sm text-ink-soft">คำสั่งซื้อ <span className="code">{orderNo}</span> ยอด {formatBaht(amount)} · ร้านจะเริ่มเตรียมสินค้า</p>
        <Link href="/order/DEMO-1001" className={btn("primary", "md", "mt-5")}>ดูสถานะคำสั่งซื้อ</Link>
      </div>
    );
  }

  if (stage === "failed") {
    return (
      <div role="alert" className="rounded-lg border border-bad/30 bg-bad-soft p-6 text-center">
        <p aria-hidden className="mx-auto grid size-12 place-items-center rounded-full bg-bad text-2xl font-bold text-white">!</p>
        <p className="mt-3 text-lg font-bold text-bad">ชำระเงินไม่สำเร็จ</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-ink-soft">
          ยังไม่มีการตัดเงิน คำสั่งซื้อยังรอชำระ (เก็บไว้ 24 ชั่วโมง — ค่าตัวอย่าง) ลองใหม่ เปลี่ยนช่องทาง หรือเปลี่ยนเป็นโอนเงิน
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <button type="button" onClick={() => setStage("ready")} className={btn("primary")}>ลองชำระอีกครั้ง</button>
          <Link href="/checkout/payment/transfer" className={btn("outline")}>เปลี่ยนเป็นโอนเงิน + แนบสลิป</Link>
        </div>
      </div>
    );
  }

  const processing = stage === "processing";
  const opt = (c: typeof channel) =>
    `flex cursor-pointer items-center gap-3 rounded-lg p-3 text-sm ${channel === c ? "border-2 border-brand bg-brand-soft" : "border border-line"}`;

  return (
    <div className="grid gap-4">
      <fieldset className="grid gap-2" disabled={processing}>
        <legend className="mb-2 font-bold">เลือกช่องทาง</legend>
        <label className={opt("qr")}>
          <input type="radio" name="ch" checked={channel === "qr"} onChange={() => setChannel("qr")} className="size-5 accent-brand" />
          <span><strong>QR พร้อมเพย์</strong> — สแกนจากแอปธนาคาร</span>
        </label>
        <label className={opt("card")}>
          <input type="radio" name="ch" checked={channel === "card"} onChange={() => setChannel("card")} className="size-5 accent-brand" />
          <span><strong>บัตรเครดิต / เดบิต</strong> — กรอกข้อมูลบัตรในหน้าของผู้ให้บริการ</span>
        </label>
      </fieldset>

      <div className="grid place-items-center rounded-lg border border-dashed border-line bg-surface p-6 text-center text-sm text-muted">
        {channel === "qr" ? (
          <>
            <div aria-hidden className="grid size-40 place-items-center rounded bg-white text-xs ring-1 ring-line">QR ตัวอย่าง</div>
            <p className="mt-2">พื้นที่แสดง QR จากผู้ให้บริการ (Demo — สแกนไม่ได้)</p>
          </>
        ) : (
          <p>ระบบจะพาไปหน้าชำระเงินของผู้ให้บริการ ร้านไม่เก็บข้อมูลบัตรของคุณ</p>
        )}
      </div>

      {processing ? (
        <p role="status" className="flex items-center justify-center gap-3 rounded-md bg-brand-soft p-3 text-brand">
          <span aria-hidden className="size-5 animate-spin rounded-full border-2 border-brand/30 border-t-brand" />
          กำลังตรวจสอบการชำระเงิน… กรุณาอย่าปิดหน้านี้
        </p>
      ) : (
        <div className="grid gap-2 rounded-md border border-warn/30 bg-warn-soft p-3">
          <p className="text-sm font-semibold text-warn">ปุ่มจำลองผลลัพธ์ (Demo)</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <button type="button" onClick={() => simulate("success")} className={btn("primary")}>จำลอง: ชำระสำเร็จ {formatBaht(amount)}</button>
            <button type="button" onClick={() => simulate("failed")} className={btn("danger")}>จำลอง: ชำระไม่สำเร็จ</button>
          </div>
        </div>
      )}
    </div>
  );
}
