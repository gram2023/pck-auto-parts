export function ListingSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]" aria-busy="true" aria-label="กำลังโหลดสินค้า">
      <div className="h-64 animate-pulse rounded-lg bg-surface" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="h-72 animate-pulse rounded-lg bg-surface" />
        ))}
      </div>
    </div>
  );
}
