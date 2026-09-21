import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getProductById, getVendorInfo } from "@/lib/products";
import { getSession } from "@/lib/session";
import { ALL_PRODUCTS_SLUG, resolveCategory } from "@/lib/categoryProducts";
import ZaraNavbar from "@/components/ZaraNavbar";
import NavbarActions from "@/components/NavbarActions";
import Footer from "@/components/Footer";
import ProductDetailClient from "./ProductDetailClient";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) return { title: "Product — editte" };
  return {
    title: `${product.title} — editte`,
    description: product.description.slice(0, 160),
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;

  const product = await getProductById(id);
  if (!product) notFound();

  const [vendor, session] = await Promise.all([
    getVendorInfo(product.vendorId),
    getSession(),
  ]);

  const route = resolveCategory(product.categorySlug);

  return (
    <>
      <ZaraNavbar actions={<NavbarActions />} />
      <div className="min-h-screen bg-salt">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-16 pt-24 pb-4">
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
              href={`/category/${ALL_PRODUCTS_SLUG}`}
              className="text-cacao text-sm hover:opacity-60 transition-opacity"
            >
              All Products
            </Link>
            {route && (
              <>
                <span>/</span>
                <Link
                  href={`/category/${route.slug}`}
                  className="text-cacao text-sm hover:opacity-60 transition-opacity"
                >
                  {route.label}
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-16 pb-16">
          <ProductDetailClient
            product={product}
            vendorPincode={vendor?.pickupPincode ?? ""}
            vendorCity={vendor?.city ?? ""}
            vendorState={vendor?.state ?? ""}
            vendorBrand={vendor?.brandName || product.brandName}
            isLoggedIn={!!session?.uid}
          />
        </div>
      </div>
      <Footer />
    </>
  );
}
