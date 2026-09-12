import { notFound } from "next/navigation";
import {
  ALL_PRODUCTS_SLUG,
  CATEGORY_MAP,
  getProductsByCategory,
  getProductTypes,
  getDesigners,
  getColours,
  getMaterials,
  getSizes,
  getPriceRange,
} from "@/lib/categoryProducts";
import { getSession } from "@/lib/session";
import CategoryPageClient from "./CategoryPageClient";
import ZaraNavbar from "@/components/ZaraNavbar";
import NavbarActions from "@/components/NavbarActions";
import Footer from "@/components/Footer";
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

  const isAllProducts = slug === ALL_PRODUCTS_SLUG;

  const products = getProductsByCategory(slug);
  const productTypes = getProductTypes(products);
  const designers = getDesigners(products);
  const colours = getColours(products);
  const materials = getMaterials(products);
  const sizes = getSizes(products);
  const priceRange = getPriceRange(products);
  const session = await getSession();
  const isLoggedIn = !!session?.uid;

  return (
    <>
      <ZaraNavbar actions={<NavbarActions />} />
      <div className="min-h-screen bg-salt">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-4">
        <div className="flex items-center gap-2 text-xs text-ink/40">
          <Link href="/" className="hover:text-cacao transition-colors">Home</Link>
          <span>/</span>
          {isAllProducts ? (
            <span className="text-cacao">{categoryName}</span>
          ) : (
            <>
              <Link href={`/category/${ALL_PRODUCTS_SLUG}`} className="hover:text-cacao transition-colors">
                All Products
              </Link>
              <span>/</span>
              <span className="text-cacao">{categoryName}</span>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4 mt-3">
          <div>
            <h1
              className="font-heading text-cacao"
              style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}
            >
              {categoryName}
            </h1>
            <p className="text-ink/40 text-sm mt-1">
              {products.length} product{products.length !== 1 ? "s" : ""}
            </p>
          </div>

         
        </div>
      </div>

      {/* Filters + Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        <CategoryPageClient
          products={products}
          productTypes={productTypes}
          designers={designers}
          colours={colours}
          materials={materials}
          sizes={sizes}
          priceRange={priceRange}
          isLoggedIn={isLoggedIn}
          showViewAll={!isAllProducts}
        />
      </div>
      </div>
      <Footer />
    </>
  );
}
