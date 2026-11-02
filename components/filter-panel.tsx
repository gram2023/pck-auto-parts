"use client";

import { useState } from "react";

/** มือถือ: ปุ่มเปิด/ปิดตัวกรอง (ปิดไว้ก่อน) · จอใหญ่ (lg): แสดงเป็นแถบด้านซ้ายตลอด */
export function FilterPanel({ activeCount, children }: { activeCount: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="h-fit rounded-lg border border-line bg-white lg:sticky lg:top-44">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="filter-body"
        className="flex h-12 w-full items-center justify-between px-4 font-semibold lg:hidden"
      >
        <span>☰ ตัวกรองและการเรียง{activeCount > 0 && <span className="ml-2 rounded-full bg-brand px-2 py-0.5 text-xs text-white">{activeCount}</span>}</span>
        <span className="text-sm font-normal text-muted">{open ? "ปิด ▲" : "เปิด ▼"}</span>
      </button>
      <p className="hidden px-4 pt-3 font-semibold lg:block">ตัวกรองและการเรียง</p>
      <div id="filter-body" className={open ? "block" : "hidden lg:block"}>
        {children}
      </div>
    </div>
  );
}
