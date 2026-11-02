// สถานะร่วมของทุกหน้า: กำลังโหลด / ไม่พบข้อมูล / เกิดข้อผิดพลาด
// ทุกสถานะมีไอคอน + หัวข้อ + คำอธิบาย + ทางไปต่อ (ไม่ใช้สีอย่างเดียว)

export function ErrorState({
  title = "โหลดข้อมูลไม่สำเร็จ",
  detail = "อาจเกิดจากสัญญาณอินเทอร์เน็ตหรือระบบของร้านขัดข้องชั่วคราว ข้อมูลที่คุณกรอกไว้ยังไม่หาย",
  code,
  children,
}: {
  title?: string;
  detail?: string;
  code?: string;
  children?: React.ReactNode;
}) {
  return (
    <div role="alert" className="rounded-lg border border-bad/30 bg-bad-soft px-4 py-8 text-center">
      <p aria-hidden className="mx-auto grid size-12 place-items-center rounded-full bg-bad text-2xl font-bold text-white">!</p>
      <p className="mt-3 text-lg font-semibold text-bad">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-ink-soft">{detail}</p>
      {code && <p className="mt-2 text-xs text-muted">รหัสอ้างอิงสำหรับแจ้งร้าน: <span className="code">{code}</span></p>}
      {children && <div className="mt-5 flex flex-wrap justify-center gap-2">{children}</div>}
    </div>
  );
}

export function LoadingState({ label = "กำลังโหลด…" }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-3 py-10 text-ink-soft">
      <span aria-hidden className="size-5 animate-spin rounded-full border-2 border-line border-t-brand" />
      {label}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6" aria-busy="true">
      <p className="sr-only" role="status">กำลังโหลดข้อมูลสินค้า…</p>
      <div className="h-4 w-56 animate-pulse rounded bg-surface" />
      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_420px]">
        <div className="grid gap-4">
          <div className="aspect-[16/10] animate-pulse rounded-lg bg-surface" />
          <div className="h-40 animate-pulse rounded-lg bg-surface" />
        </div>
        <div className="h-96 animate-pulse rounded-lg bg-surface" />
      </div>
    </div>
  );
}
