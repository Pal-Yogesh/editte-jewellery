/**
 * Product taxonomy — the single source of truth for vendor-selectable categories.
 *
 * Mirrors the storefront navigation (new-jewellery `components/ZaraNavbar.tsx`),
 * which is three levels deep:
 *
 *     Department  →  Group        →  Type
 *     MEN            JEWELLERY       Chains, Rings, …
 *
 * Only the three *merchandising* departments are listed here. "NEW IN", "SALE"
 * and "DESIGNERS" are not departments — a sale ring is still a Women /
 * Jewellery / Ring. They are *placements*: see `PLACEMENTS` below. A vendor
 * requests them alongside the category, and an admin decides which requests
 * actually go live. Men's own "NEW IN" group is excluded for the same reason.
 */

export type DepartmentId = "women" | "men" | "occasions";

export type CategoryGroup = {
  id: string;
  label: string;
  types: readonly string[];
};

export type Department = {
  id: DepartmentId;
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
        types: [
          "Bridal",
          "Showstopper",
          "Everyday",
          "Vacation",
          "Festive Finds",
        ],
      },
    ],
  },
] as const;

// ─── Lookups ──────────────────────────────────────────────────────────────────

export function getDepartment(id: string): Department | undefined {
  return DEPARTMENTS.find((d) => d.id === id);
}

export function getGroup(
  departmentId: string,
  groupId: string
): CategoryGroup | undefined {
  return getDepartment(departmentId)?.groups.find((g) => g.id === groupId);
}

/** True only when department → group → type is a complete, valid path. */
export function isValidCategory(
  departmentId: string,
  groupId: string,
  productType: string
): boolean {
  const group = getGroup(departmentId, groupId);
  if (!group) return false;
  return group.types.some(
    (t) => t.toLowerCase() === productType.trim().toLowerCase()
  );
}

/**
 * Human-readable path stored alongside the structured ids, e.g.
 * "Men / Jewellery / Chains". Kept denormalised so listings and the admin
 * approval queue can render a category without walking the tree.
 */
export function formatCategoryPath(
  departmentId: string,
  groupId: string,
  productType: string
): string {
  const department = getDepartment(departmentId);
  const group = getGroup(departmentId, groupId);
  if (!department || !group) return "";
  return [department.label, group.label, productType.trim()]
    .filter(Boolean)
    .join(" / ");
}

// ─── Text resolution (Excel import) ───────────────────────────────────────────
// Spreadsheet cells carry labels ("Men"), not ids ("men"), and vendors will not
// match our casing. These resolve loosely and return the canonical value.

export function resolveDepartment(text: string): Department | undefined {
  const needle = text.trim().toLowerCase();
  if (!needle) return undefined;
  return DEPARTMENTS.find(
    (d) => d.id === needle || d.label.toLowerCase() === needle
  );
}

export function resolveGroup(
  department: Department,
  text: string
): CategoryGroup | undefined {
  const needle = text.trim().toLowerCase();
  if (!needle) return undefined;
  return department.groups.find(
    (g) => g.id === needle || g.label.toLowerCase() === needle
  );
}

/** Returns the canonically-cased type name, e.g. "chains" → "Chains". */
export function resolveType(
  group: CategoryGroup,
  text: string
): string | undefined {
  const needle = text.trim().toLowerCase();
  if (!needle) return undefined;
  return group.types.find((t) => t.toLowerCase() === needle);
}

/** Comma-joined option list for spreadsheet help text / validation messages. */
export function departmentLabels(): string {
  return DEPARTMENTS.map((d) => d.label).join(", ");
}

export function groupLabels(departmentId: string): string {
  return (
    getDepartment(departmentId)
      ?.groups.map((g) => g.label)
      .join(", ") ?? ""
  );
}

/** Every distinct sub-category label across all departments. */
export function allGroupLabels(): string[] {
  const seen = new Set<string>();
  for (const d of DEPARTMENTS) for (const g of d.groups) seen.add(g.label);
  return [...seen];
}

/** Every distinct product-type label across all sub-categories. */
export function allTypeLabels(): string[] {
  const seen = new Set<string>();
  for (const d of DEPARTMENTS)
    for (const g of d.groups) for (const t of g.types) seen.add(t);
  return [...seen];
}

// ─── Placements ───────────────────────────────────────────────────────────────
// The storefront rails that are curated rather than merchandised: NEW IN and
// SALE in the navbar. They mirror the navbar two levels deep, exactly like the
// category tree does:
//
//     Placement   →  Group     →  Rail
//     NEW IN         LATEST       New Arrivals, Best Sellers, …
//     SALE           OFFERS       All Sale Items, Last Chance, …
//
// A product keeps its real category and additionally *requests* one or more
// rails; the admin grants each request separately, so ten vendors can ask for
// "Last Chance" and only three appear there.
//
// DESIGNERS is deliberately absent: that rail lists the registered vendors
// themselves, built from the vendor directory, not from product submissions.

