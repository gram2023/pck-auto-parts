"use client";

import { useRouter } from "next/navigation";
import { useId, useMemo, useState } from "react";
import { saveVehicle, useSelectedVehicle } from "@/lib/vehicle-store";
import { vehicleQuery, type VehicleCatalog } from "@/lib/vehicle";
import { bodyTypeLabel } from "@/lib/format";
import type { VehicleSelection } from "@/lib/types";

const UNKNOWN = "__unknown";

type Props = {
  catalog: VehicleCatalog;
  /** หน้าที่จะพาไปหลังเลือกรถ (ค่าเริ่มต้น /search) */
  targetPath?: string;
  layout?: "stack" | "row";
};

export function VehicleSelector({ catalog, targetPath = "/search", layout = "stack" }: Props) {
  const saved = useSelectedVehicle();
  const router = useRouter();
  const id = useId();

  // ค่าที่ผู้ใช้เลือกในฟอร์ม (null = ยังไม่แตะ ให้ใช้ค่าจากรถที่บันทึกไว้)
  const [draft, setDraft] = useState<{ make: string; model: string; year: string; engine: string } | null>(null);
  const form = draft ?? {
    make: saved?.makeId ?? "",
    model: saved?.model ?? "",
    year: saved ? String(saved.year) : "",
    engine: saved ? (saved.vehicleId ?? UNKNOWN) : "",
  };

  // เรียงตามลำดับในข้อมูล (ร้านกำหนดลำดับเองได้) — Map เก็บลำดับที่ใส่ไว้
  const models = useMemo(() => {
    const m = new Map<string, { name: string; label: string; body: string }>();
    for (const v of catalog.vehicles) {
      if (v.makeId !== form.make || m.has(v.model)) continue;
      m.set(v.model, {
        name: v.model,
        label: v.modelTh ? `${v.model} (${v.modelTh})` : v.model,
        body: bodyTypeLabel[v.bodyType],
      });
    }
    return [...m.values()];
  }, [catalog.vehicles, form.make]);

  const years = useMemo(() => {
    const ys = new Set<number>();
    for (const v of catalog.vehicles) {
      if (v.makeId !== form.make || v.model !== form.model) continue;
      for (let y = v.yearFrom; y <= v.yearTo; y++) ys.add(y);
    }
    return [...ys].sort((a, b) => b - a);
  }, [catalog.vehicles, form.make, form.model]);

  const engines = useMemo(() => {
    const y = Number(form.year);
    return catalog.vehicles.filter(
      (v) => v.makeId === form.make && v.model === form.model && y >= v.yearFrom && y <= v.yearTo,
    );
  }, [catalog.vehicles, form.make, form.model, form.year]);

  const set = (patch: Partial<typeof form>) => setDraft({ ...form, ...patch });
  const ready = form.make && form.model && form.year && form.engine;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!ready) return;
    const sel: VehicleSelection = {
      makeId: form.make,
      model: form.model,
      year: Number(form.year),
      vehicleId: form.engine === UNKNOWN ? null : form.engine,
    };
    saveVehicle(sel);
    router.push(`${targetPath}?${vehicleQuery(sel)}`);
  }

  const field = "flex flex-col gap-1";
  const select =
    "h-11 w-full rounded-md border border-line bg-white px-3 text-[15px] text-ink disabled:bg-surface disabled:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";
  const label = "text-sm font-medium text-ink-soft";

  return (
    <form
      onSubmit={submit}
      className={layout === "row" ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto] lg:items-end" : "grid gap-3"}
    >
      <div className={field}>
        <label htmlFor={`${id}-make`} className={label}>1. ยี่ห้อรถ</label>
        <select id={`${id}-make`} className={select} value={form.make}
          onChange={(e) => set({ make: e.target.value, model: "", year: "", engine: "" })}>
          <option value="">เลือกยี่ห้อ</option>
          {catalog.makes.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.nameTh})</option>)}
        </select>
      </div>

      <div className={field}>
        <label htmlFor={`${id}-model`} className={label}>2. รุ่น</label>
        <select id={`${id}-model`} className={select} value={form.model} disabled={!form.make}
          onChange={(e) => set({ model: e.target.value, year: "", engine: "" })}>
          <option value="">เลือกรุ่น</option>
          {models.map((m) => <option key={m.name} value={m.name}>{m.label} · {m.body}</option>)}
        </select>
      </div>

      <div className={field}>
        <label htmlFor={`${id}-year`} className={label}>3. ปี</label>
        <select id={`${id}-year`} className={select} value={form.year} disabled={!form.model}
          onChange={(e) => set({ year: e.target.value, engine: "" })}>
          <option value="">เลือกปี</option>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className={field}>
        <label htmlFor={`${id}-engine`} className={label}>4. เครื่องยนต์</label>
        <select id={`${id}-engine`} className={select} value={form.engine} disabled={!form.year}
          onChange={(e) => set({ engine: e.target.value })}>
          <option value="">เลือกเครื่องยนต์</option>
          {engines.map((v) => <option key={v.id} value={v.id}>{v.engine}</option>)}
          <option value={UNKNOWN}>ไม่ทราบเครื่องยนต์</option>
        </select>
      </div>

      <button type="submit" disabled={!ready}
        className="h-11 rounded-md bg-accent px-6 font-semibold text-white shadow-sm transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:bg-line disabled:text-muted">
        ค้นหาอะไหล่
      </button>
      {form.engine === UNKNOWN && (
        <p className={`text-sm text-warn ${layout === "row" ? "sm:col-span-2 lg:col-span-5" : ""}`}>
          ไม่ทราบเครื่องยนต์: ระบบจะแสดงสินค้าทั้งหมดแต่ยืนยันความเข้ากันได้ไม่ได้ กรุณาตรวจสอบกับร้านก่อนสั่งซื้อ
        </p>
      )}
    </form>
  );
}
