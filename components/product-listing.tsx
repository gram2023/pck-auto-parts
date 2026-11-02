import Link from "next/link";
import {
  getMake,
  getVehicle,
  getVehicleCatalog,
  parseVehicleParams,
  searchProducts,
  type ProductFilters,
  type SearchResult,
} from "@/lib/catalog";
import { CHECK_WITH_STORE } from "@/lib/fitment";
import { positionLabel, stockLabel, typeLabel } from "@/lib/format";
import type { Position, ProductType, StockStatus, VehicleSelection } from "@/lib/types";
import { ApplyMyVehicle } from "./apply-my-vehicle";
import { ProductCard } from "./product-card";

type SP = Record<string, string | string[] | undefined>;

const list = (v: string | string[] | undefined) => (v == null ? [] : Array.isArray(v) ? v : [v]);
const one = (v: string | string[] | undefined) => list(v)[0];
const num = (v: string | string[] | undefined) => {
  const n = Number(one(v));
  return one(v) && Number.isFinite(n) ? n : undefined;
};

function parseFilters(sp: SP, category?: string): ProductFilters {
  const sort = one(sp.sort);
  return {
    q: one(sp.q),
    category,
    brands: list(sp.brand),
    types: list(sp.type) as ProductType[],
    positions: list(sp.pos) as Position[],
    stock: list(sp.stock) as StockStatus[],
    priceMin: num(sp.min),
    priceMax: num(sp.max),
    vehicle: parseVehicleParams(sp),
    sort: sort === "price_asc" || sort === "price_desc" ? sort : "relevance",
  };
}

function vehicleText(v: VehicleSelection) {
  const make = getMake(v.makeId)?.name ?? v.makeId;
  const engine = v.vehicleId ? getVehicle(v.vehicleId)?.engine : "ไม่ทราบเครื่องยนต์";
  return `${make} ${v.model} ปี ${v.year} · ${engine}`;
}

