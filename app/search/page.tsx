import type { Metadata } from "next";
import { Suspense } from "react";
import { ListingSkeleton } from "@/components/listing-skeleton";
import { ProductListing } from "@/components/product-listing";

export const metadata: Metadata = {
  title: "ค้นหาอะไหล่",
  robots: { index: false },
};

export default function SearchPage(props: PageProps<"/search">) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-bold">ค้นหาอะไหล่</h1>
      <Suspense fallback={<ListingSkeleton />}>
        <ProductListing searchParams={props.searchParams} basePath="/search" />
      </Suspense>
    </div>
  );
}
