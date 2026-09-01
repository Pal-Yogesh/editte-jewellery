export interface CategoryProduct {
  id: string;
  name: string;
  designer: string;
  price: number;
  originalPrice?: number;
  image: string;
  productType: string;
  category: string;
}

const ALL_PRODUCTS: CategoryProduct[] = [
  // ─── Bangles ────────────────────────────────────────────────────────
  { id: "b1", name: "Temple Gold Bangle", designer: "Amrapali", price: 8500, originalPrice: 10000, image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=600&fit=crop", productType: "Bangle", category: "bangles" },
  { id: "b2", name: "Kundan Kada Set", designer: "Sangeeta Boochra", price: 12000, image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=600&fit=crop", productType: "Kada", category: "bangles" },
  { id: "b3", name: "Floral Enamel Bangle", designer: "Ritika Sachdeva", price: 4500, image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=600&fit=crop", productType: "Bangle", category: "bangles" },
  { id: "b4", name: "Pearl Thread Bangles", designer: "Lai", price: 3200, originalPrice: 4000, image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=600&fit=crop", productType: "Bangle", category: "bangles" },
  { id: "b5", name: "Oxidised Silver Kada", designer: "Dhora", price: 2800, image: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=400&h=600&fit=crop", productType: "Kada", category: "bangles" },
  { id: "b6", name: "Meenakari Bangle Set", designer: "Tribe by Amrapali", price: 6700, image: "https://images.unsplash.com/photo-1515562141589-67f0d97a2e1b?w=400&h=600&fit=crop", productType: "Bangle", category: "bangles" },

  // ─── Rings ──────────────────────────────────────────────────────────
  { id: "r1", name: "Solitaire Diamond Ring", designer: "Amrapali", price: 15000, originalPrice: 18000, image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=600&fit=crop", productType: "Statement Ring", category: "rings" },
  { id: "r2", name: "Emerald Cocktail Ring", designer: "Ritika Sachdeva", price: 9800, image: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=400&h=600&fit=crop", productType: "Cocktail Ring", category: "rings" },
  { id: "r3", name: "Minimalist Band", designer: "Lai", price: 3500, image: "https://images.unsplash.com/photo-1589674781759-c21c37956a44?w=400&h=600&fit=crop", productType: "Band", category: "rings" },
  { id: "r4", name: "Kundan Finger Ring", designer: "Sangeeta Boochra", price: 5600, image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400&h=600&fit=crop", productType: "Statement Ring", category: "rings" },
  { id: "r5", name: "Oxidised Boho Ring", designer: "Dhora", price: 2200, originalPrice: 2800, image: "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=400&h=600&fit=crop", productType: "Band", category: "rings" },
  { id: "r6", name: "Pearl Cluster Ring", designer: "Tribe by Amrapali", price: 7200, image: "https://images.unsplash.com/photo-1598560917505-59a3ad559071?w=400&h=600&fit=crop", productType: "Cocktail Ring", category: "rings" },

  // ─── Earrings ───────────────────────────────────────────────────────
  { id: "e1", name: "Chandbali Earrings", designer: "Amrapali", price: 11000, originalPrice: 14000, image: "https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=400&h=600&fit=crop", productType: "Chandbali", category: "earrings" },
  { id: "e2", name: "Jhumka Drop Earrings", designer: "Sangeeta Boochra", price: 6500, image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=400&h=600&fit=crop", productType: "Jhumka", category: "earrings" },
  { id: "e3", name: "Stud Pearl Earrings", designer: "Lai", price: 3800, image: "https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=400&h=600&fit=crop", productType: "Studs", category: "earrings" },
  { id: "e4", name: "Polki Hoop Earrings", designer: "Ritika Sachdeva", price: 8900, image: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=400&h=600&fit=crop", productType: "Hoops", category: "earrings" },
  { id: "e5", name: "Tassel Drop Earrings", designer: "Dhora", price: 4200, originalPrice: 5000, image: "https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=400&h=600&fit=crop", productType: "Drop", category: "earrings" },
  { id: "e6", name: "Temple Jhumka", designer: "Tribe by Amrapali", price: 7800, image: "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=400&h=600&fit=crop", productType: "Jhumka", category: "earrings" },

  // ─── Neck Pieces ────────────────────────────────────────────────────
  { id: "n1", name: "Layered Pearl Necklace", designer: "Amrapali", price: 18000, originalPrice: 22000, image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=400&h=600&fit=crop", productType: "Necklace", category: "neck-piece" },
  { id: "n2", name: "Kundan Choker", designer: "Sangeeta Boochra", price: 14500, image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=600&fit=crop&crop=top", productType: "Choker", category: "neck-piece" },
  { id: "n3", name: "Pendant Chain", designer: "Lai", price: 5200, image: "https://images.unsplash.com/photo-1515562141589-67f0d97a2e1b?w=400&h=600&fit=crop&crop=center", productType: "Pendant", category: "neck-piece" },
  { id: "n4", name: "Temple Haar Set", designer: "Ritika Sachdeva", price: 25000, image: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=400&h=600&fit=crop", productType: "Haar", category: "neck-piece" },
  { id: "n5", name: "Oxidised Collar Necklace", designer: "Dhora", price: 6800, originalPrice: 8000, image: "https://images.unsplash.com/photo-1583292650898-7d22cd27ca6f?w=400&h=600&fit=crop", productType: "Collar", category: "neck-piece" },
  { id: "n6", name: "Beaded Statement Necklace", designer: "Tribe by Amrapali", price: 9500, image: "https://images.unsplash.com/photo-1600721391776-b5cd0e0048f9?w=400&h=600&fit=crop", productType: "Necklace", category: "neck-piece" },

  // ─── Men's Chain ────────────────────────────────────────────────────
  { id: "m1", name: "Cuban Link Chain", designer: "Amrapali", price: 12000, originalPrice: 15000, image: "https://images.unsplash.com/photo-1619119069152-a2b331eb392a?w=400&h=600&fit=crop", productType: "Chain", category: "mens-chain" },
  { id: "m2", name: "Rope Gold Chain", designer: "Lai", price: 8500, image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400&h=600&fit=crop&crop=center", productType: "Chain", category: "mens-chain" },
  { id: "m3", name: "Figaro Silver Chain", designer: "Dhora", price: 4800, image: "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=400&h=600&fit=crop&crop=top", productType: "Chain", category: "mens-chain" },
  { id: "m4", name: "Box Chain Necklace", designer: "Sangeeta Boochra", price: 6200, image: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=400&h=600&fit=crop&crop=center", productType: "Chain", category: "mens-chain" },
  { id: "m5", name: "Pendant Chain Set", designer: "Ritika Sachdeva", price: 9800, originalPrice: 12000, image: "https://images.unsplash.com/photo-1598560917505-59a3ad559071?w=400&h=600&fit=crop&crop=top", productType: "Chain", category: "mens-chain" },
  { id: "m6", name: "Layered Men's Chain", designer: "Tribe by Amrapali", price: 7500, image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=600&fit=crop&crop=center", productType: "Chain", category: "mens-chain" },
];

export const CATEGORY_MAP: Record<string, string> = {
  bangles: "Bangles",
  rings: "Rings",
  earrings: "Earrings",
  "neck-piece": "Neck Piece",
  "mens-chain": "Men's Chain",
};

export function getProductsByCategory(slug: string): CategoryProduct[] {
  return ALL_PRODUCTS.filter((p) => p.category === slug);
}

export function getProductTypes(products: CategoryProduct[]): string[] {
  return [...new Set(products.map((p) => p.productType))].sort();
}

export function getDesigners(products: CategoryProduct[]): string[] {
  return [...new Set(products.map((p) => p.designer))].sort();
}

export function getPriceRange(products: CategoryProduct[]): [number, number] {
  if (products.length === 0) return [0, 50000];
  const prices = products.map((p) => p.price);
  return [Math.min(...prices), Math.max(...prices)];
}
