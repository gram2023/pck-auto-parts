// ชั้นเข้าถึงข้อมูลสินค้า — หน้าเว็บเรียกผ่านฟังก์ชันเหล่านี้เท่านั้น
// เมื่อเปลี่ยนไปใช้ฐานข้อมูล ให้แก้เฉพาะไฟล์นี้ (ลายเซ็นฟังก์ชันเป็น async ไว้แล้ว)

import { carMakes, categories, partBrands, products, vehicles } from "./catalog-data";
import { checkFitment, publishedFitments } from "./fitment";
import type {
  Position,
  Product,
  ProductType,
  StockStatus,
  VehicleSelection,
} from "./types";

/** ปรับรหัสให้เทียบกันได้: ตัวพิมพ์ใหญ่ ตัดช่องว่าง ขีด จุด และทับ */
export function normalizeCode(input: string): string {
  return input.toUpperCase().replace(/[\s\-./_]/g, "");
}

export async function getCategories() {
  return categories;
}

export async function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug) ?? null;
}

export async function getProduct(slug: string) {
  return products.find((p) => p.slug === slug) ?? null;
}

export async function getAllProductSlugs() {
  return products.map((p) => p.slug);
}

export async function getFeaturedProducts() {
  return products.filter((p) => p.featured);
}

export async function getVehicleCatalog() {
  return { makes: carMakes, vehicles };
}

export function getPartBrand(id: string) {
  return partBrands.find((b) => b.id === id) ?? null;
}

export function getMake(id: string) {
  return carMakes.find((m) => m.id === id) ?? null;
}

export function getVehicle(id: string) {
  return vehicles.find((v) => v.id === id) ?? null;
}

export type MatchKind = "sku" | "part_number" | "oem";

export type ProductFilters = {
  q?: string;
  /** หมวดหมู่ที่ล็อกจากหน้า /category/[slug] */
  category?: string;
  /** ตัวกรองหมวดหมู่ในหน้าค้นหา */
  categories?: string[];
  brands?: string[];
  types?: ProductType[];
  positions?: Position[];
  stock?: StockStatus[];
  priceMin?: number;
  priceMax?: number;
  vehicle?: VehicleSelection | null;
  sort?: "relevance" | "price_asc" | "price_desc";
};

export type ProductHit = {
  product: Product;
  /** มีค่าเมื่อคำค้นตรงกับหมายเลขแบบเป๊ะ */
  match?: { kind: MatchKind; value: string };
};

export type SearchResult = {
  hits: ProductHit[];
  /** เมื่อเลือกรถ: สินค้าที่ยังไม่มีข้อมูลยืนยันกับรถคันนั้น */
  unverified: ProductHit[];
  /** เมื่อเลือกรถ: สินค้าที่ข้อมูลระบุว่าไม่รองรับรถคันนั้น */
  notFit: ProductHit[];
  facets: {
    categories: { id: string; name: string; count: number }[];
    brands: { id: string; name: string; count: number }[];
    types: { id: ProductType; count: number }[];
    positions: { id: Position; count: number }[];
    stock: { id: StockStatus; count: number }[];
  };
};

function matchCode(p: Product, code: string): ProductHit["match"] {
  if (!code) return undefined;
  if (normalizeCode(p.sku) === code) return { kind: "sku", value: p.sku };
  if (normalizeCode(p.partNumber) === code) return { kind: "part_number", value: p.partNumber };
  const oem = p.oemNumbers.find((o) => normalizeCode(o.number) === code);
  if (oem) return { kind: "oem", value: oem.number };
  return undefined;
}

function matchesText(p: Product, q: string): boolean {
  const code = normalizeCode(q);
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  const category = categories.find((c) => c.slug === p.categorySlug);
  const haystack = [p.name, p.subcategory, p.description, category?.name, getPartBrand(p.partBrandId)?.name]
    .join(" ")
    .toLowerCase();
  const codes = [p.sku, p.partNumber, ...p.oemNumbers.map((o) => o.number)].map(normalizeCode);
  return (
    terms.every((t) => haystack.includes(t)) ||
    (code.length >= 3 && codes.some((c) => c.includes(code)))
  );
}

function count<T extends string>(items: T[]): Map<T, number> {
  const m = new Map<T, number>();
  for (const i of items) m.set(i, (m.get(i) ?? 0) + 1);
  return m;
}

