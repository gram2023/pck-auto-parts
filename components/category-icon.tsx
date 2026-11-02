import type { CategoryIcon as Icon } from "@/lib/types";

// ไอคอนเส้นแบบเรียบ — ใช้แทนรูปสินค้าจนกว่าร้านจะมีรูปจริง
const paths: Record<Icon, React.ReactNode> = {
  engine: (
    <>
      <path d="M7 9h8l2 2h2v6h-2l-2 2H8l-2-2H4v-6h2z" />
      <path d="M10 6h4M12 6v3M19 13h2" />
    </>
  ),
  brake: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M6.5 7.5a8 8 0 0 0 0 9" strokeWidth="3" />
    </>
  ),
  suspension: (
    <>
      <path d="M12 3v3M12 18v3M9 6h6M9 18h6" />
      <path d="M9 8l6 2-6 2 6 2-6 2" />
    </>
  ),
  transmission: (
    <>
      <circle cx="6" cy="6" r="1.5" /><circle cx="12" cy="6" r="1.5" /><circle cx="18" cy="6" r="1.5" />
      <circle cx="6" cy="18" r="1.5" /><circle cx="12" cy="18" r="1.5" />
      <path d="M6 7.5v9M12 7.5v9M18 7.5V12H6" />
    </>
  ),
  electrical: <path d="M13 3L5 13h6l-1 8 8-10h-6z" />,
  cooling: (
    <>
      <rect x="4" y="5" width="16" height="14" rx="1.5" />
      <path d="M8 5v14M12 5v14M16 5v14" />
    </>
  ),
  filter: (
    <>
      <ellipse cx="12" cy="6" rx="7" ry="2.5" />
      <path d="M5 6v12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6" />
      <path d="M9 9v9M12 9v9M15 9v9" />
    </>
  ),
  body: (
    <>
      <path d="M3 15l2-5 3-3h7l3 3 3 1v4z" />
      <circle cx="7.5" cy="16" r="2" /><circle cx="16.5" cy="16" r="2" />
    </>
  ),
};

export function CategoryIcon({ icon, className = "size-8" }: { icon: Icon; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      {paths[icon]}
    </svg>
  );
}