export async function ProductListing({
  searchParams,
  category,
  basePath,
}: {
  searchParams: Promise<SP>;
  category?: string;
  basePath: string;
}) {
  const sp = await searchParams;
  const f = parseFilters(sp, category);
  const result = await searchProducts(f);
  const total = result.hits.length + result.unverified.length;

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <Filters f={f} sp={sp} facets={result.facets} basePath={basePath} />

      <div className="min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
          <p className="text-sm text-ink-soft">
            {f.q && <>ผลการค้นหา “<strong className="text-ink">{f.q}</strong>” · </>}
            พบ <strong className="text-ink">{total}</strong> รายการ
          </p>
          {f.vehicle && (
            <p className="rounded-full bg-brand-soft px-3 py-1 text-sm text-brand">
              กรองตามรถ: <strong>{vehicleText(f.vehicle)}</strong>{" "}
              <Link href={withoutVehicle(basePath, sp)} className="ml-1 text-muted hover:text-bad">✕ ไม่กรองตามรถ</Link>
            </p>
          )}
        </div>

        {!f.vehicle && <ApplyMyVehicle href={withoutVehicle(basePath, sp)} catalog={await getVehicleCatalog()} />}

        {f.vehicle && !f.vehicle.vehicleId && (
          <p className="mt-4 rounded-md border border-info/25 bg-info-soft p-3 text-sm text-info">
            คุณยังไม่ได้ระบุเครื่องยนต์ ระบบจึงยืนยันความเข้ากันได้ไม่ได้ — {CHECK_WITH_STORE}
          </p>
        )}

        {total === 0 ? (
          <Empty q={f.q} />
        ) : (
          <>
            {result.hits.length > 0 && (
              <section className="mt-4">
                {f.vehicle && <h2 className="mb-3 font-semibold text-ok">มีข้อมูลยืนยันว่ารองรับรถของคุณ ({result.hits.length})</h2>}
                <Grid hits={result.hits} vehicle={f.vehicle} />
              </section>
            )}
            {result.unverified.length > 0 && (
              <section className="mt-8">
                <h2 className="font-semibold text-info">อาจใช้ได้ — {CHECK_WITH_STORE} ({result.unverified.length})</h2>
                <p className="mb-3 text-sm text-muted">ยังไม่มีข้อมูลอ้างอิงสำหรับรถคันนี้ หรือข้อมูลรถยังไม่ครบ</p>
                <Grid hits={result.unverified} vehicle={f.vehicle} />
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Grid({ hits, vehicle }: { hits: SearchResult["hits"]; vehicle: VehicleSelection | null | undefined }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
      {hits.map((h) => <ProductCard key={h.product.slug} hit={h} vehicle={vehicle} />)}
    </div>
  );
}

function Empty({ q }: { q?: string }) {
  return (
    <div className="mt-6 rounded-lg border border-dashed border-line p-8 text-center">
      <p className="font-semibold">ไม่พบสินค้าที่ตรงกับเงื่อนไข</p>
      <p className="mt-1 text-sm text-muted">
        ลองลดตัวกรอง ตรวจสอบการสะกด หรือส่งคำถามให้ร้านช่วยหา{q ? <> สำหรับ “{q}”</> : null}
      </p>
      <p className="mt-3 text-sm text-muted">(แบบฟอร์มสอบถามร้านจะเปิดใช้ในเฟสถัดไป)</p>
    </div>
  );
}

function withoutVehicle(basePath: string, sp: SP) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (["make", "model", "year", "engine"].includes(k)) continue;
    for (const x of list(v)) p.append(k, x);
  }
  const s = p.toString();
  return s ? `${basePath}?${s}` : basePath;
}

function Filters({ f, sp, facets, basePath }: { f: ProductFilters; sp: SP; facets: SearchResult["facets"]; basePath: string }) {
  const keep = ["q", "make", "model", "year", "engine"];
  const box = "size-4 rounded border-line accent-brand";
  const group = "border-t border-line pt-3";
  const legend = "mb-1.5 text-sm font-semibold text-ink";

  return (
    <details open className="group h-fit rounded-lg border border-line bg-white lg:sticky lg:top-44 [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex cursor-pointer items-center justify-between px-4 py-3 font-semibold lg:cursor-default">
        ตัวกรอง
        <span className="text-sm font-normal text-muted lg:hidden">แตะเพื่อเปิด/ปิด</span>
      </summary>
      <form action={basePath} className="grid gap-3 px-4 pb-4 text-sm">
        {keep.map((k) => one(sp[k]) && <input key={k} type="hidden" name={k} value={one(sp[k])} />)}

        <label className="grid gap-1">
          <span className="font-semibold">เรียงตาม</span>
          <select name="sort" defaultValue={f.sort} className="h-10 rounded-md border border-line px-2">
            <option value="relevance">แนะนำ (พร้อมส่งก่อน)</option>
            <option value="price_asc">ราคาต่ำ → สูง</option>
            <option value="price_desc">ราคาสูง → ต่ำ</option>
          </select>
        </label>

        {facets.brands.length > 0 && (
          <fieldset className={group}>
            <legend className={legend}>แบรนด์ผู้ผลิตอะไหล่</legend>
            {facets.brands.map((b) => (
              <label key={b.id} className="flex items-center gap-2 py-0.5">
                <input type="checkbox" name="brand" value={b.id} defaultChecked={f.brands?.includes(b.id)} className={box} />
                {b.name} <span className="text-muted">({b.count})</span>
              </label>
            ))}
          </fieldset>
        )}

        {facets.types.length > 0 && (
          <fieldset className={group}>
            <legend className={legend}>ประเภทสินค้า</legend>
            {facets.types.map((t) => (
              <label key={t.id} className="flex items-center gap-2 py-0.5">
                <input type="checkbox" name="type" value={t.id} defaultChecked={f.types?.includes(t.id)} className={box} />
                {typeLabel[t.id]} <span className="text-muted">({t.count})</span>
              </label>
            ))}
          </fieldset>
        )}

        {facets.positions.length > 0 && (
          <fieldset className={group}>
            <legend className={legend}>ตำแหน่งติดตั้ง</legend>
            <div className="grid grid-cols-2">
              {facets.positions.map((p) => (
                <label key={p.id} className="flex items-center gap-2 py-0.5">
                  <input type="checkbox" name="pos" value={p.id} defaultChecked={f.positions?.includes(p.id)} className={box} />
                  {positionLabel[p.id]} <span className="text-muted">({p.count})</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {facets.stock.length > 0 && (
          <fieldset className={group}>
            <legend className={legend}>สถานะสินค้า</legend>
            {facets.stock.map((s) => (
              <label key={s.id} className="flex items-center gap-2 py-0.5">
                <input type="checkbox" name="stock" value={s.id} defaultChecked={f.stock?.includes(s.id)} className={box} />
                {stockLabel[s.id]} <span className="text-muted">({s.count})</span>
              </label>
            ))}
          </fieldset>
        )}

        <fieldset className={group}>
          <legend className={legend}>ช่วงราคา (บาท)</legend>
          <div className="flex items-center gap-2">
            <input type="number" name="min" min={0} inputMode="numeric" placeholder="ต่ำสุด" defaultValue={f.priceMin}
              aria-label="ราคาต่ำสุด" className="h-10 w-full rounded-md border border-line px-2" />
            <span aria-hidden>–</span>
            <input type="number" name="max" min={0} inputMode="numeric" placeholder="สูงสุด" defaultValue={f.priceMax}
              aria-label="ราคาสูงสุด" className="h-10 w-full rounded-md border border-line px-2" />
          </div>
        </fieldset>

        <div className="flex gap-2 pt-1">
          <button type="submit" className="h-10 flex-1 rounded-md bg-brand font-semibold text-white hover:bg-brand-strong">ใช้ตัวกรอง</button>
          <Link href={withoutFilters(basePath, sp, keep)} className="grid h-10 place-items-center rounded-md border border-line px-3 text-ink-soft hover:bg-surface">
            ล้าง
          </Link>
        </div>
      </form>
    </details>
  );
}

function withoutFilters(basePath: string, sp: SP, keep: string[]) {
  const p = new URLSearchParams();
  for (const k of keep) {
    const v = one(sp[k]);
    if (v) p.set(k, v);
  }
  const s = p.toString();
  return s ? `${basePath}?${s}` : basePath;
}
