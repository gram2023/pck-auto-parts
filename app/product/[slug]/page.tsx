import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StockBadge, TypeBadge } from "@/components/badges";
import { CategoryIcon } from "@/components/category-icon";
import { MyCarFitment } from "@/components/my-car-fitment";
import {
  getAllProductSlugs,
  getCategory,
  getMake,
  getPartBrand,
  getProduct,
  getVehicle,
  getVehicleCatalog,
} from "@/lib/catalog";
import { CHECK_WITH_STORE, publishedFitments } from "@/lib/fitment";
import { formatBaht, formatPositions, formatYears, sourceLabel, unitLabel } from "@/lib/format";
import type { Source } from "@/lib/types";

export async function generateStaticParams() {
  return (await getAllProductSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata(props: PageProps<"/product/[slug]">): Promise<Metadata> {
  const p = await getProduct((await props.params).slug);
  if (!p) return {};
  return { title: `${p.name} ${p.partNumber}`, description: p.description };
}

const resultLabel = { fits: "รองรับ", conditional: "รองรับแบบมีเงื่อนไข", not_fit: "ไม่รองรับ" } as const;
const resultCls = { fits: "text-ok", conditional: "text-warn", not_fit: "text-bad" } as const;

function SourceTag({ s }: { s: Source }) {
  return (
    <span className={`text-xs ${s.type === "demo" ? "text-warn" : "text-muted"}`} title={s.ref}>
      {sourceLabel[s.type]}
    </span>
  );
}

export default async function ProductPage(props: PageProps<"/product/[slug]">) {
  const { slug } = await props.params;
  const p = await getProduct(slug);
  if (!p) notFound();

  const [cat, catalog] = await Promise.all([getCategory(p.categorySlug), getVehicleCatalog()]);
  const brand = getPartBrand(p.partBrandId);
  const fitments = publishedFitments(p);
  const positions = formatPositions(p.position);
  const canBuy = p.stock !== "out_of_stock";
  const usesDemo = fitments.some((f) => f.source.type === "demo") || p.oemNumbers.some((o) => o.source.type === "demo");

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <nav aria-label="เส้นทาง" className="text-sm text-muted">
        <Link href="/" className="hover:text-brand">หน้าแรก</Link> <span aria-hidden>›</span>{" "}
        {cat && <><Link href={`/category/${cat.slug}`} className="hover:text-brand">{cat.name}</Link> <span aria-hidden>›</span> </>}
        {p.name}
      </nav>

      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_420px]">
        {/* รูป + รายละเอียด */}
        <div className="grid gap-8">
          <div className="grid aspect-[16/10] place-items-center rounded-lg bg-surface text-brand/60">
            {cat && <CategoryIcon icon={cat.icon} className="size-28" />}
            <span className="sr-only">ยังไม่มีรูปสินค้า</span>
          </div>

          <section>
            <h2 className="text-lg font-bold">รายละเอียดสินค้า</h2>
            <p className="mt-2 text-ink-soft">{p.description}</p>
            <dl className="mt-4 grid overflow-hidden rounded-lg border border-line text-sm sm:grid-cols-2">
              {[
                { label: "แบรนด์ผู้ผลิตอะไหล่", value: brand?.name + (brand?.country ? ` (${brand.country})` : "") },
                { label: "หน่วยขาย", value: `${unitLabel[p.unit]}${p.piecesPerUnit ? ` (${p.piecesPerUnit} ชิ้น)` : ""}` },
                ...(positions ? [{ label: "ตำแหน่งติดตั้ง", value: positions }] : []),
                ...p.specs,
                ...(p.warranty ? [{ label: "การรับประกัน", value: p.warranty }] : []),
              ].map((row) => (
                <div key={row.label} className="flex gap-3 border-b border-line px-4 py-2.5 sm:[&:nth-last-child(-n+2)]:border-b-0">
                  <dt className="w-40 shrink-0 text-muted">{row.label}</dt>
                  <dd className="text-ink">{row.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section>
            <h2 className="text-lg font-bold">รุ่นรถที่รองรับ</h2>
            {fitments.length === 0 ? (
              <p className="mt-2 rounded-md border border-info/25 bg-info-soft p-3 text-sm text-info">
                ยังไม่มีข้อมูลความเข้ากันได้ที่ยืนยันแล้วสำหรับสินค้านี้ — <strong>{CHECK_WITH_STORE}</strong>
              </p>
            ) : (
              <>
                <div className="mt-3 overflow-x-auto rounded-lg border border-line">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead className="bg-surface text-xs text-muted">
                      <tr>
                        <th className="px-3 py-2 font-medium">ยี่ห้อ / รุ่น</th>
                        <th className="px-3 py-2 font-medium">ปี</th>
                        <th className="px-3 py-2 font-medium">เครื่องยนต์</th>
                        <th className="px-3 py-2 font-medium">ตำแหน่ง</th>
                        <th className="px-3 py-2 font-medium">ผล / เงื่อนไข</th>
                        <th className="px-3 py-2 font-medium">แหล่งอ้างอิง</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fitments.map((f, i) => {
                        const v = getVehicle(f.vehicleId);
                        if (!v) return null;
                        return (
                          <tr key={i} className="border-t border-line align-top">
                            <td className="px-3 py-2 font-medium">{getMake(v.makeId)?.name} {v.model}</td>
                            <td className="px-3 py-2">{formatYears(f.yearFrom ?? v.yearFrom, f.yearTo ?? v.yearTo)}</td>
                            <td className="px-3 py-2">{v.engine}</td>
                            <td className="px-3 py-2">{formatPositions(f.position) || "—"}</td>
                            <td className="px-3 py-2">
                              <span className={`font-semibold ${resultCls[f.result]}`}>{resultLabel[f.result]}</span>
                              {f.conditions && <p className="text-xs text-ink-soft">{f.conditions}</p>}
                            </td>
                            <td className="px-3 py-2"><SourceTag s={f.source} /></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="mt-2 text-xs text-muted">
                  รุ่นรถที่ไม่อยู่ในตารางยังไม่มีข้อมูลยืนยัน — {CHECK_WITH_STORE}
                </p>
              </>
            )}
          </section>

          <section>
            <h2 className="text-lg font-bold">หมายเลข OEM อ้างอิง</h2>
            {p.oemNumbers.length === 0 ? (
              <p className="mt-2 text-sm text-muted">ยังไม่มีหมายเลข OEM ที่มีแหล่งอ้างอิง</p>
            ) : (
              <ul className="mt-2 grid gap-1 text-sm">
                {p.oemNumbers.map((o) => (
                  <li key={o.number} className="flex flex-wrap items-center gap-2">
                    <span className="code rounded bg-surface px-2 py-0.5">{o.number}</span>
                    <span className="text-muted">{getMake(o.makeId)?.name}</span>
                    <SourceTag s={o.source} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          {usesDemo && (
            <p className="rounded-md border border-warn/30 bg-warn-soft p-3 text-sm text-warn">
              ข้อมูลความเข้ากันได้และหมายเลข OEM ในหน้านี้เป็น <strong>ข้อมูลตัวอย่าง</strong> สำหรับทดสอบหน้าเว็บ ไม่ใช่ข้อมูลอ้างอิงจริง
            </p>
          )}
        </div>

        {/* กล่องซื้อ */}
        <aside className="h-fit rounded-lg border border-line p-5 lg:sticky lg:top-44">
          <div className="flex flex-wrap gap-1.5">
            <TypeBadge type={p.type} />
            <StockBadge stock={p.stock} preorderDays={p.preorderDays} />
          </div>
          <h1 className="mt-3 text-2xl font-bold leading-snug">{p.name}</h1>
          <dl className="mt-2 grid gap-0.5 text-sm text-muted">
            <div className="flex gap-2"><dt>แบรนด์:</dt><dd className="text-ink">{brand?.name}</dd></div>
            <div className="flex gap-2"><dt>รหัสสินค้า:</dt><dd className="code text-ink">{p.sku}</dd></div>
            <div className="flex gap-2"><dt>หมายเลขอะไหล่:</dt><dd className="code text-ink">{p.partNumber}</dd></div>
            {positions && <div className="flex gap-2"><dt>ตำแหน่ง:</dt><dd className="text-ink">{positions}</dd></div>}
          </dl>

          <p className="mt-4 text-3xl font-bold">
            {formatBaht(p.price)}
            <span className="text-base font-normal text-muted"> / {unitLabel[p.unit]}</span>
          </p>
          {p.piecesPerUnit && p.piecesPerUnit > 1 && (
            <p className="text-sm text-muted">1 {unitLabel[p.unit]} = {p.piecesPerUnit} ชิ้น</p>
          )}
          {p.stock === "preorder" && (
            <p className="mt-2 text-sm text-warn">สินค้าพรีออร์เดอร์ ใช้เวลาประมาณ {p.preorderDays} วันก่อนจัดส่ง</p>
          )}

          <div className="mt-4">
            <MyCarFitment fitments={fitments} catalog={catalog} />
          </div>

          <div className="mt-5 grid gap-2">
            <button type="button" disabled
              className="h-12 rounded-md bg-accent font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              title="ตะกร้าสินค้าจะเปิดใช้ในเฟสถัดไป">
              {canBuy ? (p.stock === "preorder" ? "สั่งพรีออร์เดอร์" : "เพิ่มลงตะกร้า") : "สินค้าหมด"}
            </button>
            <button type="button" disabled
              className="h-12 rounded-md border-2 border-brand font-semibold text-brand disabled:cursor-not-allowed disabled:opacity-60"
              title="แบบฟอร์มสอบถามจะเปิดใช้ในเฟสถัดไป">
              สอบถามความเข้ากันได้ก่อนซื้อ
            </button>
            <p className="text-center text-xs text-muted">ตะกร้าและแบบฟอร์มสอบถามจะเปิดใช้ในเฟสถัดไป</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
