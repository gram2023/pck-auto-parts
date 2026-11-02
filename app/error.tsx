"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ErrorState } from "@/components/state-views";
import { btn } from "@/lib/ui";

export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  const digest = error instanceof Error && "digest" in error ? String((error as { digest?: string }).digest ?? "") : "";

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <ErrorState title="เกิดข้อผิดพลาด หน้านี้แสดงผลไม่สำเร็จ" code={digest || undefined}>
        <button type="button" onClick={() => retry()} className={btn("primary")}>ลองใหม่อีกครั้ง</button>
        <Link href="/" className={btn("outline")}>กลับหน้าแรก</Link>
        <Link href="/contact" className={btn("ghost")}>ติดต่อร้าน</Link>
      </ErrorState>
    </div>
  );
}
