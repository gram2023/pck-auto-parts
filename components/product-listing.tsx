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
import { positionLabel, stockLabel, typeLabel } from "@/lib/format";
import type { Position, ProductType, StockStatus, VehicleSelection } from "@/lib/types";
import { btn, inputCls } from "@/lib/ui";
import { ApplyMyVehicle } from "./apply-my-vehicle";
import { fitmentText } from "./fitment-badge";
import { FilterPanel } from "./filter-panel";
import { ProductCard } from "./product-card";

type SP = Record<string, string | string[] | undefined>;

const list = (v: string | string[] | undefined) => (v == null ? [] : Array.isArray(v) ? v : [v]);
const one = (v: string | string[] | undefined) => list(v)[0];
const num = (v: string | string[] | undefined) => {
  const n = Number(one(v));
  return one(v) && Number.isFinite(n) ? n : undefined;
};
const VEHICLE_KEYS = ["make", "model", "year", "engine"];

function parseFilters(sp: SP, category?: string): ProductFilters {
  const sort = one(sp.sort);
  return {
    q: one(sp.q),
    category,
    categories: category ? [] : list(sp.cat),
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

/** สร้าง URL ใหม่โดยตัดบางค่าออก */
function hrefWithout(basePath: string, sp: SP, drop: (key: string, value: string) => boolean) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) for (const x of list(v)) if (!drop(k, x)) p.append(k, x);
  const s = p.toString();
  return s ? `${basePath}?${s}` : basePath;
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
  const total = result.hits.length + result.unverified.length + result.notFit.length;
  const chips = activeChips(sp, result.facets, basePath);

  return (
    <div className="grid gap-4 lg:grid-cols-[260px_1fr] lg:gap-6">
      <Filters f={f} sp={sp} facets={result.facets} basePath={basePath} />

      <div className="min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
          <p className="text-sm text-ink-soft" aria-live="polite">
            {f.q && <>ผลการค้นหา “<strong className="text-ink">{f.q}</strong>” · </>}
            พบ <strong className="text-ink">{total}</strong> รายการ
          </p>
        </div>

        {/* แถบรถที่ใช้กรอง: แก้ไข / ยกเลิกได้ทันที */}
        {f.vehicle ? (
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-brand/20 bg-brand-soft px-3 py-2 text-sm">
            <span className="text-ink-soft">กรองตามรถ:</span>
            <strong className="text-brand">{vehicleText(f.vehicle)}</strong>
            <span className="ml-auto flex gap-1">
              <Link href="/#vehicle" className={btn("ghost", "sm")}>แก้ไขรถ</Link>
              <Link href={hrefWithout(basePath, sp, (k) => VEHICLE_KEYS.includes(k))} className={btn("ghost", "sm", "text-bad hover:bg-bad-soft")}>
                ✕ ยกเลิกการกรองตามรถ
              </Link>
            </span>
          </div>
        ) : (
          <ApplyMyVehicle href={hrefWithout(basePath, sp, (k) => VEHICLE_KEYS.includes(k))} catalog={await getVehicleCatalog()} />
        )}

        {chips.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2" aria-label="ตัวกรองที่ใช้อยู่">
            {chips.map((c) => (
              <li key={c.key}>
                <Link href={c.href} className="inline-flex items-center gap-1 rounded-full border border-line bg-white px-3 py-1 text-sm hover:border-bad hover:text-bad">
                  {c.label} <span aria-hidden>✕</span><span className="sr-only">ลบตัวกรองนี้</span>
                </Link>
              </li>
            ))}
            <li>
              <Link href={hrefWithout(basePath, sp, (k) => !["q", ...VEHICLE_KEYS].includes(k))} className="inline-flex px-2 py-1 text-sm text-brand hover:underline">
                ล้างทั้งหมด
              </Link>
            </li>
          </ul>
        )}

        {f.vehicle && !f.vehicle.vehicleId && (
          <p className="mt-3 rounded-md border border-info/30 bg-info-soft p-3 text-sm text-info">
            <strong>? ยังไม่ได้ระบุเครื่องยนต์</strong> — ระบบยืนยันความเข้ากันได้ไม่ได้ สินค้าทั้งหมดจึงอยู่ในกลุ่ม “ข้อมูลไม่เพียงพอ”
          </p>
        )}

        {total === 0 ? (
          <Empty q={f.q} hasFilters={chips.length > 0} clearHref={hrefWithout(basePath, sp, (k) => k !== "q")} />
        ) : f.vehicle ? (
          <>
            <Group state="fits" hits={result.hits} vehicle={f.vehicle} />
            <Group state="unknown" hits={result.unverified} vehicle={f.vehicle}
              note="ยังไม่มีข้อมูลอ้างอิงสำหรับรถคันนี้ หรือข้อมูลรถยังไม่ครบ" />
            <Group state="not_fit" hits={result.notFit} vehicle={f.vehicle} collapsed
              note="มีข้อมูลอ้างอิงว่าใช้กับรถคันนี้ไม่ได้ แสดงไว้เพื่อให้ตรวจสอบได้" />
          </>
        ) : (
          <div className="mt-4"><Grid hits={result.hits} /></div>
        )}
      </div>
    </div>
  );
}

