"use client";
import { useActionState } from "react";
import { addToWishlistAction } from "@/app/actions/wishlist";
import type { ApprovedProduct } from "@/lib/products";

function ProductCard({ product, isInWishlist }: { product: ApprovedProduct; isInWishlist: boolean }) {
  const [state, action, pending] = useActionState(addToWishlistAction, undefined);
  const added = state?.success || isInWishlist;

  return (
    <div className="bg-white rounded-xl border border-ink/5 overflow-hidden group">
      <div className="aspect-square overflow-hidden relative">
        {product.image ? (
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-sand/30 flex items-center justify-center text-ink/20 text-sm">
            No image
          </div>
        )}
        <form action={action} className="absolute top-2 right-2">
          <input type="hidden" name="productId" value={product.id} />
          <input type="hidden" name="name" value={product.title} />
          <input type="hidden" name="image" value={product.image} />
          <input type="hidden" name="price" value={product.finalPrice} />
          <input type="hidden" name="category" value={product.category} />
          <button
            type="submit"
            disabled={pending || added}
            title={added ? "Already in wishlist" : "Add to wishlist"}
            className={`w-7 h-7 rounded-full flex items-center justify-center shadow text-sm transition-colors ${
              added
                ? "bg-rose text-white cursor-default"
                : "bg-white/90 text-ink/40 hover:bg-rose hover:text-white"
            }`}
          >
            {added ? "♥" : "♡"}
          </button>
        </form>
        {product.discountPercent > 0 && (
          <span className="absolute top-2 left-2 bg-sage text-white text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-full">
            {product.discountPercent}% off
          </span>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs text-ink/40 uppercase tracking-wider mb-1">{product.category}</p>
        <p className="font-heading text-cacao text-sm truncate">{product.title}</p>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-ink/80 text-sm font-medium">
            ₹{product.finalPrice.toLocaleString("en-IN")}
          </p>
          {product.discountPercent > 0 && (
            <p className="text-ink/30 text-xs line-through">
              ₹{product.price.toLocaleString("en-IN")}
            </p>
          )}
        </div>
        {product.brandName && (
          <p className="text-[10px] text-ink/30 mt-1.5 uppercase tracking-wider">
            {product.brandName}
          </p>
        )}
      </div>
    </div>
  );
}

interface Props {
  products: ApprovedProduct[];
  wishlistProductIds: string[];
}

export default function ProductsGrid({ products, wishlistProductIds }: Props) {
  if (products.length === 0) {
    return (
      <p className="text-ink/40 text-sm text-center py-8">
        No products available yet. Check back soon.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          isInWishlist={wishlistProductIds.includes(product.id)}
        />
      ))}
    </div>
  );
}
