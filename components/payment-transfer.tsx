"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { demoBank } from "@/lib/demo-orders";
import { formatBaht } from "@/lib/format";
import { btn, errorCls, hintCls, inputCls, labelCls } from "@/lib/ui";

const MAX_MB = 5;
const ACCEPT = ["image/jpeg", "image/png", "application/pdf"];

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line py-2.5 last:border-b-0">
      <div className="min-w-0">
        <dt className="text-xs text-muted">{label}</dt>
        <dd className="code break-all font-semibold">{value}</dd>
      </div>
      <button type="button" className={btn("ghost", "sm")}
        onClick={() => {
          navigator.clipboard?.writeText(value).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }, () => {});
        }}>
        {copied ? "✓ คัดลอกแล้ว" : "คัดลอก"}
      </button>
    </div>
  );
}

export function PaymentTransfer({ amount, orderNo }: { amount: number; orderNo: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ file?: string; when?: string; amount?: string }>({});
  const [stage, setStage] = useState<"form" | "uploading" | "sent">("form");

  // คืนหน่วยความจำของรูปตัวอย่างเมื่อเปลี่ยนไฟล์หรือออกจากหน้า
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  function pick(f: File | null) {
    const accept = (next: File | null, err?: string) => {
      setErrors((e) => ({ ...e, file: err }));
      setFile(next);
      setPreview(next && next.type.startsWith("image/") ? URL.createObjectURL(next) : null);
    };
    if (!f) return accept(null);
    if (!ACCEPT.includes(f.type)) return accept(null, "รองรับเฉพาะไฟล์ JPG, PNG หรือ PDF");
    if (f.size > MAX_MB * 1024 * 1024) return accept(null, `ไฟล์ใหญ่เกิน ${MAX_MB} MB`);
    accept(f);
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const errs: typeof errors = {};
    if (!file) errs.file = errors.file ?? "กรุณาแนบสลิปการโอนเงิน";
    if (!fd.get("when")) errs.when = "กรุณาระบุวันและเวลาที่โอน";
    const paid = Number(fd.get("paid"));
    if (!paid) errs.amount = "กรุณากรอกยอดที่โอน";
    else if (paid !== amount) errs.amount = `ยอดที่โอนไม่ตรงกับยอดที่ต้องชำระ (${formatBaht(amount)}) — ถ้าโอนผิดยอด กรุณาติดต่อร้าน`;
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setStage("uploading");
    setTimeout(() => setStage("sent"), 1200);
  }

  if (stage === "sent") {
    return (
      <div role="status" className="rounded-lg border border-info/30 bg-info-soft p-6 text-center">
        <p aria-hidden className="mx-auto grid size-12 place-items-center rounded-full bg-info text-2xl text-white">⏳</p>
        <p className="mt-3 text-lg font-bold text-info">ส่งสลิปแล้ว — รอร้านตรวจสอบ</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-ink-soft">
          คำสั่งซื้อ <span className="code">{orderNo}</span> · ร้านจะตรวจสอบภายในเวลาทำการ และแจ้งผลทาง SMS/อีเมล (ระยะเวลา: รอข้อมูลจากร้าน)
        </p>
        <Link href="/order/DEMO-1002" className={btn("primary", "md", "mt-5")}>ดูสถานะคำสั่งซื้อ</Link>
      </div>
    );
  }

  const uploading = stage === "uploading";

  return (
    <div className="grid gap-6">
      <section aria-labelledby="bank-h" className="rounded-lg border border-line p-4">
        <h2 id="bank-h" className="font-bold">ขั้นที่ 1 — โอนเงินเข้าบัญชีร้าน</h2>
        <p className="mt-1 text-sm text-ink-soft">
          ยอดที่ต้องโอน <strong className="text-xl text-ink">{formatBaht(amount)}</strong> <span className="text-muted">(โอนให้ตรงยอด เพื่อให้ตรวจได้เร็ว)</span>
        </p>
        <dl className="mt-3">
          <CopyRow label="ธนาคาร" value={demoBank.bank} />
          <CopyRow label="ชื่อบัญชี" value={demoBank.accountName} />
          <CopyRow label="เลขที่บัญชี" value={demoBank.accountNo} />
          <CopyRow label="พร้อมเพย์" value={demoBank.promptPay} />
        </dl>
        <p className="mt-3 text-sm text-warn">⚠ บัญชีตัวอย่าง ห้ามโอนเงินจริง · กรุณาชำระภายใน 24 ชั่วโมง (ค่าตัวอย่าง) มิฉะนั้นคำสั่งซื้อจะถูกยกเลิก</p>
      </section>

      <form onSubmit={submit} noValidate className="grid gap-4 rounded-lg border border-line p-4">
        <h2 className="font-bold">ขั้นที่ 2 — แนบสลิปการโอน</h2>

        <div className="grid gap-1">
          <label htmlFor="slip" className={labelCls}>ไฟล์สลิป <span className="text-bad">*</span></label>
          <label htmlFor="slip"
            className={`grid cursor-pointer place-items-center gap-1 rounded-lg border-2 border-dashed p-6 text-center text-sm ${
              errors.file ? "border-bad bg-bad-soft" : file ? "border-ok bg-ok-soft" : "border-line bg-surface hover:border-brand"
            }`}>
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="ตัวอย่างสลิปที่เลือก" className="max-h-56 rounded shadow" />
            ) : (
              <span aria-hidden className="text-3xl">📎</span>
            )}
            {file ? (
              <span className="font-semibold text-ok">✓ {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB) — แตะเพื่อเปลี่ยนไฟล์</span>
            ) : (
              <span><strong className="text-brand">แตะเพื่อเลือกรูปสลิป</strong> หรือถ่ายรูป</span>
            )}
          </label>
          <input id="slip" type="file" accept={ACCEPT.join(",")} className="sr-only" disabled={uploading}
            aria-invalid={errors.file ? true : undefined} aria-describedby="slip-hint slip-err"
            onChange={(e) => pick(e.target.files?.[0] ?? null)} />
          <p id="slip-hint" className={hintCls}>JPG, PNG หรือ PDF ไม่เกิน {MAX_MB} MB · ต้องเห็นยอดเงิน วันเวลา และเลขอ้างอิงชัดเจน</p>
          {errors.file && <p id="slip-err" className={errorCls}>✕ {errors.file}</p>}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1">
            <label htmlFor="when" className={labelCls}>วันและเวลาที่โอน <span className="text-bad">*</span></label>
            <input id="when" name="when" type="datetime-local" className={inputCls} aria-invalid={errors.when ? true : undefined} />
            {errors.when && <p className={errorCls}>✕ {errors.when}</p>}
          </div>
          <div className="grid gap-1">
            <label htmlFor="paid" className={labelCls}>ยอดที่โอน (บาท) <span className="text-bad">*</span></label>
            <input id="paid" name="paid" type="number" inputMode="decimal" className={inputCls} placeholder={String(amount)}
              aria-invalid={errors.amount ? true : undefined} />
            {errors.amount && <p className={errorCls}>✕ {errors.amount}</p>}
          </div>
        </div>

        <button type="submit" disabled={uploading} className={btn("primary", "lg")}>
          {uploading ? "กำลังอัปโหลดสลิป…" : "ส่งสลิปให้ร้านตรวจสอบ"}
        </button>
        <p className="text-center text-xs text-muted">โอนแล้วแต่ยังไม่สะดวกแนบตอนนี้? แนบภายหลังได้จากหน้าสถานะคำสั่งซื้อ</p>
      </form>
    </div>
  );
}
