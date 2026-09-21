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
 * and "DESIGNERS" are deliberately excluded: those are curated placements the
 * admin assigns later, not something a vendor picks at upload time. Men's own
 * "NEW IN" group is excluded for the same reason.
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
