import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CategoryIcon } from "@/components/category-icon";
import { ListingSkeleton } from "@/components/listing-skeleton";
import { ProductListing } from "@/components/product-listing";
import { getCategories, getCategory } from "@/lib/catalog";

export async function generateStaticParams() {
  return (await getCategories()).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata(props: PageProps<"/category/[slug]">): Promise<Metadata> {
  const cat = await getCategory((await props.params).slug);
  return cat ? { title: `อะไหล่${cat.name}`, description: cat.description } : {};
}

export default async function CategoryPage(props: PageProps<"/category/[slug]">) {
  const { slug } = await props.params;
  const cat = await getCategory(slug);
  if (!cat) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <nav aria-label="เส้นทาง" className="text-sm text-muted">
        <Link href="/" className="hover:text-brand">หน้าแรก</Link> <span aria-hidden>›</span> {cat.name}
      </nav>
      <header className="mb-5 mt-2 flex items-center gap-3">
        <span className="grid size-12 place-items-center rounded-lg bg-brand-soft text-brand">
          <CategoryIcon icon={cat.icon} />
        </span>
        <div>
          <h1 className="text-2xl font-bold">{cat.name}</h1>
          <p className="text-sm text-muted">{cat.description}</p>
        </div>
      </header>
      <Suspense fallback={<ListingSkeleton />}>
        <ProductListing searchParams={props.searchParams} category={cat.slug} basePath={`/category/${cat.slug}`} />
      </Suspense>
    </div>
  );
}
