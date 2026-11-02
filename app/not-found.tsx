import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <p className="text-5xl font-bold text-brand">404</p>
      <h1 className="mt-2 text-xl font-bold">ไม่พบหน้าที่คุณต้องการ</h1>
      <p className="mt-2 text-muted">สินค้านี้อาจถูกนำออกแล้ว หรือลิงก์ไม่ถูกต้อง</p>
      <Link href="/" className="mt-6 inline-block rounded-md bg-brand px-5 py-2.5 font-semibold text-white hover:bg-brand-strong">
        กลับหน้าแรก
      </Link>
    </div>
  );
}