function Group({ state, hits, vehicle, note, collapsed }: {
  state: keyof typeof fitmentText;
  hits: SearchResult["hits"];
  vehicle: VehicleSelection;
  note?: string;
  collapsed?: boolean;
}) {
  if (hits.length === 0) return null;
  const t = fitmentText[state];
  const heading = (
    <span className="flex items-center gap-2">
      <span aria-hidden className={`grid size-6 place-items-center rounded-full border text-sm font-bold ${t.cls}`}>{t.icon}</span>
      <span><strong>{t.title}</strong> — {t.detail} ({hits.length})</span>
    </span>
  );
  if (collapsed) {
    return (
      <details className="mt-8 rounded-lg border border-line">
        <summary className="cursor-pointer px-4 py-3 text-ink-soft">{heading}</summary>
        <div className="px-4 pb-4">
          {note && <p className="mb-3 text-sm text-muted">{note}</p>}
          <Grid hits={hits} vehicle={vehicle} />
        </div>
      </details>
    );
  }
  return (
    <section className="mt-6">
      <h2 className="text-ink">{heading}</h2>
      {note && <p className="mt-1 text-sm text-muted">{note}</p>}
      <div className="mt-3"><Grid hits={hits} vehicle={vehicle} /></div>
    </section>
  );
}

function Grid({ hits, vehicle }: { hits: SearchResult["hits"]; vehicle?: VehicleSelection | null }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
      {hits.map((h) => <ProductCard key={h.product.slug} hit={h} vehicle={vehicle} />)}
    </div>
  );
}

export function Empty({ q, hasFilters, clearHref }: { q?: string; hasFilters?: boolean; clearHref?: string }) {
  return (
    <div className="mt-6 rounded-lg border border-dashed border-line px-4 py-10 text-center">
      <p aria-hidden className="text-4xl">🔍</p>
      <p className="mt-2 text-lg font-semibold">ไม่พบสินค้าที่ตรงกับเงื่อนไข</p>
      <ul className="mx-auto mt-2 max-w-md text-left text-sm text-ink-soft [&>li]:ml-5 [&>li]:list-disc">
        <li>ตรวจสอบการสะกด หรือพิมพ์หมายเลขอะไหล่โดยไม่ต้องใส่ขีด</li>
        {hasFilters && <li>ลองลดตัวกรองที่เลือกไว้</li>}
        <li>ส่งรุ่นรถหรือรูปอะไหล่เดิมให้ร้านช่วยหาให้</li>
      </ul>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {hasFilters && clearHref && <Link href={clearHref} className={btn("outline")}>ล้างตัวกรอง</Link>}
        <Link href={`/fitment-inquiry${q ? `?q=${encodeURIComponent(q)}` : ""}`} className={btn("secondary")}>
          ให้ร้านช่วยหา{q ? ` “${q}”` : ""}
        </Link>
      </div>
    </div>
  );
}

function activeChips(sp: SP, facets: SearchResult["facets"], basePath: string) {
  const name = (k: string, v: string) => {
    if (k === "cat") return facets.categories.find((x) => x.id === v)?.name ?? v;
    if (k === "brand") return facets.brands.find((x) => x.id === v)?.name ?? v;
    if (k === "type") return typeLabel[v as ProductType] ?? v;
    if (k === "pos") return `ตำแหน่ง${positionLabel[v as Position] ?? v}`;
    if (k === "stock") return stockLabel[v as StockStatus] ?? v;
    if (k === "min") return `ตั้งแต่ ${v} บาท`;
    if (k === "max") return `ไม่เกิน ${v} บาท`;
    return null;
  };
  const out: { key: string; label: string; href: string }[] = [];
  for (const [k, v] of Object.entries(sp)) {
    for (const x of list(v)) {
      const label = x ? name(k, x) : null;
      if (label) out.push({ key: `${k}=${x}`, label, href: hrefWithout(basePath, sp, (kk, vv) => kk === k && vv === x) });
    }
  }
  return out;
}

