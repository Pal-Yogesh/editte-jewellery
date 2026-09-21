import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getDesignerBySlug, getDesignerProducts } from "@/lib/designers";
import {
  ALL_PRODUCTS_SLUG,
  getColours,
  getMaterials,
  getPriceRange,
  getProductTypes,
  getSizes,
} from "@/lib/categoryProducts";
import { getSession } from "@/lib/session";
import CategoryPageClient from "@/app/category/[slug]/CategoryPageClient";
import SiteNavbar from "@/components/SiteNavbar";
import Footer from "@/components/Footer";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const designer = await getDesignerBySlug(slug);
  if (!designer) return { title: "Designer — editte" };
  return {
    title: `${designer.brandName} — editte`,
    description: designer.about.slice(0, 160),
  };
}

export default async function DesignerPage({ params }: Props) {
  const { slug } = await params;

  const designer = await getDesignerBySlug(slug);
  if (!designer) notFound();

  const [products, session] = await Promise.all([
    getDesignerProducts(designer.vendorId),
    getSession(),
  ]);

  return (
    <>
      <SiteNavbar />
      <div className="min-h-screen bg-salt">
        <div className="max-w-7xl mx-auto px-6 pt-24 pb-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-ink/40">
            <Link href="/" className="hover:text-cacao -mt-1.25 transition-colors">
              <Image
                src="/logo/full-name-logo-removebg-preview.png"
                alt="editte"
                width={1000}
                height={1000}
                className="w-16 h-16"
              />
            </Link>
            <span>/</span>
            <Link
              href="/designer"
              className="text-cacao text-sm hover:opacity-60 transition-opacity"
            >
              Designers
            </Link>
            <span>/</span>
            <span className="text-cacao text-sm">{designer.brandName}</span>
          </div>

          {/* Designer header */}
          <div className="flex flex-wrap items-end gap-5 mt-4">
            {designer.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={designer.logo}
                alt={designer.brandName}
                className="w-20 h-20 object-cover bg-sand/30"
              />
            ) : null}
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-sage">
                Designer
              </p>
              <h1
                className="font-heading text-cacao"
                style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}
              >
                {designer.brandName}
              </h1>
              <p className="text-ink/40 text-sm mt-1">
                {products.length} product{products.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {designer.about || designer.brandStory ? (
            <p className="text-ink/60 text-sm leading-relaxed mt-4 max-w-2xl">
              {designer.about || designer.brandStory}
            </p>
          ) : null}
        </div>

        <div className="max-w-7xl mx-auto px-6 pb-20">
          {products.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-4xl mb-4">✦</p>
              <p className="font-heading text-cacao text-xl">Nothing listed yet</p>
              <Link
                href={`/category/${ALL_PRODUCTS_SLUG}`}
                className="text-ink/40 text-sm mt-2 inline-block hover:text-cacao transition-colors"
              >
                Browse the full catalogue →
              </Link>
            </div>
          ) : (
            <CategoryPageClient
              products={products}
              productTypes={getProductTypes(products)}
              designers={[]}
              colours={getColours(products)}
              materials={getMaterials(products)}
              sizes={getSizes(products)}
              priceRange={getPriceRange(products)}
              isLoggedIn={!!session?.uid}
              showViewAll
            />
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
