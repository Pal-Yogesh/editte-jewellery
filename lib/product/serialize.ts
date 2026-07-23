import { signPath } from "@/lib/vendor/storage";
import type { ProductMediaKind, ProductRecord } from "@/lib/product/types";

export type PublicProductMedia = {
  id: string;
  kind: ProductMediaKind;
  contentType: string;
  url: string;
};

export type PublicProduct = Omit<ProductRecord, "media"> & {
  media: PublicProductMedia[];
};

/** Converts a stored product into a client-safe object with signed media URLs. */
export async function serializeProduct(
  product: ProductRecord
): Promise<PublicProduct> {
  const media = await Promise.all(
    product.media.map(async (m) => ({
      id: m.id,
      kind: m.kind,
      contentType: m.contentType,
      url: await signPath(m.path),
    }))
  );

  return { ...product, media };
}
