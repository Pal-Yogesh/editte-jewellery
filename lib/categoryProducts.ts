/**
 * Storefront catalogue taxonomy.
 *
 * Mirrors the vendor-side taxonomy in the editte dashboard
 * (`editte-jewellery/lib/product/categories.ts`), which is what every uploaded
 * product is tagged with:
 *
 *     Department  →  Group        →  Type
 *     men            jewellery       Chains, Rings, …
 *
 * A vendor product stores `department`, `categoryGroup` and `productType`, so
 * every storefront category URL resolves to an equality filter on those three
 * fields. The products themselves come from Firestore — see
 * `getProductsByCategory` in `lib/products.ts`.
 */

// ─── Taxonomy ─────────────────────────────────────────────────────────────────

export type CategoryGroup = {
  id: string;
  label: string;
  types: readonly string[];
};

export type Department = {
  id: string;
  label: string;
  groups: readonly CategoryGroup[];
};

export const DEPARTMENTS: readonly Department[] = [
  {
    id: "women",
    label: "Women",
    groups: [
      {
        id: "jewellery",
        label: "Jewellery",
        types: [
          "Neckpieces",
          "Earrings",
          "Rings",
          "Bangles",
          "Anklets",
          "Nose Pins",
          "Maang Tikka",
          "Brooches",
        ],
      },
      {
        id: "bags",
        label: "Bags",
        types: ["Clutches", "Tote Bags", "Sling Bags", "Handbags", "Potli Bags"],
      },
      {
        id: "accessories",
        label: "Accessories",
        types: ["Hair Accessories", "Sunglasses", "Watches", "Belts"],
      },
    ],
  },
  {
    id: "men",
    label: "Men",
    groups: [
      {
        id: "jewellery",
        label: "Jewellery",
        types: [
          "Chains",
          "Rings",
          "Bracelets",
          "Cufflinks",
          "Tie Pins",
          "Button Covers",
          "Lapel Pins",
        ],
      },
    ],
  },
  {
    id: "occasions",
    label: "Occasions",
    groups: [
      {
        id: "celebrations",
        label: "Celebrations",
        types: ["Bridal", "Showstopper", "Everyday", "Vacation", "Festive Finds"],
      },
    ],
  },
] as const;

// ─── Slugs ────────────────────────────────────────────────────────────────────

/** Slug used by the "View All Products" links across the nav and category pages. */
export const ALL_PRODUCTS_SLUG = "all";

export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** `/category/women-jewellery`, `/category/men-chains`, `/category/women`. */
export function categorySlug(
  departmentId: string,
  groupId?: string,
  productType?: string
): string {
  if (productType) return `${departmentId}-${slugify(productType)}`;
  if (groupId) return `${departmentId}-${groupId}`;
  return departmentId;
}

export function categoryHref(
  departmentId: string,
  groupId?: string,
  productType?: string
): string {
  return `/category/${categorySlug(departmentId, groupId, productType)}`;
}

/**
 * Slugs that shipped before the taxonomy was wired up and are still linked from
 * the home page rail, older emails and any bookmarks.
 */
const LEGACY_SLUGS: Record<string, string> = {
  bangles: "women-bangles",
  rings: "women-rings",
  earrings: "women-earrings",
  "neck-piece": "women-neckpieces",
  "mens-chain": "men-chains",
};

export type CategoryLevel = "all" | "department" | "group" | "type";

export interface CategoryRoute {
  /** Canonical slug — legacy aliases resolve to this. */
  slug: string;
  level: CategoryLevel;
  /** Page heading, e.g. "Rings". */
  label: string;
  /** Equality filters applied to the Firestore query. */
  department?: string;
  categoryGroup?: string;
  productType?: string;
  /** Breadcrumb trail above the heading, outermost first. */
  trail: { label: string; href: string }[];
}

type RouteIndex = Record<string, CategoryRoute>;

const ROUTES: RouteIndex = (() => {
  const index: RouteIndex = {
    [ALL_PRODUCTS_SLUG]: {
      slug: ALL_PRODUCTS_SLUG,
      level: "all",
      label: "All Products",
      trail: [],
    },
  };

  for (const department of DEPARTMENTS) {
    const departmentSlug = categorySlug(department.id);
    const departmentCrumb = {
      label: department.label,
      href: `/category/${departmentSlug}`,
    };

    index[departmentSlug] = {
      slug: departmentSlug,
      level: "department",
      label: department.label,
      department: department.id,
      trail: [],
    };

    for (const group of department.groups) {
      const groupSlug = categorySlug(department.id, group.id);
      const groupCrumb = { label: group.label, href: `/category/${groupSlug}` };

      index[groupSlug] = {
        slug: groupSlug,
        level: "group",
        label: group.label,
        department: department.id,
        categoryGroup: group.id,
        trail: [departmentCrumb],
      };

      for (const type of group.types) {
        const typeSlug = categorySlug(department.id, group.id, type);
        index[typeSlug] = {
          slug: typeSlug,
          level: "type",
          label: type,
          department: department.id,
          categoryGroup: group.id,
          productType: type,
          trail: [departmentCrumb, groupCrumb],
        };
      }
    }
  }

  return index;
})();

