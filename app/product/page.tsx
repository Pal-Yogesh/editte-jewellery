import { redirect } from "next/navigation";
import { ALL_PRODUCTS_SLUG } from "@/lib/categoryProducts";

/**
 * `/product` has no product of its own — it used to hold a hardcoded design
 * sample. Send visitors to the full catalogue instead; individual products live
 * at `/product/[id]`.
 */
export default function ProductIndexPage() {
  redirect(`/category/${ALL_PRODUCTS_SLUG}`);
}