export type PlacementRail = {
  /** Composite id stored on the product, e.g. "sale:last-chance". */
  id: string;
  label: string;
};

export type Placement = {
  id: string;
  label: string;
  /** The navbar's section heading, e.g. "LATEST". */
  groupLabel: string;
  /** Shown next to the vendor's checkbox, so the ask is self-explanatory. */
  hint: string;
  rails: readonly PlacementRail[];
};

function rails(placementId: string, labels: string[]): PlacementRail[] {
  return labels.map((label) => ({
    id: `${placementId}:${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    label,
  }));
}

export const PLACEMENTS: readonly Placement[] = [
  {
    id: "new-in",
    label: "New In",
    groupLabel: "Latest",
    hint: "A fresh launch you want featured on the New In rails.",
    rails: rails("new-in", [
      "New Arrivals",
      "Best Sellers",
      "Just Restocked",
      "Trending Now",
    ]),
  },
  {
    id: "sale",
    label: "Sale",
    groupLabel: "Offers",
    hint: "Discounted — ask to be included in the Sale rails.",
    rails: rails("sale", [
      "All Sale Items",
      "Jewellery on Sale",
      "Bags on Sale",
      "Accessories on Sale",
      "Last Chance",
    ]),
  },
] as const;

/** Every rail across every placement, flattened. */
export const PLACEMENT_RAILS: readonly PlacementRail[] = PLACEMENTS.flatMap(
  (p) => p.rails
);

export function getPlacement(id: string): Placement | undefined {
  return PLACEMENTS.find((p) => p.id === id);
}

export function getPlacementRail(id: string): PlacementRail | undefined {
  return PLACEMENT_RAILS.find((r) => r.id === id);
}

/** The placement a rail belongs to — "sale:last-chance" → the Sale placement. */
export function placementOfRail(railId: string): Placement | undefined {
  return getPlacement(railId.split(":")[0]);
}

/**
 * Valid ids are a rail ("sale:last-chance") or a bare placement ("sale").
 * The bare form is what products created before rails existed still carry; it
 * means "on the Sale rail generally".
 */
export function isValidPlacement(id: string): boolean {
  return Boolean(getPlacementRail(id) || getPlacement(id));
}

/**
 * Keeps only known ids, removes duplicates, and returns them in the canonical
 * order above so stored arrays are stable and comparable.
 */
export function normalisePlacements(ids: readonly string[]): string[] {
  const wanted = new Set(ids.map((id) => id.trim().toLowerCase()));
  const ordered: string[] = [];
  for (const placement of PLACEMENTS) {
    if (wanted.has(placement.id)) ordered.push(placement.id);
    for (const rail of placement.rails) {
      if (wanted.has(rail.id)) ordered.push(rail.id);
    }
  }
  return ordered;
}

/**
 * Resolves a spreadsheet cell to a placement id. Rail names are unique across
 * placements, so a vendor can write "Last Chance" or the fuller
 * "Sale > Last Chance"; a bare "Sale" lands on that placement's first rail.
 */
export function resolvePlacement(text: string): PlacementRail | undefined {
  const needle = text.trim().toLowerCase();
  if (!needle) return undefined;

  // "Sale > Last Chance" / "Sale: Last Chance" — take the part after the arrow.
  const tail = needle.split(/[>:]/).pop()!.trim();

  const rail = PLACEMENT_RAILS.find(
    (r) => r.id === needle || r.id === tail || r.label.toLowerCase() === tail
  );
  if (rail) return rail;

  const placement = PLACEMENTS.find(
    (p) => p.id === needle || p.label.toLowerCase() === needle
  );
  return placement?.rails[0];
}

/** Comma-joined option list for spreadsheet help text / validation messages. */
export function placementLabels(): string {
  return PLACEMENTS.map(
    (p) => `${p.label} — ${p.rails.map((r) => r.label).join(" / ")}`
  ).join(" · ");
}

/** "sale:last-chance" → "Sale / Last Chance" for display. */
export function formatPlacement(id: string): string {
  const rail = getPlacementRail(id);
  if (rail) return `${placementOfRail(id)!.label} / ${rail.label}`;
  return getPlacement(id)?.label ?? id;
}

export function formatPlacements(ids: readonly string[]): string {
  return normalisePlacements(ids).map(formatPlacement).join(", ");
}