function Filters({ f, sp, facets, basePath }: { f: ProductFilters; sp: SP; facets: SearchResult["facets"]; basePath: string }) {
  const keep = ["q", ...VEHICLE_KEYS];
  const box = "size-5 shrink-0 rounded border-line accent-brand";
  const group = "border-t border-line pt-3";
  const legend = "mb-1 text-sm font-semibold text-ink";
  const row = "flex min-h-9 items-center gap-2.5";

  const Check = ({ name, value, checked, children }: { name: string; value: string; checked?: boolean; children: React.ReactNode }) => (
    <label className={row}>
      <input type="checkbox" name={name} value={value} defaultChecked={checked} className={box} />
      <span>{children}</span>
    </label>
  );

  const activeCount = (["cat", "brand", "type", "pos", "stock", "min", "max"] as const)
    .reduce((n, k) => n + list(sp[k]).filter(Boolean).length, 0);

  return (
    <FilterPanel activeCount={activeCount}>
      <form action={basePath} className="grid gap-3 px-4 pb-4 pt-2 text-sm">
        {keep.map((k) => one(sp[k]) && <input key={k} type="hidden" name={k} value={one(sp[k])} />)}

        <label className="grid gap-1">
          <span className="font-semibold">เรียงตาม</span>
          <select name="sort" defaultValue={f.sort} className={inputCls}>
            <option value="relevance">แนะนำ (พร้อมส่งก่อน)</option>
            <option value="price_asc">ราคาต่ำ → สูง</option>
            <option value="price_desc">ราคาสูง → ต่ำ</option>
          </select>
        </label>

        {facets.categories.length > 0 && (
          <fieldset className={group}>
            <legend className={legend}>หมวดหมู่</legend>
            {facets.categories.map((c) => (
              <Check key={c.id} name="cat" value={c.id} checked={f.categories?.includes(c.id)}>
                {c.name} <span className="text-muted">({c.count})</span>
              </Check>
            ))}
          </fieldset>
        )}

        {facets.brands.length > 0 && (
          <fieldset className={group}>
            <legend className={legend}>แบรนด์ผู้ผลิตอะไหล่</legend>
            {facets.brands.map((b) => (
              <Check key={b.id} name="brand" value={b.id} checked={f.brands?.includes(b.id)}>
                {b.name} <span className="text-muted">({b.count})</span>
              </Check>
            ))}
          </fieldset>
        )}

        <fieldset className={group}>
          <legend className={legend}>ช่วงราคา (บาท)</legend>
          <div className="flex items-center gap-2">
            <input type="number" name="min" min={0} inputMode="numeric" placeholder="ต่ำสุด" defaultValue={f.priceMin}
              aria-label="ราคาต่ำสุด" className={inputCls} />
            <span aria-hidden>–</span>
            <input type="number" name="max" min={0} inputMode="numeric" placeholder="สูงสุด" defaultValue={f.priceMax}
              aria-label="ราคาสูงสุด" className={inputCls} />
          </div>
        </fieldset>

        {facets.types.length > 0 && (
          <fieldset className={group}>
            <legend className={legend}>ประเภทสินค้า</legend>
            {facets.types.map((t) => (
              <Check key={t.id} name="type" value={t.id} checked={f.types?.includes(t.id)}>
                {typeLabel[t.id]} <span className="text-muted">({t.count})</span>
              </Check>
            ))}
          </fieldset>
        )}

        {facets.stock.length > 0 && (
          <fieldset className={group}>
            <legend className={legend}>สถานะสินค้า</legend>
            {facets.stock.map((s) => (
              <Check key={s.id} name="stock" value={s.id} checked={f.stock?.includes(s.id)}>
                {stockLabel[s.id]} <span className="text-muted">({s.count})</span>
              </Check>
            ))}
          </fieldset>
        )}

        {facets.positions.length > 0 && (
          <fieldset className={group}>
            <legend className={legend}>ตำแหน่งติดตั้ง</legend>
            <div className="grid grid-cols-2">
              {facets.positions.map((p) => (
                <Check key={p.id} name="pos" value={p.id} checked={f.positions?.includes(p.id)}>
                  {positionLabel[p.id]} <span className="text-muted">({p.count})</span>
                </Check>
              ))}
            </div>
          </fieldset>
        )}

        <div className="sticky bottom-0 -mx-4 flex gap-2 border-t border-line bg-white px-4 pt-3 lg:static lg:mx-0 lg:border-0 lg:px-0 lg:pt-1">
          <button type="submit" className={btn("secondary", "md", "flex-1")}>ใช้ตัวกรอง</button>
          <Link href={hrefWithout(basePath, sp, (k) => !keep.includes(k))} className={btn("outline")}>ล้าง</Link>
        </div>
      </form>
    </FilterPanel>
  );
}
