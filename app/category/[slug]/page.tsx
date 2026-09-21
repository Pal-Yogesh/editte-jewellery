import { notFound } from "next/navigation";
import {
  ALL_PRODUCTS_SLUG,
  getColours,
  getDesigners,
  getMaterials,
  getPriceRange,
  getProductTypes,
  getSizes,
  resolveCategory,
} from "@/lib/categoryProducts";
import { getProductsByCategory } from "@/lib/products";
import { getSession } from "@/lib/session";
import CategoryPageClient from "./CategoryPageClient";
import SiteNavbar from "@/components/SiteNavbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const route = resolveCategory(slug);
  if (!route) return { title: "Category — editte" };
  return { title: `${route.label} — editte` };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const route = resolveCategory(slug);
  if (!route) notFound();

  const isAllProducts = route.level === "all";

  const [products, session] = await Promise.all([
    getProductsByCategory(route),
    getSession(),
  ]);

  const productTypes = getProductTypes(products);
  const designers = getDesigners(products);
  const colours = getColours(products);
  const materials = getMaterials(products);
  const sizes = getSizes(products);
  const priceRange = getPriceRange(products);
  const isLoggedIn = !!session?.uid;

  return (
    <>
      <SiteNavbar />
      <div className="min-h-screen bg-salt">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-6 pt-24 pb-4">
          <div className="flex items-center gap-2 text-sm text-ink/40">
            <Link
              href="/"
              className="hover:text-cacao -mt-1.25 transition-colors cursor-pointer"
            >
              <Image
                src="/logo/full-name-logo-removebg-preview.png"
                alt="logo"
                width={1000}
                height={1000}
                className="w-16 h-16"
              />
            </Link>
            <span>/</span>
            {isAllProducts ? (
              <span className="text-cacao">{route.label}</span>
            ) : (
              <>
                <Link
                  href={`/category/${ALL_PRODUCTS_SLUG}`}
                  className="text-cacao text-sm hover:opacity-60 transition-opacity"
                >
                  All Products
                </Link>
                {route.trail.map((crumb) => (
                  <span key={crumb.href} className="flex items-center gap-2">
                    <span>/</span>
                    <Link
                      href={crumb.href}
                      className="text-cacao text-sm hover:opacity-60 transition-opacity"
                    >
                      {crumb.label}
                    </Link>
                  </span>
                ))}
                <span>/</span>
                <span className="text-cacao text-sm">{route.label}</span>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-end justify-between gap-4 mt-3">
            <div>
              <h1
                className="font-heading text-cacao"
                style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}
              >
                {route.label}
              </h1>
              {route.blurb ? (
                <p className="text-ink/50 text-sm mt-1 max-w-md">{route.blurb}</p>
              ) : null}
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
