"use client";

import { useEffect, useState, useActionState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { addToCartAction } from "@/app/actions/cart";
import { addToWishlistAction } from "@/app/actions/wishlist";
import type { ProductDetail } from "@/lib/products";
import ShippingEstimator from "./ShippingEstimator";

/** House copy shown under every product description. */
const CRAFT_NOTE =
  "Each creation is inspired by timeless heirloom jewellery and crafted to carry an antique finish. Every piece is made by hand, not machine.";

interface Props {
  product: ProductDetail;
  vendorPincode: string;
  vendorCity: string;
  vendorState: string;
  vendorBrand: string;
  isLoggedIn: boolean;
}

export default function ProductDetailClient({
  product,
  vendorPincode,
  vendorCity,
  vendorState,
  vendorBrand,
  isLoggedIn,
}: Props) {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(0);
  const images = product.media.filter((m) => m.kind === "image");
  const video = product.media.find((m) => m.kind === "video");

  const [cartState, cartAction, cartPending] = useActionState(addToCartAction, undefined);
  const [buyState, buyAction, buyPending] = useActionState(addToCartAction, undefined);
  const [wishState, wishAction, wishPending] = useActionState(addToWishlistAction, undefined);

  const inStock = product.quantity > 0;

  // "Buy Now" is "add to cart, then straight to checkout".
  useEffect(() => {
    if (buyState?.success) router.push("/dashboard/cart");
  }, [buyState?.success, router]);

  const offers = [
    product.discountPercent > 0
      ? `Save ${product.discountPercent}% — ₹${(product.price - product.finalPrice).toLocaleString("en-IN")} off the listed price`
      : "Get 10% off on your first order — Use code EDITTE10",
    "Ships within 1–2 business days",
  ];

  const details = [
    product.metal && { label: "Material", value: product.metal },
    product.weightGrams > 0 && { label: "Weight", value: `${product.weightGrams} g` },
    product.size && { label: "Size", value: product.size },
    product.colors.length > 0 && { label: "Colour", value: product.colors.join(", ") },
    product.sku && { label: "SKU", value: product.sku },
  ].filter(Boolean) as { label: string; value: string }[];

  const hiddenFields = (
    <>
      <input type="hidden" name="productId" value={product.id} />
      <input type="hidden" name="name" value={product.title} />
      <input type="hidden" name="image" value={images[0]?.url ?? ""} />
      <input type="hidden" name="price" value={product.finalPrice} />
      <input type="hidden" name="category" value={product.categorySlug} />
    </>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
      {/* ── Left: Images ── */}
      <div>
        {/* Main image */}
        <div className="relative w-full aspect-square overflow-hidden bg-sand/20 mb-3">
          {images.length > 0 ? (
            <img
              src={images[selectedImage]?.url}
              alt={product.title}
              className="w-full h-full object-cover transition-all duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-ink/25 text-xs tracking-[0.2em] uppercase">
              No image available
            </div>
          )}
          {product.discountPercent > 0 && (
            <span className="absolute top-4 left-4 bg-sage text-white text-[10px] tracking-[0.18em] uppercase px-3 py-1 font-medium">
              {product.discountPercent}% off
            </span>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
            {images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setSelectedImage(i)}
                aria-label={`View image ${i + 1}`}
                className={`relative w-20 h-20 shrink-0 overflow-hidden bg-sand/20 transition-all duration-200 ${
                  selectedImage === i
                    ? "ring-1 ring-cacao ring-offset-2 ring-offset-salt"
                    : "opacity-60 hover:opacity-100"
                }`}
              >
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Vendor video, when one was uploaded */}
        {video && (
          <video
            src={video.url}
            controls
            playsInline
            className="w-full mt-4 bg-sand/20"
          />
        )}
      </div>

      {/* ── Right: Info ── */}
      <div className="flex flex-col">
        {/* Badge */}
        <span className="inline-flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-sage mb-3">
          <span className="w-5 h-px bg-sage" />
          {product.quantity === 1
            ? "Collector's Item — Single Piece Only"
            : product.category}
        </span>

        {/* Brand */}
        <p className="text-[11px] tracking-[0.2em] uppercase text-ink/40 mb-1">
          {vendorBrand}
        </p>

        {/* Name */}
        <h1
          className="font-heading text-cacao leading-tight mb-4"
          style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
        >
          {product.title}
        </h1>

        {/* Price */}
        <div className="flex items-baseline gap-3 mb-6">
          <p className="font-heading text-cacao text-2xl">
            ₹ {product.finalPrice.toLocaleString("en-IN")}
          </p>
          {product.discountPercent > 0 && (
            <p className="text-ink/30 line-through text-sm">
              ₹ {product.price.toLocaleString("en-IN")}
            </p>
          )}
        </div>

        {/* Offers */}
        <div className="flex flex-col gap-2 mb-6">
          {offers.map((offer) => (
            <div key={offer} className="flex items-start gap-2">
              <span className="text-sage text-xs mt-0.5">✦</span>
              <p className="text-[12px] text-ink/50">{offer}</p>
            </div>
          ))}
        </div>

        {/* Stock */}
        <div className="flex items-center gap-2 mb-6">
          <span className={`w-2 h-2 rounded-full ${inStock ? "bg-sage" : "bg-ruby"}`} />
          <span className="text-xs text-ink/50">
            {inStock
              ? product.quantity <= 3
                ? `Only ${product.quantity} left`
                : "In stock"
              : "Out of stock"}
          </span>
        </div>

        {/* Buttons */}
        {isLoggedIn ? (
          <div className="flex flex-col gap-3 mb-8">
            <form action={cartAction}>
              {hiddenFields}
              <button
                type="submit"
                disabled={cartPending || !inStock}
                className="w-full bg-rose hover:bg-cacao text-white text-[11px] tracking-[0.22em] uppercase py-4 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {cartPending
                  ? "Adding…"
                  : cartState?.success
                    ? "Added to Cart ✓"
                    : "Add to Cart"}
              </button>
            </form>

            <form action={buyAction}>
              {hiddenFields}
              <button
                type="submit"
                disabled={buyPending || !inStock}
                className="w-full bg-cacao hover:bg-sage text-white text-[11px] tracking-[0.22em] uppercase py-4 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {buyPending ? "Taking you to checkout…" : "Buy Now"}
              </button>
            </form>

            <form action={wishAction}>
              {hiddenFields}
              <button
                type="submit"
                disabled={wishPending}
                className="w-full border border-cacao/20 hover:border-cacao text-cacao text-[11px] tracking-[0.22em] uppercase py-4 transition-colors disabled:opacity-40"
              >
                {wishPending
                  ? "Saving…"
                  : wishState?.success
                    ? "In Wishlist ♥"
                    : "♡ Add to Wishlist"}
              </button>
            </form>
          </div>
        ) : (
          <div className="flex flex-col gap-3 mb-8">
            <Link
              href="/auth/login"
              className="w-full bg-rose hover:bg-cacao text-white text-[11px] tracking-[0.22em] uppercase py-4 text-center transition-colors"
            >
              Sign in to Buy
            </Link>
            <p className="text-[11px] text-ink/40 text-center">
              Sign in to add this piece to your cart or wishlist.
            </p>
          </div>
        )}

        {/* Divider */}
        <div className="h-px bg-ink/10 mb-6" />

        {/* Description */}
        {product.description && (
          <p className="text-ink/60 leading-relaxed mb-4">{product.description}</p>
        )}
        <p className="text-[11px] text-ink/35 italic leading-relaxed mb-6">
          {CRAFT_NOTE}
        </p>

        {/* Details */}
        {details.length > 0 && (
          <div className="flex flex-col gap-2 mb-6">
            {details.map((d) => (
              <div key={d.label} className="flex items-center gap-3">
                <span className="text-[10px] tracking-[0.18em] uppercase text-ink/40 w-20 shrink-0">
                  {d.label}
                </span>
                <span className="text-[13px] text-ink/70">{d.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Divider */}
        <div className="h-px bg-ink/10 mb-6" />

        {/* Vendor */}
        <div className="bg-sand/25 p-4 mb-6">
          <p className="text-[10px] tracking-[0.2em] uppercase text-ink/40 mb-1">
            Sold by
          </p>
          <p className="text-sm text-cacao">{vendorBrand}</p>
          {vendorCity && vendorState && (
            <p className="text-xs text-ink/40 mt-0.5">
              Ships from {vendorCity}, {vendorState}
            </p>
          )}
        </div>

        {/* Shipping */}
        <ShippingEstimator
          vendorPincode={vendorPincode}
          productMrp={product.finalPrice}
        />
      </div>
    </div>
  );
}