/** Every canonical slug, used for `generateStaticParams`. */
export const CATEGORY_SLUGS = Object.keys(ROUTES);

/** Resolves a URL slug (canonical or legacy) to its route, or null if unknown. */
export function resolveCategory(slug: string): CategoryRoute | null {
  return ROUTES[LEGACY_SLUGS[slug] ?? slug] ?? null;
}

/** Display name for a slug — kept for links that only need a label. */
export function categoryLabel(slug: string): string {
  return resolveCategory(slug)?.label ?? "";
}

// ─── Product shape (as rendered by the grid) ──────────────────────────────────

export interface CategoryProduct {
  id: string;
  name: string;
  /** Vendor brand name — surfaced as "designer" on the storefront. */
  designer: string;
  /** Price actually charged (after discount). */
  price: number;
  /** MRP, present only when the vendor set a discount. */
  originalPrice?: number;
  image: string;
  productType: string;
  /** Canonical slug of the product's own type, e.g. "women-rings". */
  category: string;
  /** Denormalised path, e.g. "Women / Jewellery / Rings". */
  categoryPath: string;
  colours: string[];
  material: string;
  sizes: string[];
  inStock: boolean;
}

/** Swatch colours for the Colour filter. Unlisted vendor colours fall back. */
export const COLOUR_SWATCHES: Record<string, string> = {
  Gold: "#C9A24B",
  "Rose Gold": "#D9A38B",
  Silver: "#C0C3C7",
  Oxidised: "#6E6A63",
  Emerald: "#2F6B4F",
  "Pearl White": "#F1EAE0",
  Black: "#2A2A2A",
  White: "#FFFFFF",
  Red: "#9B2C2C",
  Green: "#2F6B4F",
  Blue: "#2B4C7E",
  Pink: "#D98BA4",
  Copper: "#B87333",
  Bronze: "#8C7853",
  Platinum: "#D6D8DA",
};

/** Case-insensitive swatch lookup with a neutral fallback for free-text colours. */
export function colourSwatch(colour: string): string {
  const direct = COLOUR_SWATCHES[colour];
  if (direct) return direct;
  const match = Object.keys(COLOUR_SWATCHES).find(
    (key) => key.toLowerCase() === colour.trim().toLowerCase()
  );
  return match ? COLOUR_SWATCHES[match] : "#D9D4CC";
}

// ─── Facets ───────────────────────────────────────────────────────────────────
// Derived from whatever products the category actually returned, so a filter
// never offers an option that matches nothing.

export function getProductTypes(products: CategoryProduct[]): string[] {
  return [...new Set(products.map((p) => p.productType).filter(Boolean))].sort();
}

export function getDesigners(products: CategoryProduct[]): string[] {
  return [...new Set(products.map((p) => p.designer).filter(Boolean))].sort();
}

export function getColours(products: CategoryProduct[]): string[] {
  return [...new Set(products.flatMap((p) => p.colours).filter(Boolean))].sort();
}

export function getMaterials(products: CategoryProduct[]): string[] {
  return [...new Set(products.map((p) => p.material).filter(Boolean))].sort();
}

/**
 * Sizes come in several shapes — bangle diameters ("2.4"), ring numbers ("14"),
 * chain lengths ('18"'), and free text from the vendor. Sort numerically where
 * possible and push anything non-numeric to the end, alphabetically.
 */
export function getSizes(products: CategoryProduct[]): string[] {
  const unique = [...new Set(products.flatMap((p) => p.sizes).filter(Boolean))];
  return unique.sort((a, b) => {
    const na = parseFloat(a);
    const nb = parseFloat(b);
    const aNum = Number.isFinite(na);
    const bNum = Number.isFinite(nb);
    if (aNum && bNum) return na - nb;
    if (aNum) return -1;
    if (bNum) return 1;
    return a.localeCompare(b);
  });
}

export function getPriceRange(products: CategoryProduct[]): [number, number] {
  if (products.length === 0) return [0, 50000];
  const prices = products.map((p) => p.price);
  return [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))];
}
