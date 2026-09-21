/**
 * Single source of truth for the bulk-upload Excel schema.
 * Both the template generator and the row parser reference this.
 */

export type ExcelColumn = {
  key: string;
  header: string;
  width: number;
  required: boolean;
  note?: string;
};

export const EXCEL_COLUMNS: ExcelColumn[] = [
  { key: "title",           header: "Product Title *",     width: 30, required: true },
  { key: "description",     header: "Description",          width: 40, required: false },
  { key: "price",           header: "Price ₹ *",            width: 12, required: true,  note: "Original / MRP" },
  { key: "discountPercent", header: "Discount %",           width: 12, required: false, note: "0–100, leave blank for 0" },
  { key: "metal",           header: "Metal",                width: 16, required: false, note: "e.g. 22K Gold, 925 Silver" },
  { key: "colors",          header: "Colors",               width: 20, required: false, note: "Comma-separated, e.g. Gold, Rose Gold" },
  { key: "size",            header: "Size",                 width: 14, required: false, note: "e.g. 6, 7, Free size" },
  { key: "weightGrams",     header: "Weight (g) *",         width: 12, required: true,  note: "Product weight in grams, e.g. 12.5" },
  { key: "department",      header: "Category *",           width: 14, required: true,  note: "Women, Men or Occasions" },
  { key: "categoryGroup",   header: "Sub-category *",       width: 16, required: true,  note: "Women: Jewellery, Bags, Accessories · Men: Jewellery · Occasions: Celebrations" },
  { key: "productType",     header: "Product Type *",       width: 18, required: true,  note: "e.g. Chains, Rings, Neckpieces — must belong to the sub-category" },
  { key: "brandName",       header: "Brand Name",           width: 20, required: false, note: "Leave blank to use your default brand" },
  { key: "quantity",        header: "Quantity",             width: 10, required: false },
  { key: "minQuantity",     header: "Min Qty Alert",        width: 12, required: false, note: "Alert when stock drops to this level, 0 = no alert" },
  { key: "sku",             header: "SKU *",                width: 16, required: true,  note: "Unique identifier for this product" },
];

export const PRICE_COL_INDEX = EXCEL_COLUMNS.findIndex((c) => c.key === "price");
export const DISC_COL_INDEX  = EXCEL_COLUMNS.findIndex((c) => c.key === "discountPercent");