export async function searchProducts(f: ProductFilters): Promise<SearchResult> {
  const q = f.q?.trim() ?? "";
  const code = normalizeCode(q);

  // 1) ขอบเขตหลัก: หมวดหมู่ + คำค้น
  let base = products.filter((p) => !f.category || p.categorySlug === f.category);
  if (q) base = base.filter((p) => matchesText(p, q));

  // 2) facet คำนวณจากขอบเขตหลัก (ก่อนใช้ตัวกรอง) เพื่อให้ตัวเลือกไม่หายไป
  const facets: SearchResult["facets"] = {
    categories: f.category
      ? []
      : [...count(base.map((p) => p.categorySlug))].map(([id, n]) => ({
          id,
          name: categories.find((c) => c.slug === id)?.name ?? id,
          count: n,
        })),
    brands: [...count(base.map((p) => p.partBrandId))].map(([id, n]) => ({
      id,
      name: getPartBrand(id)?.name ?? id,
      count: n,
    })),
    types: [...count(base.map((p) => p.type))].map(([id, n]) => ({ id, count: n })),
    positions: [...count(base.flatMap((p) => p.position ?? []))].map(([id, n]) => ({ id, count: n })),
    stock: [...count(base.map((p) => p.stock))].map(([id, n]) => ({ id, count: n })),
  };

  // 3) ตัวกรอง
  const list = base.filter(
    (p) =>
      (!f.categories?.length || f.categories.includes(p.categorySlug)) &&
      (!f.brands?.length || f.brands.includes(p.partBrandId)) &&
      (!f.types?.length || f.types.includes(p.type)) &&
      (!f.positions?.length || f.positions.some((pos) => p.position?.includes(pos))) &&
      (!f.stock?.length || f.stock.includes(p.stock)) &&
      (f.priceMin == null || p.price >= f.priceMin) &&
      (f.priceMax == null || p.price <= f.priceMax),
  );

  // 4) เรียง
  const stockRank: Record<StockStatus, number> = { in_stock: 0, preorder: 1, out_of_stock: 2 };
  const toHit = (p: Product): ProductHit => ({ product: p, match: matchCode(p, code) });
  let hits = list.map(toHit);
  hits.sort((a, b) => {
    if (!!a.match !== !!b.match) return a.match ? -1 : 1; // หมายเลขตรงเป๊ะขึ้นก่อน
    if (f.sort === "price_asc") return a.product.price - b.product.price;
    if (f.sort === "price_desc") return b.product.price - a.product.price;
    return stockRank[a.product.stock] - stockRank[b.product.stock];
  });

  // 5) แยกตามรถ — ไม่เดาความเข้ากันได้ สินค้าที่ไม่มีข้อมูลยืนยันจะถูกแยกออกมา
  //    กลุ่ม "ยังไม่ยืนยัน" = สินค้าที่ไม่มีข้อมูลรถเลย หรือมีข้อมูลของรุ่นเดียวกัน (ต่างปี/เครื่องยนต์)
  //    สินค้าที่มีข้อมูลเฉพาะรุ่นอื่นจะไม่แสดง (เป็นการคัดการแสดงผล ไม่ได้ยืนยันว่าใช้ไม่ได้)
  let unverified: ProductHit[] = [];
  let notFit: ProductHit[] = [];
  if (f.vehicle) {
    const v = f.vehicle;
    const sameModel = (vehicleId: string) => {
      const x = getVehicle(vehicleId);
      return !!x && x.makeId === v.makeId && x.model === v.model;
    };
    const checked = hits.map((h) => ({ h, c: checkFitment(h.product, v).kind }));
    unverified = checked
      .filter((x) => {
        if (x.c !== "unknown") return false;
        const fits = publishedFitments(x.h.product);
        return fits.length === 0 || fits.some((ft) => sameModel(ft.vehicleId));
      })
      .map((x) => x.h);
    notFit = checked.filter((x) => x.c === "not_fit").map((x) => x.h);
    hits = checked.filter((x) => x.c === "fits" || x.c === "conditional").map((x) => x.h);
  }

  return { hits, unverified, notFit, facets };
}

/** แปลงพารามิเตอร์ URL (make, model, year, engine) เป็นรถที่เลือก */
export function parseVehicleParams(sp: Record<string, string | string[] | undefined>): VehicleSelection | null {
  const one = (k: string) => (Array.isArray(sp[k]) ? sp[k]![0] : (sp[k] as string | undefined));
  const makeId = one("make");
  const model = one("model");
  const year = Number(one("year"));
  if (!makeId || !model || !Number.isInteger(year)) return null;
  const engine = one("engine");
  const v = engine ? getVehicle(engine) : null;
  const valid = v && v.makeId === makeId && v.model === model && year >= v.yearFrom && year <= v.yearTo;
  return { makeId, model, year, vehicleId: valid ? v.id : null };
}
