import { notFound } from "next/navigation";
import { getProductById, getVendorInfo } from "@/lib/products";
import ProductDetailClient from "./ProductDetailClient";

type Props = { params: Promise<{ id: string }> };

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;

  const product = await getProductById(id);
  if (!product) notFound();

  const vendor = await getVendorInfo(product.vendorId);

  return (
    <div className="min-h-screen bg-[#F5F0EB] pt-16">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-16 py-10">
        <ProductDetailClient
          product={product}
          vendorPincode={vendor?.pickupPincode ?? ""}
          vendorCity={vendor?.city ?? ""}
          vendorState={vendor?.state ?? ""}
          vendorBrand={vendor?.brandName ?? product.brandName}
        />
      </div>
    </div>
  );
}
