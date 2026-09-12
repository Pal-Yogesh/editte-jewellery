export interface CategoryProduct {
  id: string;
  name: string;
  designer: string;
  price: number;
  originalPrice?: number;
  image: string;
  productType: string;
  category: string;
  colour: string;
  material: string;
  sizes: string[];
}

const ALL_PRODUCTS: CategoryProduct[] = [
  // ─── Bangles ────────────────────────────────────────────────────────
  { id: "b1", name: "Temple Gold Bangle", designer: "Amrapali", price: 8500, originalPrice: 10000, image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=600&fit=crop", productType: "Bangle", category: "bangles", colour: "Gold", material: "22k Gold Plated", sizes: ["2.4", "2.6", "2.8"] },
  { id: "b2", name: "Kundan Kada Set", designer: "Sangeeta Boochra", price: 12000, image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=600&fit=crop", productType: "Kada", category: "bangles", colour: "Gold", material: "Kundan", sizes: ["2.4", "2.6", "2.8"] },
  { id: "b3", name: "Floral Enamel Bangle", designer: "Ritika Sachdeva", price: 4500, image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=600&fit=crop", productType: "Bangle", category: "bangles", colour: "Rose Gold", material: "Enamel", sizes: ["2.4", "2.6"] },
  { id: "b4", name: "Pearl Thread Bangles", designer: "Lai", price: 3200, originalPrice: 4000, image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=600&fit=crop", productType: "Bangle", category: "bangles", colour: "Pearl White", material: "Pearl", sizes: ["2.4", "2.6", "2.8"] },
  { id: "b5", name: "Oxidised Silver Kada", designer: "Dhora", price: 2800, image: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=400&h=600&fit=crop", productType: "Kada", category: "bangles", colour: "Oxidised", material: "Oxidised Silver", sizes: ["2.6", "2.8"] },
  { id: "b6", name: "Meenakari Bangle Set", designer: "Tribe by Amrapali", price: 6700, image: "https://images.unsplash.com/photo-1515562141589-67f0d97a2e1b?w=400&h=600&fit=crop", productType: "Bangle", category: "bangles", colour: "Emerald", material: "Enamel", sizes: ["2.4", "2.6", "2.8"] },

  // ─── Rings ──────────────────────────────────────────────────────────
  { id: "r1", name: "Solitaire Diamond Ring", designer: "Amrapali", price: 15000, originalPrice: 18000, image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=600&fit=crop", productType: "Statement Ring", category: "rings", colour: "Silver", material: "Diamond", sizes: ["12", "14", "16", "18"] },
  { id: "r2", name: "Emerald Cocktail Ring", designer: "Ritika Sachdeva", price: 9800, image: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=400&h=600&fit=crop", productType: "Cocktail Ring", category: "rings", colour: "Emerald", material: "22k Gold Plated", sizes: ["14", "16", "18"] },
  { id: "r3", name: "Minimalist Band", designer: "Lai", price: 3500, image: "https://images.unsplash.com/photo-1589674781759-c21c37956a44?w=400&h=600&fit=crop", productType: "Band", category: "rings", colour: "Silver", material: "Sterling Silver", sizes: ["12", "14", "16", "18"] },
  { id: "r4", name: "Kundan Finger Ring", designer: "Sangeeta Boochra", price: 5600, image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400&h=600&fit=crop", productType: "Statement Ring", category: "rings", colour: "Gold", material: "Kundan", sizes: ["14", "16"] },
  { id: "r5", name: "Oxidised Boho Ring", designer: "Dhora", price: 2200, originalPrice: 2800, image: "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=400&h=600&fit=crop", productType: "Band", category: "rings", colour: "Oxidised", material: "Oxidised Silver", sizes: ["12", "14", "16"] },
  { id: "r6", name: "Pearl Cluster Ring", designer: "Tribe by Amrapali", price: 7200, image: "https://images.unsplash.com/photo-1598560917505-59a3ad559071?w=400&h=600&fit=crop", productType: "Cocktail Ring", category: "rings", colour: "Pearl White", material: "Pearl", sizes: ["14", "16", "18"] },

  // ─── Earrings ───────────────────────────────────────────────────────
  { id: "e1", name: "Chandbali Earrings", designer: "Amrapali", price: 11000, originalPrice: 14000, image: "https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=400&h=600&fit=crop", productType: "Chandbali", category: "earrings", colour: "Gold", material: "22k Gold Plated", sizes: ["One Size"] },
  { id: "e2", name: "Jhumka Drop Earrings", designer: "Sangeeta Boochra", price: 6500, image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=400&h=600&fit=crop", productType: "Jhumka", category: "earrings", colour: "Silver", material: "Sterling Silver", sizes: ["One Size"] },
  { id: "e3", name: "Stud Pearl Earrings", designer: "Lai", price: 3800, image: "https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=400&h=600&fit=crop", productType: "Studs", category: "earrings", colour: "Pearl White", material: "Pearl", sizes: ["One Size"] },
  { id: "e4", name: "Polki Hoop Earrings", designer: "Ritika Sachdeva", price: 8900, image: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=400&h=600&fit=crop", productType: "Hoops", category: "earrings", colour: "Gold", material: "Kundan", sizes: ["One Size"] },
  { id: "e5", name: "Tassel Drop Earrings", designer: "Dhora", price: 4200, originalPrice: 5000, image: "https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=400&h=600&fit=crop", productType: "Drop", category: "earrings", colour: "Rose Gold", material: "Brass", sizes: ["One Size"] },
  { id: "e6", name: "Temple Jhumka", designer: "Tribe by Amrapali", price: 7800, image: "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=400&h=600&fit=crop", productType: "Jhumka", category: "earrings", colour: "Gold", material: "22k Gold Plated", sizes: ["One Size"] },

  // ─── Neck Pieces ────────────────────────────────────────────────────
  { id: "n1", name: "Layered Pearl Necklace", designer: "Amrapali", price: 18000, originalPrice: 22000, image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=400&h=600&fit=crop", productType: "Necklace", category: "neck-piece", colour: "Pearl White", material: "Pearl", sizes: ['16"', '18"'] },
  { id: "n2", name: "Kundan Choker", designer: "Sangeeta Boochra", price: 14500, image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=600&fit=crop&crop=top", productType: "Choker", category: "neck-piece", colour: "Gold", material: "Kundan", sizes: ['14"', '16"'] },
  { id: "n3", name: "Pendant Chain", designer: "Lai", price: 5200, image: "https://images.unsplash.com/photo-1515562141589-67f0d97a2e1b?w=400&h=600&fit=crop&crop=center", productType: "Pendant", category: "neck-piece", colour: "Silver", material: "Sterling Silver", sizes: ['16"', '18"', '20"'] },
  { id: "n4", name: "Temple Haar Set", designer: "Ritika Sachdeva", price: 25000, image: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=400&h=600&fit=crop", productType: "Haar", category: "neck-piece", colour: "Gold", material: "22k Gold Plated", sizes: ['18"', '20"'] },
  { id: "n5", name: "Oxidised Collar Necklace", designer: "Dhora", price: 6800, originalPrice: 8000, image: "https://images.unsplash.com/photo-1583292650898-7d22cd27ca6f?w=400&h=600&fit=crop", productType: "Collar", category: "neck-piece", colour: "Oxidised", material: "Oxidised Silver", sizes: ['16"', '18"'] },
  { id: "n6", name: "Beaded Statement Necklace", designer: "Tribe by Amrapali", price: 9500, image: "https://images.unsplash.com/photo-1600721391776-b5cd0e0048f9?w=400&h=600&fit=crop", productType: "Necklace", category: "neck-piece", colour: "Emerald", material: "Brass", sizes: ['18"', '20"'] },

  // ─── Men's Chain ────────────────────────────────────────────────────
  { id: "m1", name: "Cuban Link Chain", designer: "Amrapali", price: 12000, originalPrice: 15000, image: "https://images.unsplash.com/photo-1619119069152-a2b331eb392a?w=400&h=600&fit=crop", productType: "Chain", category: "mens-chain", colour: "Gold", material: "22k Gold Plated", sizes: ['20"', '22"', '24"'] },
  { id: "m2", name: "Rope Gold Chain", designer: "Lai", price: 8500, image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400&h=600&fit=crop&crop=center", productType: "Chain", category: "mens-chain", colour: "Gold", material: "22k Gold Plated", sizes: ['20"', '22"'] },
  { id: "m3", name: "Figaro Silver Chain", designer: "Dhora", price: 4800, image: "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=400&h=600&fit=crop&crop=top", productType: "Chain", category: "mens-chain", colour: "Silver", material: "Sterling Silver", sizes: ['20"', '22"', '24"'] },
  { id: "m4", name: "Box Chain Necklace", designer: "Sangeeta Boochra", price: 6200, image: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=400&h=600&fit=crop&crop=center", productType: "Chain", category: "mens-chain", colour: "Silver", material: "Sterling Silver", sizes: ['22"', '24"'] },
  { id: "m5", name: "Pendant Chain Set", designer: "Ritika Sachdeva", price: 9800, originalPrice: 12000, image: "https://images.unsplash.com/photo-1598560917505-59a3ad559071?w=400&h=600&fit=crop&crop=top", productType: "Chain", category: "mens-chain", colour: "Black", material: "Brass", sizes: ['20"', '22"'] },
  { id: "m6", name: "Layered Men's Chain", designer: "Tribe by Amrapali", price: 7500, image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=600&fit=crop&crop=center", productType: "Chain", category: "mens-chain", colour: "Oxidised", material: "Oxidised Silver", sizes: ['22"', '24"'] },
];

/** Slug used by the "View All Products" links across the nav and category pages. */
export const ALL_PRODUCTS_SLUG = "all";

export const CATEGORY_MAP: Record<string, string> = {
  [ALL_PRODUCTS_SLUG]: "All Products",
  bangles: "Bangles",
  rings: "Rings",
  earrings: "Earrings",
  "neck-piece": "Neck Piece",
  "mens-chain": "Men's Chain",
};

/** Real product categories, excluding the synthetic "all" bucket. */
export const SHOP_CATEGORIES = Object.keys(CATEGORY_MAP).filter(
  (slug) => slug !== ALL_PRODUCTS_SLUG,
);

/** Swatch colours for the Colour filter. Keys match `CategoryProduct.colour`. */
export const COLOUR_SWATCHES: Record<string, string> = {
  Gold: "#C9A24B",
  "Rose Gold": "#D9A38B",
  Silver: "#C0C3C7",
  Oxidised: "#6E6A63",
  Emerald: "#2F6B4F",
  "Pearl White": "#F1EAE0",
  Black: "#2A2A2A",
};

export function getProductsByCategory(slug: string): CategoryProduct[] {
  if (slug === ALL_PRODUCTS_SLUG) return ALL_PRODUCTS;
  return ALL_PRODUCTS.filter((p) => p.category === slug);
}

export function getProductTypes(products: CategoryProduct[]): string[] {
  return [...new Set(products.map((p) => p.productType))].sort();
}

export function getDesigners(products: CategoryProduct[]): string[] {
  return [...new Set(products.map((p) => p.designer))].sort();
}

export function getColours(products: CategoryProduct[]): string[] {
  return [...new Set(products.map((p) => p.colour))].sort();
}

export function getMaterials(products: CategoryProduct[]): string[] {
  return [...new Set(products.map((p) => p.material))].sort();
}

/**
 * Sizes come in three shapes — bangle diameters ("2.4"), ring numbers ("14"),
 * chain lengths ('18"') and the catch-all "One Size". Sort each numerically
 * within its shape and push "One Size" to the end.
 */
export function getSizes(products: CategoryProduct[]): string[] {
  const unique = [...new Set(products.flatMap((p) => p.sizes))];
  return unique.sort((a, b) => {
    if (a === "One Size") return 1;
    if (b === "One Size") return -1;
    return parseFloat(a) - parseFloat(b);
  });
}

export function getPriceRange(products: CategoryProduct[]): [number, number] {
  if (products.length === 0) return [0, 50000];
  const prices = products.map((p) => p.price);
  return [Math.min(...prices), Math.max(...prices)];
}
