import { notFound } from "next/navigation";
import {
  CATEGORY_MAP,
  getProductsByCategory,
  getProductTypes,
  getDesigners,
  getPriceRange,
} from "@/lib/categoryProducts";
import CategoryPageClient from "./CategoryPageClient";
import Link from "next/link";

export function generateStaticParams() {
  return Object.keys(CATEGORY_MAP).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const name = CATEGORY_MAP[slug];
  if (!name) return { title: "Category — editte" };
  return { title: `${name} — editte` };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const categoryName = CATEGORY_MAP[slug];
  if (!categoryName) notFound();

  const products = getProductsByCategory(slug);
  const productTypes = getProductTypes(products);
  const designers = getDesigners(products);
  const priceRange = getPriceRange(products);

  return (
    <div className="min-h-screen bg-salt">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-4">
        <div className="flex items-center gap-2 text-xs text-ink/40">
          <Link href="/" className="hover:text-cacao transition-colors">Home</Link>
          <span>/</span>
          <span className="text-cacao">{categoryName}</span>
        </div>
        <h1
          className="font-heading text-cacao mt-3"
          style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}
        >
          {categoryName}
        </h1>
        <p className="text-ink/40 text-sm mt-1">
          {products.length} product{products.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Filters + Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        <CategoryPageClient
          products={products}
          productTypes={productTypes}
          designers={designers}
          priceRange={priceRange}
        />
      </div>
    </div>
  );
}
