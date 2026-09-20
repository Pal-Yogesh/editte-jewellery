"use client";

import { useState } from "react";
import { useActionState } from "react";
import { addToCartAction } from "@/app/actions/cart";
import { addToWishlistAction } from "@/app/actions/wishlist";
import type { ProductDetail } from "@/lib/products";
import ShippingEstimator from "./ShippingEstimator";

interface Props {
  product: ProductDetail;
  vendorPincode: string;
  vendorCity: string;
  vendorState: string;
  vendorBrand: string;
}

export default function ProductDetailClient({
  product,
  vendorPincode,
  vendorCity,
  vendorState,
  vendorBrand,
}: Props) {
  const [selectedImage, setSelectedImage] = useState(0);
  const images = product.media.filter((m) => m.kind === "image");

  const [cartState, cartAction, cartPending] = useActionState(addToCartAction, undefined);
  const [wishState, wishAction, wishPending] = useActionState(addToWishlistAction, undefined);

  const inStock = product.quantity > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
      {/* ── Left: Images ── */}
      <div>
        {/* Main image */}
        <div className="relative w-full aspect-square overflow-hidden bg-[#F5F0EB] rounded-2xl mb-3">
          {images.length > 0 ? (
            <img
              src={images[selectedImage]?.url}
              alt={product.title}
              className="w-full h-full object-cover transition-all duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-ink/20">
              No image available
            </div>
          )}
          {product.discountPercent > 0 && (
            <span className="absolute top-4 left-4 bg-sage text-white text-[10px] tracking-wider uppercase px-3 py-1 rounded-full font-semibold">
              {product.discountPercent}% off
            </span>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setSelectedImage(i)}
                className={`relative w-20 h-20 shrink-0 overflow-hidden rounded-lg bg-[#F5F0EB] transition-all duration-200 ${
                  selectedImage === i
                    ? "ring-2 ring-[#8B8B3E] ring-offset-2"
                    : "opacity-60 hover:opacity-100"
                }`}
              >
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Right: Info ── */}
      <div className="flex flex-col">
        {/* Category badge */}
        <span className="inline-flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-[#8B8B3E] font-semibold mb-3">
          <span className="w-5 h-px bg-[#8B8B3E]" />
          {product.category}
        </span>

        {/* Brand */}
        <p className="text-[11px] tracking-[0.2em] uppercase text-gray-400 mb-1">
          {vendorBrand}
        </p>

        {/* Title */}
        <h1
          className="text-gray-900 font-bold leading-tight mb-4"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(2rem, 4vw, 3rem)",
          }}
        >
          {product.title}
        </h1>

        {/* Price */}
        <div className="flex items-baseline gap-3 mb-6">
          <p
            className="text-gray-900 font-semibold"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem" }}
          >
            ₹{product.finalPrice.toLocaleString("en-IN")}
          </p>
          {product.discountPercent > 0 && (
            <p className="text-gray-400 line-through text-sm">
              ₹{product.price.toLocaleString("en-IN")}
            </p>
          )}
        </div>

        {/* Stock status */}
        <div className="flex items-center gap-2 mb-6">
          <span
            className={`w-2 h-2 rounded-full ${inStock ? "bg-green-500" : "bg-red-400"}`}
          />
          <span className="text-xs text-gray-500">
            {inStock ? `In stock (${product.quantity} available)` : "Out of stock"}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mb-8">
          <form action={cartAction}>
            <input type="hidden" name="productId" value={product.id} />
            <input type="hidden" name="name" value={product.title} />
            <input type="hidden" name="image" value={images[0]?.url ?? ""} />
            <input type="hidden" name="price" value={product.finalPrice} />
            <input type="hidden" name="category" value={product.category} />
            <button
              type="submit"
              disabled={cartPending || !inStock}
              className="w-full bg-[#8B8B3E] hover:bg-[#747430] text-white text-[11px] tracking-[0.22em] uppercase font-bold py-4 rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cartPending ? "Adding…" : cartState?.success ? "Added to Cart ✓" : "Add to Cart"}
            </button>
          </form>

          <form action={wishAction}>
            <input type="hidden" name="productId" value={product.id} />
            <input type="hidden" name="name" value={product.title} />
            <input type="hidden" name="image" value={images[0]?.url ?? ""} />
            <input type="hidden" name="price" value={product.finalPrice} />
            <input type="hidden" name="category" value={product.category} />
            <button
              type="submit"
              disabled={wishPending}
              className="w-full border border-gray-200 hover:border-gray-400 text-gray-700 text-[11px] tracking-[0.22em] uppercase font-bold py-4 rounded-sm transition-colors disabled:opacity-50"
            >
              {wishPending ? "Adding…" : wishState?.success ? "In Wishlist ♥" : "♡ Add to Wishlist"}
            </button>
          </form>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100 mb-6" />

        {/* Description */}
        {product.description && (
          <p
            className="text-gray-600 leading-relaxed mb-6"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem" }}
          >
            {product.description}
          </p>
        )}

        {/* Product Details */}
        <div className="flex flex-col gap-2 mb-6">
          {product.metal && (
            <DetailRow label="Material" value={product.metal} />
          )}
          {product.size && (
            <DetailRow label="Size" value={product.size} />
          )}
          {product.colors.length > 0 && (
            <DetailRow label="Colors" value={product.colors.join(", ")} />
          )}
          {product.sku && (
            <DetailRow label="SKU" value={product.sku} />
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100 mb-6" />

        {/* Vendor Info */}
        <div className="bg-white/60 rounded-xl p-4 mb-6 border border-gray-100">
          <p className="text-[10px] tracking-[0.2em] uppercase text-gray-400 font-medium mb-1">
            Sold by
          </p>
          <p className="text-sm font-medium text-gray-800">{vendorBrand}</p>
          {vendorCity && vendorState && (
            <p className="text-xs text-gray-400 mt-0.5">
              Ships from {vendorCity}, {vendorState}
            </p>
          )}
        </div>

        {/* Shipping Estimator */}
        <ShippingEstimator
          vendorPincode={vendorPincode}
          productMrp={product.finalPrice}
        />
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] tracking-[0.18em] uppercase text-gray-400 font-semibold w-20 shrink-0">
        {label}
      </span>
      <span className="text-[13px] text-gray-700">{value}</span>
    </div>
  );
}
